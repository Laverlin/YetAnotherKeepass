/* eslint-disable class-methods-use-this */
import fs from 'fs';
import { BrowserWindow, dialog, ipcMain, IpcMainEvent, shell } from 'electron';
import {
  Credentials,
  CryptoEngine,
  Kdbx,
  KdbxBinary,
  KdbxBinaryWithHash,
  KdbxCustomIcon,
  KdbxError,
  ProtectedValue,
} from 'kdbxweb';
import path from 'path';
import { RenderSetting } from '../entity/RenderSetting';
import { ReadKdbxResult } from '../entity/ReadKdbxResult';
import { YakpError } from '../entity/YakpError';
import { argon2Hash } from '../argon';
import { Setting } from '../entity/Setting';
import { YaKeepassSetting } from '../entity/YaKeepassSetting';
import { IpcChannels } from './IpcChannels';
import { YakpMetadata } from '../entity/YakpMetadata';
import { CustomIcon } from '../entity/CustomIcon';
import { YakpItemChanges } from '../entity/YakpItemChanges';
import { ItemHelper } from '../entity/ItemHelper';

export type SystemCommand = 'minimize' | 'maximize' | 'restore' | 'exit' | 'openUrl';

export class IpcDispatcher {
  private yaKeepassSetting: YaKeepassSetting;

  private database: Kdbx | undefined;

  private kdbxFilePath: string | undefined;

  constructor(yaKeepassSetting: YaKeepassSetting) {
    this.yaKeepassSetting = yaKeepassSetting;
    this.onReadKdbx = this.onReadKdbx.bind(this);
    this.onOpenFile = this.onOpenFile.bind(this);
    this.onSettings = this.onSettings.bind(this);
    this.onSystemCommand = this.onSystemCommand.bind(this);
    this.subscribeOnIpcEvents = this.subscribeOnIpcEvents.bind(this);
  }

  subscribeOnIpcEvents() {
    ipcMain.on(IpcChannels.openFile, this.onOpenFile);
    ipcMain.on(IpcChannels.settings, (event, setting?: RenderSetting) => this.onSettings(event, setting));
    ipcMain.on(IpcChannels.readKdbx, (event, kdbxFilePath: string, value: Uint8Array, salt: Uint8Array) =>
      this.onReadKdbx(event, kdbxFilePath, value, salt)
    );
    ipcMain.on(IpcChannels.systemCommand, (_, command: SystemCommand, param?: string) =>
      this.onSystemCommand(command, param)
    );
    ipcMain.on(IpcChannels.customIcon, this.handleCustomIcon);
    ipcMain.on(IpcChannels.attachemnt, (event, entrySid: string, key?: string) =>
      this.handleAttachment(event, entrySid, key)
    );
    ipcMain.on(IpcChannels.changes, (event, changes: YakpItemChanges) => this.handleSaveChanges(event, changes));
  }

  async handleSaveChanges(event: IpcMainEvent, changes: YakpItemChanges) {
    try {
      if (!this.database || !this.kdbxFilePath) throw Error('no database');
      const kdbxIcons = this.database.meta.customIcons;
      const kdb = this.database;

      // delete removed icons
      //
      kdbxIcons.forEach((_, key) => {
        if (!changes.Icons.find((i) => i.key === key)) kdbxIcons.delete(key);
      });

      // add new icons
      //
      changes.Icons.forEach((i) => {
        if (!kdbxIcons.has(i.key)) {
          const iconData: KdbxCustomIcon = {
            name: i.key,
            data: CustomIcon.toBinary(i),
          };
          kdbxIcons.set(i.key, iconData);
        }
      });

      // update item data
      //
      changes.Items.filter((i) => i.isChanged)
        .map((i) => ItemHelper.fromSerialized(i))
        .forEach((i) => {
          ItemHelper.toKdbx(i, kdb, changes.Items);
        });

      // update order in changed group
      //
      changes.Items.filter((i) => i.isChanged && i.isGroup && i.parentSid).forEach((i) => {
        ItemHelper.reorderSiblings(i.parentSid || '', changes.Items, kdb);
      });

      // save db to disk
      //
      const db = await this.database.save();
      fs.writeFileSync(this.kdbxFilePath, Buffer.from(db));
      event.reply(IpcChannels.changes, true);
    } catch (e) {
      console.log(e);
      event.reply(IpcChannels.changes, false);
    }
  }

