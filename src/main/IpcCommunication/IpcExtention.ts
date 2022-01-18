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
