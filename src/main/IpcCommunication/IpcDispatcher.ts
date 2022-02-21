/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
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
import { argon2Hash } from '../argon2Hash';
import { Setting } from '../entity/Setting';
import { YaKeepassSetting } from '../entity/YaKeepassSetting';
import { IpcChannels } from './IpcChannels';
import { YakpMetadata } from '../entity/YakpMetadata';
import { CustomIcon } from '../entity/CustomIcon';
import { YakpItemChanges } from '../entity/YakpItemChanges';
import { ItemHelper } from '../entity/ItemHelper';
import { BinariesChange } from '../entity/BinariesChange';
import { SaveState } from '../entity/SaveState';

export type SystemCommand = 'minimize' | 'maximize' | 'restore' | 'exit' | 'openUrl';

export class IpcDispatcher {
  private yaKeepassSetting: YaKeepassSetting;

  private database: Kdbx | undefined;

  private kdbxFilePath: string | undefined;

  private binariesChange: BinariesChange[] = [];

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

      // add new icons
      //
      changes.icons.forEach((i) => {
        if (!kdbxIcons.has(i.key)) {
          const iconData: KdbxCustomIcon = {
            name: i.key,
            data: CustomIcon.toBinary(i),
          };
          kdbxIcons.set(i.key, iconData);
        }
      });

      // delete removed icons
      //
      kdbxIcons.forEach((_, key) => {
        if (!changes.icons.find((i) => i.key === key)) kdbxIcons.delete(key);
      });

      // update items history
      //
      let entries = Array.from(kdb.getDefaultGroup().allEntries());
      [...new Set(changes.deletedEntries.map((i) => i.entrySid))]
        .map((i) => entries.find((e) => e.uuid.id === i))
        .forEach((ki) =>
          changes.deletedEntries.filter((di) => di.entrySid).forEach((di) => ki?.removeHistory(di.deletedIndex))
        );

      // update item data
      //
      changes.items
        .filter((i) => i.isChanged)
        .map((i) => ItemHelper.fromSerialized(i))
        .forEach((i) => ItemHelper.toKdbx(i, kdb, changes.items));

      // update binary data
      //
      entries = Array.from(kdb.getDefaultGroup().allEntries());
      for (const rawBinary of this.binariesChange) {
        const entry = entries.find((e) => e.uuid.id === rawBinary.entrySid);
        if (rawBinary.data && entry) {
          const binary = await kdb.createBinary(rawBinary.data);
          entry.binaries.set(rawBinary.name, binary);
        }
      }
      this.binariesChange = [];

      changes.deletedBinaries.forEach((b) => {
        const entry = entries.find((e) => e.uuid.id === b.entrySid);
        entry?.binaries.delete(b.name);
      });

      // update binary data
      //
      entries = Array.from(kdb.getDefaultGroup().allEntries());
      this.binariesChange.forEach((c) => {
        const entry = entries.find((e) => e.uuid.id === c.entrySid);
        if (c.data && entry) entry.binaries.set(c.name, c.data);
      });
      changes.deletedBinaries.forEach((b) => {
        const entry = entries.find((e) => e.uuid.id === b.entrySid);
        entry?.binaries.delete(b.name);
      });

      // update order in changed group
      //
      changes.items
        .filter((i) => i.isChanged && i.isGroup && i.parentSid)
        .forEach((i) => {
          ItemHelper.reorderSiblings(i.parentSid || '', changes.items, kdb);
        });

      // save db to disk
      //
      const db = await this.database.save();
      fs.writeFileSync(this.kdbxFilePath, Buffer.from(db));
      const status = new SaveState(true);
      status.itemsUpdated = changes.items.filter((i) => i.isChanged).length;
      status.binariesAdded = this.binariesChange.length;
      status.binariesDeleted = changes.deletedBinaries.length;
      event.reply(IpcChannels.changes, status);
    } catch (e) {
      const status = new SaveState(false);
      status.errorMessage = (e as Error).message;
      event.reply(IpcChannels.changes, status);
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
      files.forEach((file) => {
        const binary = fs.readFileSync(file);
        this.binariesChange.push(new BinariesChange(entrySid, path.basename(file), binary));
        attachments.push(path.basename(file));
      });
      event.reply(IpcChannels.attachemnt, attachments);
    } else {
      const filePath = dialog.showSaveDialogSync({ defaultPath: key });
      if (!filePath || !this.database) return;

      const kdbxEntry = Array.from(this.database.getDefaultGroup().allEntries()).find((e) => e.uuid.id === entrySid);
      let buffer = kdbxEntry?.binaries.get(key);
      if (!buffer) {
        buffer = this.binariesChange.find((f) => f.name === key && f.entrySid === entrySid)?.data;
        if (!buffer) return;
      }

      buffer = (buffer as KdbxBinaryWithHash).value ? (buffer as KdbxBinaryWithHash).value : (buffer as KdbxBinary);
      const data = buffer instanceof ProtectedValue ? buffer.getBinary() : buffer;
      fs.writeFileSync(filePath, Buffer.from(data));
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

      const historyItems = Array.from(database.getDefaultGroup().allEntries())
        .map((e) => e.history.map((h, index) => ItemHelper.fromKdbxHistory(h, index)))
        .flat();

      event.reply(
        IpcChannels.readKdbx,
        ReadKdbxResult.fromResult(
          items,
          historyItems,
          new YakpMetadata(
            kdbxFilePath,
            this.database.getDefaultGroup().uuid.id,
            this.database.meta.recycleBinUuid?.id,
            !!this.database.meta.recycleBinEnabled
          ),
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
