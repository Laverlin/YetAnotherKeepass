import { CustomIcon } from 'main/entity/CustomIcon';
import { ReadKdbxResult } from 'main/entity/ReadKdbxResult';
import { RenderSetting } from 'main/entity/RenderSetting';
import { SystemCommand } from './IpcDispatcher';

declare global {
  interface Window {
    electron: Electron;
  }
}

export interface Electron {
  ipcRenderer: IpcRenderer;
}

export interface IpcRenderer {
  systemCommand(command: SystemCommand): void;
  openFileDialog(): void;
  onFileOpen(func: (fileName: string) => void): void;
  saveSetting(renderSetting: RenderSetting): void;
  getSetting(): void;
  onSetting(func: (renderSetting: RenderSetting) => void): void;
  readKdbx(kdbxFilePath: string, value: Uint8Array, salt: Uint8Array): void;
  onReadKdbx(func: (data: ReadKdbxResult) => void): void;
  getCustomIcon(): void;
  onCustomIcon(func: (icon: CustomIcon | undefined) => void): void;
  addAttachments(entrySid: string): void;
  onAddAttachments(func: (attachments: string[]) => void): void;
  saveAttachment(entrySid: string, key: string): void;
}

export const IpcMainOpenDialog = () => {
  return new Promise<string>((resolve) => {
    window.electron.ipcRenderer.onFileOpen((fileName) => {
      resolve(fileName);
    });
    window.electron.ipcRenderer.openFileDialog();
  });
};

export const IpcMainReadKdbx = (kdbxFilePath: string, value: Uint8Array, salt: Uint8Array) => {
  return new Promise<ReadKdbxResult>((resolve) => {
    window.electron.ipcRenderer.onReadKdbx((result) => {
      resolve(result);
    });
    window.electron.ipcRenderer.readKdbx(kdbxFilePath, value, salt);
  });
};

export const IpcMainLoadIcon = () => {
  return new Promise<CustomIcon | undefined>((resolve) => {
    window.electron.ipcRenderer.onCustomIcon((result) => {
      resolve(result);
    });
    window.electron.ipcRenderer.getCustomIcon();
  });
};

export const IpcMainAddAttechments = (entrySid: string) => {
  return new Promise<string[] | undefined>((resolve) => {
    window.electron.ipcRenderer.onAddAttachments((result) => {
      resolve(result);
    });
    window.electron.ipcRenderer.addAttachments(entrySid);
  });
};