  async onSystemCommand(command: SystemCommand, param?: string) {
    switch (command) {
      case 'exit':
        BrowserWindow.getFocusedWindow()?.close();
        break;
      case 'minimize':
        BrowserWindow.getFocusedWindow()?.minimize();
        break;
      case 'maximize':
        BrowserWindow.getFocusedWindow()?.maximize();
        break;
      case 'restore':
        BrowserWindow.getFocusedWindow()?.restore();
        break;
      case 'openUrl':
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        param && shell.openExternal(param);
        break;
      default:
        throw Error('unknown command');
    }
  }

  async handleAttachment(event: IpcMainEvent, entrySid: string, key?: string) {
    if (!key) {
      const files = dialog.showOpenDialogSync({ properties: ['openFile'] });
      if (!files) {
        event.reply(IpcChannels.attachemnt);
        return;
      }
      const attachments: string[] = [];
      const kdbxEntry = this.database?.getDefaultGroup().entries.find((e) => e.uuid.id === entrySid);
      if (kdbxEntry) {
        kdbxEntry.times.update();
        kdbxEntry.pushHistory();
        files.forEach((file) => {
          const buffer = fs.readFileSync(file);
          const binary: KdbxBinary = new Uint8Array(buffer).buffer;
          attachments.push(path.basename(file));
          kdbxEntry.binaries.set(path.basename(file), binary);
        });
      }
      event.reply(IpcChannels.attachemnt, attachments);
    } else {
      const filePath = dialog.showSaveDialogSync({ defaultPath: key });
      if (!filePath) return;

      const kdbxEntry = this.database?.getDefaultGroup().entries.find((e) => e.uuid.id === entrySid);
      let buffer = kdbxEntry?.binaries.get(key);
      if (!buffer) return;

      buffer = (buffer as KdbxBinaryWithHash).value ? (buffer as KdbxBinaryWithHash).value : (buffer as KdbxBinary);
      const data = buffer instanceof ProtectedValue ? buffer.getBinary() : buffer;
      fs.writeFileSync(filePath, new Uint8Array(data));
    }
  }

  async handleCustomIcon(event: IpcMainEvent) {
    const files = dialog.showOpenDialogSync({
      properties: ['openFile'],
      filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'ico'] }],
    });
    if (!files || files.length === 0) {
      event.reply(IpcChannels.customIcon, undefined);
      return;
    }
    const data = fs.readFileSync(files[0]);
    event.reply(IpcChannels.customIcon, CustomIcon.fromFile(data));
  }

  async onOpenFile(event: IpcMainEvent) {
    const fileName = dialog.showOpenDialogSync({ properties: ['openFile'] });
    event.reply(IpcChannels.openFile, fileName ? fileName[0] : '');
  }

  async onSettings(event: IpcMainEvent, renderSetting?: RenderSetting) {
    if (renderSetting) {
      this.yaKeepassSetting.renderSetting = renderSetting;
      Setting.save(this.yaKeepassSetting);
    } else {
      event.reply(IpcChannels.settings, this.yaKeepassSetting.renderSetting);
    }
  }

  async onReadKdbx(event: IpcMainEvent, kdbxFilePath: string, value: Uint8Array, salt: Uint8Array) {
    const password = new ProtectedValue(value, salt);

    try {
      CryptoEngine.setArgon2Impl((...args) => argon2Hash(...args));
      const data = await fs.promises.readFile(kdbxFilePath);
      const credentials = new Credentials(password, null);
      const database = await Kdbx.load(new Uint8Array(data).buffer, credentials);
      this.database = database;
      this.kdbxFilePath = kdbxFilePath;

      const items = Array.from(database.getDefaultGroup().allGroupsAndEntries()).map((i) =>
        ItemHelper.fromKdbx(i, database)
      );

      event.reply(
        IpcChannels.readKdbx,
        ReadKdbxResult.fromResult(
          items,
          new YakpMetadata(kdbxFilePath, this.database.getDefaultGroup().uuid.id, database.meta.recycleBinUuid?.id),
          Array.from(this.database.meta.customIcons).map((i) => CustomIcon.fromKdbxIcon(i[0], i[1]))
        )
      );
    } catch (e) {
      const error: YakpError =
        e instanceof KdbxError ? new YakpError(e.code, e.message) : new YakpError('GenericError', e as string);
      event.reply(IpcChannels.readKdbx, ReadKdbxResult.fromError(error));
    }
  }
}
