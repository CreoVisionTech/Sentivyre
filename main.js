// Sentivyre by Vyrelock - Windows desktop app (Electron main process)
const { app, BrowserWindow, ipcMain, shell, Menu, Notification } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

let win = null;
let autoUpdate = true;

if (!app.requestSingleInstanceLock()) {
  app.quit();
}

app.setAppUserModelId('com.vyrelock.sentivyre');

function send(channel, payload) {
  if (win && !win.isDestroyed()) win.webContents.send(channel, payload);
}

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#0B0B0D',
    title: 'Sentivyre',
    icon: path.join(__dirname, 'src', 'icon.png'),
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  Menu.setApplicationMenu(null);
  win.loadFile(path.join(__dirname, 'src', 'index.html'));
  win.once('ready-to-show', () => win.show());

  // Open web links in the normal browser, never inside the app
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://')) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith('file://')) { e.preventDefault(); if (url.startsWith('https://')) shell.openExternal(url); }
  });
}

/* ---------- Auto update (GitHub Releases) ---------- */
// Where to look for updates: GitHub Releases of CreoVisionTech/sentivyre
autoUpdater.setFeedURL({ provider: 'github', owner: 'CreoVisionTech', repo: 'sentivyre', releaseType: 'release' });
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

autoUpdater.on('checking-for-update', () => send('update-status', { state: 'checking' }));
autoUpdater.on('update-available', (info) => send('update-status', { state: 'available', version: info.version }));
autoUpdater.on('update-not-available', () => send('update-status', { state: 'latest' }));
autoUpdater.on('download-progress', (p) => send('update-status', { state: 'downloading', percent: Math.round(p.percent) }));
autoUpdater.on('update-downloaded', (info) => {
  send('update-status', { state: 'ready', version: info.version });
  if (Notification.isSupported()) {
    new Notification({ title: 'Sentivyre update ready', body: 'Version ' + info.version + ' will install when you restart Sentivyre.' }).show();
  }
});
autoUpdater.on('error', (err) => send('update-status', { state: 'error', message: String(err && err.message || err) }));

function checkForUpdates() {
  if (!app.isPackaged) {
    send('update-status', { state: 'dev' });
    return;
  }
  autoUpdater.checkForUpdates().catch((err) => send('update-status', { state: 'error', message: String(err.message || err) }));
}

ipcMain.handle('app-version', () => app.getVersion());
ipcMain.handle('check-updates', () => { checkForUpdates(); return true; });
ipcMain.handle('install-update', () => { autoUpdater.quitAndInstall(false, true); return true; });
ipcMain.handle('set-auto-update', (_e, on) => {
  autoUpdate = !!on;
  autoUpdater.autoDownload = autoUpdate;
  autoUpdater.autoInstallOnAppQuit = autoUpdate;
  return autoUpdate;
});
ipcMain.handle('notify', (_e, { title, body }) => {
  if (Notification.isSupported()) new Notification({ title: String(title), body: String(body) }).show();
  return true;
});

/* ---------- AI (optional, uses the user's own Anthropic API key) ---------- */
ipcMain.handle('ai', async (_e, { key, system, messages }) => {
  if (!key) throw new Error('no_key');
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({ model: 'claude-haiku-5-5', max_tokens: 700, system, messages })
  });
  const data = await res.json();
  if (!res.ok) throw new Error((data && data.error && data.error.message) || ('HTTP ' + res.status));
  return (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('');
});

app.on('second-instance', () => {
  if (win) { if (win.isMinimized()) win.restore(); win.focus(); }
});

app.whenReady().then(() => {
  createWindow();
  // Check for updates a few seconds after start-up, then every 4 hours
  setTimeout(() => { if (autoUpdate) checkForUpdates(); }, 4000);
  setInterval(() => { if (autoUpdate) checkForUpdates(); }, 4 * 60 * 60 * 1000);
});

app.on('window-all-closed', () => app.quit());
