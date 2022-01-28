/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-undef */
const { contextBridge, ipcRenderer } = require('electron');
const { IpcChannels } = require('./IpcCommunication/IpcChannels');

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    openFileDialog() {
      ipcRenderer.send(IpcChannels.openFile);
    },
    onFileOpen(func) {
      ipcRenderer.once(IpcChannels.openFile, (event, ...args) => func(...args));
    },
    saveSetting(renderSetting) {
      ipcRenderer.send(IpcChannels.settings, renderSetting);
    },
    getSetting() {
      ipcRenderer.send(IpcChannels.settings);
    },
    onSetting(func) {
      ipcRenderer.once(IpcChannels.settings, (event, ...args) => func(...args));
    },
    readKdbx(kdbxFilePath, value, salt) {
      ipcRenderer.send(IpcChannels.readKdbx, kdbxFilePath, value, salt);
    },
    onReadKdbx(func) {
      ipcRenderer.once(IpcChannels.readKdbx, (event, ...args) => func(...args));
    },
    systemCommand(command, param) {
      ipcRenderer.send(IpcChannels.systemCommand, command, param);
    },
    getCustomIcon() {
      ipcRenderer.send(IpcChannels.customIcon);
    },
    onCustomIcon(func) {
      ipcRenderer.once(IpcChannels.customIcon, (event, ...args) => func(...args));
    },
    addAttachments(entrySid) {
      ipcRenderer.send(IpcChannels.attachemnt, entrySid);
    },
    onAddAttachments(func) {
      ipcRenderer.once(IpcChannels.attachemnt, (event, ...args) => func(...args));
    },
    saveAttachment(entrySid, key) {
      ipcRenderer.send(IpcChannels.attachemnt, entrySid, key);
    },

    myPing() {
      ipcRenderer.send('ipc-example', 'ping');
    },
    on(channel, func) {
      const validChannels = ['ipc-example'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    once(channel, func) {
      const validChannels = ['ipc-example'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.once(channel, (event, ...args) => func(...args));
      }
    },
  },
});
