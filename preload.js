// Safe bridge between the Sentivyre window and the app
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('sentivyre', {
  version: () => ipcRenderer.invoke('app-version'),
  checkForUpdates: () => ipcRenderer.invoke('check-updates'),
  installUpdate: () => ipcRenderer.invoke('install-update'),
  setAutoUpdate: (on) => ipcRenderer.invoke('set-auto-update', on),
  onUpdateStatus: (fn) => ipcRenderer.on('update-status', (_e, s) => fn(s)),
  notify: (title, body) => ipcRenderer.invoke('notify', { title, body }),
  ai: (key, system, messages) => ipcRenderer.invoke('ai', { key, system, messages })
});
