// Sentivyre by Vyrelock - Windows desktop app (Electron main process)
const { app, BrowserWindow, ipcMain, shell, Menu, Notification, Tray, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
const scanner = require('./scanner');
const network = require('./network');
const os = require('os');
const crypto = require('crypto');
const { autoUpdater } = require('electron-updater');

let win = null;
let tray = null;
let quitting = false;
let autoUpdate = true;
let currentScan = null;
let watcher = null;

/* ---------- Settings kept by the app itself ---------- */
const settingsFile = () => path.join(app.getPath('userData'), 'settings.json');
let settings = { downloadShield: true, background: true, autostart: false, schedule: { freq: 'off', time: '20:00', day: 5, last: 0 }, business: { enabled: false, projectId: '', apiKey: '', team: '', deviceName: '' }, deviceId: '' };
function loadSettings() { try { settings = { ...settings, ...JSON.parse(fs.readFileSync(settingsFile(), 'utf8')) }; } catch (e) { /* defaults */ } }
function saveSettings() { try { fs.writeFileSync(settingsFile(), JSON.stringify(settings)); } catch (e) { /* ignore */ } }
const qdir = () => path.join(app.getPath('userData'), 'quarantine');

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
  win.once('ready-to-show', () => { if (!process.argv.includes('--hidden')) win.show(); });
  win.on('close', (e) => {
    if (!quitting && settings.background) {
      e.preventDefault(); win.hide();
      notify('Sentivyre is still protecting you', 'Download Shield keeps running in the system tray.', true);
    }
  });

  // Open web links in the normal browser, never inside the app
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://')) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith('file://')) { e.preventDefault(); if (url.startsWith('https://')) shell.openExternal(url); }
  });
}

function showWindow() { if (!win) return; if (win.isMinimized()) win.restore(); win.show(); win.focus(); }
let toldTray = false;
function notify(title, body, once) {
  if (once) { if (toldTray) return; toldTray = true; }
  if (!Notification.isSupported()) return;
  const n = new Notification({ title: String(title), body: String(body), icon: path.join(__dirname, 'src', 'icon.png') });
  n.on('click', showWindow); n.show();
}

function createTray() {
  const img = nativeImage.createFromPath(path.join(__dirname, 'src', 'icon.png')).resize({ width: 16, height: 16 });
  tray = new Tray(img);
  tray.setToolTip('Sentivyre - protecting your PC');
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Open Sentivyre', click: showWindow },
    { label: 'Run quick scan', click: () => { showWindow(); send('run-scan', 'quick'); } },
    { type: 'separator' },
    { label: 'Quit Sentivyre', click: () => { quitting = true; app.quit(); } }
  ]));
  tray.on('click', showWindow);
}

/* ---------- PC scan ---------- */
const paths = { downloads: () => app.getPath('downloads'), desktop: () => app.getPath('desktop'), documents: () => app.getPath('documents') };
function startScan(kind) {
  if (currentScan) return false;
  currentScan = scanner.createScan(kind === 'full' ? 'full' : 'quick', paths, (st) => {
    send('scan-status', st);
    if (st.state === 'done') {
      const bad = st.found.filter((f) => f.level >= 2).length + (st.defender && st.defender.threat ? 1 : 0);
      if (win && !win.isVisible()) notify(bad ? 'Sentivyre found ' + bad + ' threat(s)' : 'Scan complete: your PC looks safe', bad ? 'Open Sentivyre to review them.' : st.files + ' files checked.');
    }
  });
  currentScan.run().catch((err) => send('scan-status', { state: 'error', message: String(err.message || err) })).finally(() => { currentScan = null; });
  return true;
}
ipcMain.handle('scan-start', (_e, kind) => startScan(kind));

/* ---------- Scheduled scans ---------- */
function scheduleDue(now = new Date()) {
  const sc = settings.schedule || {};
  if (!sc.freq || sc.freq === 'off') return false;
  const [h, m] = String(sc.time || '20:00').split(':').map(Number);
  const at = new Date(now); at.setHours(h || 0, m || 0, 0, 0);
  if (now < at || (sc.last || 0) >= at.getTime()) return false;
  if (sc.freq === 'weekly' && now.getDay() !== Number(sc.day)) return false;
  return true;
}
function nextScheduled(now = new Date()) {
  const sc = settings.schedule || {};
  if (!sc.freq || sc.freq === 'off') return null;
  const [h, m] = String(sc.time || '20:00').split(':').map(Number);
  for (let i = 0; i < 8; i++) {
    const d = new Date(now); d.setDate(d.getDate() + i); d.setHours(h || 0, m || 0, 0, 0);
    if (sc.freq === 'weekly' && d.getDay() !== Number(sc.day)) continue;
    if (d > now || (sc.last || 0) < d.getTime()) return d.getTime();
  }
  return null;
}
setInterval(() => {
  if (scheduleDue() && !currentScan) {
    settings.schedule.last = Date.now(); saveSettings();
    send('scheduled-scan', true);
    startScan('quick');
  }
}, 60 * 1000);
ipcMain.handle('schedule-set', (_e, sc) => {
  settings.schedule = { ...settings.schedule, freq: sc.freq, time: sc.time, day: Number(sc.day) }; saveSettings();
  return nextScheduled();
});
ipcMain.handle('schedule-next', () => nextScheduled());

/* ---------- Network checker ---------- */
ipcMain.handle('wifi-info', () => network.getWifi());
ipcMain.handle('network-devices', (_e, deep) => network.getDevices(!!deep, (p) => send('network-progress', p)));

/* ---------- Business dashboard (Firebase Firestore) ---------- */
function fsValue(v) {
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number' && Number.isInteger(v)) return { integerValue: String(v) };
  if (typeof v === 'number') return { doubleValue: v };
  if (v instanceof Date) return { timestampValue: v.toISOString() };
  return { stringValue: String(v == null ? '' : v) };
}
async function businessReport(data, cfgOverride) {
  const b = { ...settings.business, ...(cfgOverride || {}) };
  if (!b.projectId || !b.apiKey || !b.team) throw new Error('Fill in project ID, Web API key and team code first');
  if (!settings.deviceId) { settings.deviceId = crypto.randomUUID(); saveSettings(); }
  const team = encodeURIComponent(b.team.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'));
  const doc = { ...data, name: b.deviceName || os.hostname(), hostname: os.hostname(), version: app.getVersion(), lastSeen: new Date() };
  const fields = {}; for (const [k, v] of Object.entries(doc)) fields[k] = fsValue(v);
  const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(b.projectId.trim())}/databases/(default)/documents/teams/${team}/devices/${settings.deviceId}?key=${encodeURIComponent(b.apiKey.trim())}`;
  const res = await fetch(url, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ fields }) });
  if (!res.ok) { let m = 'HTTP ' + res.status; try { const j = await res.json(); m = (j.error && j.error.message) || m; } catch (e) { /* keep */ } throw new Error(m); }
  return true;
}
ipcMain.handle('business-set', (_e, b) => { settings.business = { ...settings.business, ...b }; saveSettings(); return settings.business; });
ipcMain.handle('business-report', (_e, data) => businessReport(data));
ipcMain.handle('business-test', (_e, b, data) => businessReport(data, b));
ipcMain.handle('scan-cancel', () => { if (currentScan) currentScan.cancel(); return true; });
ipcMain.handle('defender-available', () => !!scanner.defenderPath());

/* ---------- Download Shield ---------- */
function setShield(on) {
  settings.downloadShield = !!on; saveSettings();
  if (on) {
    if (!watcher) watcher = scanner.createDownloadWatcher(app.getPath('downloads'), (r) => {
      send('download-scanned', r);
      if (r.level >= 2) notify('⚠ Dangerous download: ' + r.name, r.reasons[0] + '. Open Sentivyre to quarantine it.');
      else if (r.level === 1) notify('Check this download: ' + r.name, r.reasons[0] + '. Only open it if you trust where it came from.');
    });
    watcher.start();
  } else if (watcher) { watcher.stop(); watcher = null; }
  return settings.downloadShield;
}
ipcMain.handle('shield-set', (_e, on) => setShield(on));

/* ---------- Quarantine & files ---------- */
ipcMain.handle('quarantine', (_e, file) => scanner.quarantine(file, qdir()));
ipcMain.handle('quarantine-list', () => scanner.quarantineList(qdir()));
ipcMain.handle('quarantine-restore', (_e, id) => scanner.restore(id, qdir()));
ipcMain.handle('quarantine-delete', (_e, id) => { scanner.removeForever(id, qdir()); return true; });
ipcMain.handle('show-file', (_e, file) => { shell.showItemInFolder(file); return true; });
ipcMain.handle('open-defender', () => shell.openExternal('windowsdefender://threat/'));

/* ---------- Background & start-up ---------- */
ipcMain.handle('get-settings', () => ({ ...settings, downloads: app.getPath('downloads'), hostname: os.hostname() }));
ipcMain.handle('set-background', (_e, on) => { settings.background = !!on; saveSettings(); return settings.background; });
ipcMain.handle('set-autostart', (_e, on) => {
  settings.autostart = !!on; saveSettings();
  if (app.isPackaged) app.setLoginItemSettings({ openAtLogin: settings.autostart, args: ['--hidden'] });
  return settings.autostart;
});

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
ipcMain.handle('notify', (_e, { title, body }) => { notify(title, body); return true; });

/* ---------- AI (optional, any provider, uses the user's own API key) ---------- */
const AI = {
  anthropic: { name: 'Anthropic Claude', model: 'claude-haiku-5-5' },
  openai: { name: 'OpenAI ChatGPT', model: 'gpt-4.1-mini', base: 'https://api.openai.com/v1' },
  gemini: { name: 'Google Gemini', model: 'gemini-2.5-flash' },
  groq: { name: 'Groq', model: 'llama-3.3-70b-versatile', base: 'https://api.groq.com/openai/v1' },
  openrouter: { name: 'OpenRouter', model: 'openrouter/auto', base: 'https://openrouter.ai/api/v1' },
  custom: { name: 'Custom', model: '' }
};
function detectProvider(key) {
  key = String(key || '').trim();
  if (key.startsWith('sk-ant-')) return 'anthropic';
  if (key.startsWith('sk-or-')) return 'openrouter';
  if (key.startsWith('gsk_')) return 'groq';
  if (key.startsWith('AIza')) return 'gemini';
  if (key.startsWith('sk-')) return 'openai';
  return '';
}
async function jsonFetch(url, opts) {
  const res = await fetch(url, opts);
  let data = null; try { data = await res.json(); } catch (e) { /* not json */ }
  if (!res.ok) {
    const msg = (data && ((data.error && (data.error.message || data.error)) || data.message)) || ('HTTP ' + res.status);
    const err = new Error(typeof msg === 'string' ? msg : JSON.stringify(msg)); err.status = res.status; throw err;
  }
  return data;
}
async function callModel(p, key, model, base, system, messages) {
  if (p === 'anthropic') {
    const d = await jsonFetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' }, body: JSON.stringify({ model, max_tokens: 700, system, messages }) });
    return (d.content || []).filter((x) => x.type === 'text').map((x) => x.text).join('');
  }
  if (p === 'gemini') {
    const d = await jsonFetch('https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(model) + ':generateContent?key=' + encodeURIComponent(key), {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents: messages.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })), generationConfig: { maxOutputTokens: 700 } })
    });
    return ((d.candidates && d.candidates[0] && d.candidates[0].content && d.candidates[0].content.parts) || []).map((x) => x.text || '').join('');
  }
  // OpenAI-compatible: OpenAI, Groq, OpenRouter, custom
  const url = String(base || '').replace(/\/+$/, '') + '/chat/completions';
  if (!/^https:\/\//.test(url)) throw new Error('The custom address must start with https://');
  const d = await jsonFetch(url, { method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer ' + key, 'HTTP-Referer': 'https://github.com/CreoVisionTech/sentivyre', 'X-Title': 'Sentivyre' }, body: JSON.stringify({ model, max_tokens: 700, messages: [{ role: 'system', content: system }, ...messages] }) });
  return (d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content) || '';
}
// If the chosen model doesn't exist for this key, pick a good one from the provider's model list
async function pickModel(p, key, base) {
  let ids = [];
  try {
    if (p === 'anthropic') ids = ((await jsonFetch('https://api.anthropic.com/v1/models?limit=100', { headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01' } })).data || []).map((m) => m.id);
    else if (p === 'gemini') ids = ((await jsonFetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=200&key=' + encodeURIComponent(key))).models || []).filter((m) => (m.supportedGenerationMethods || []).includes('generateContent')).map((m) => m.name.replace(/^models\//, ''));
    else ids = ((await jsonFetch(String(base).replace(/\/+$/, '') + '/models', { headers: { authorization: 'Bearer ' + key } })).data || []).map((m) => m.id);
  } catch (e) { return ''; }
  const prefs = { anthropic: [/haiku/, /sonnet/], gemini: [/flash(?!.*(image|tts|audio|live|thinking))/, /pro/], openai: [/^gpt-[\d.]+-mini$/, /^gpt-[\d.o]+-mini/, /^gpt-/], groq: [/llama.*70b/, /llama/], openrouter: [/auto/], custom: [/./] }[p] || [/./];
  for (const re of prefs) { const hit = ids.filter((id) => re.test(id)).sort().reverse()[0]; if (hit) return hit; }
  return ids[0] || '';
}
ipcMain.handle('ai', async (_e, { cfg, system, messages }) => {
  const key = String((cfg && cfg.key) || '').trim();
  if (!key) throw new Error('no_key');
  const p = (cfg.provider && cfg.provider !== 'auto') ? cfg.provider : (detectProvider(key) || 'openai');
  const info = AI[p] || AI.openai;
  const base = p === 'custom' ? cfg.base : info.base;
  let model = (cfg.model || '').trim() || info.model;
  if (!model && p === 'custom') model = await pickModel(p, key, base);
  try {
    return { text: await callModel(p, key, model, base, system, messages), provider: p, providerName: info.name, model };
  } catch (err) {
    if (err.status === 401 || err.status === 403) throw new Error('The API key was rejected by ' + info.name + '.');
    if (err.status === 404 || err.status === 400 && /model/i.test(err.message) || /model/i.test(err.message) && /not|exist|found|support/i.test(err.message)) {
      const better = await pickModel(p, key, base);
      if (better && better !== model) return { text: await callModel(p, key, better, base, system, messages), provider: p, providerName: info.name, model: better };
    }
    throw err;
  }
});

app.on('second-instance', showWindow);
app.on('before-quit', () => { quitting = true; });

app.whenReady().then(() => {
  loadSettings();
  createWindow();
  createTray();
  if (settings.downloadShield) setShield(true);
  // Check for updates a few seconds after start-up, then every 4 hours
  setTimeout(() => { if (autoUpdate) checkForUpdates(); }, 4000);
  setInterval(() => { if (autoUpdate) checkForUpdates(); }, 4 * 60 * 60 * 1000);
});

app.on('window-all-closed', () => { if (!settings.background) app.quit(); });
