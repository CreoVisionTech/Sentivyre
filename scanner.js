// Sentivyre scanner: PC scans and download protection.
// Uses Sentivyre's own checks plus Microsoft Defender (built into Windows) when it is available.
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const RISKY_EXT = new Set(['.exe', '.scr', '.bat', '.cmd', '.com', '.pif', '.vbs', '.vbe', '.js', '.jse', '.wsf', '.wsh',
  '.ps1', '.hta', '.jar', '.msi', '.lnk', '.reg', '.cpl', '.dll', '.iso', '.img']);
const SCRIPT_EXT = new Set(['.bat', '.cmd', '.vbs', '.vbe', '.js', '.jse', '.wsf', '.wsh', '.ps1', '.hta']);
const TEMP_EXT = /\.(crdownload|part|partial|tmp|download|opdownload)$/i;
const DOUBLE_EXT = /\.(pdf|docx?|xlsx?|pptx?|txt|jpe?g|png|gif|mp3|mp4|mov|zip|rar)\s*\.(exe|scr|bat|cmd|com|pif|vbs|js|hta|lnk)$/i;
const SKIP_DIRS = new Set(['node_modules', '.git', '$Recycle.Bin', 'System Volume Information', 'WindowsApps', 'Packages', 'Microsoft', 'Google', 'Mozilla', 'Cache', 'cache']);

/* ---------- Microsoft Defender ---------- */
function defenderPath() {
  if (process.platform !== 'win32') return null;
  try {
    const plat = path.join(process.env.ProgramData || 'C:\\ProgramData', 'Microsoft', 'Windows Defender', 'Platform');
    const vers = fs.readdirSync(plat).filter((d) => fs.existsSync(path.join(plat, d, 'MpCmdRun.exe'))).sort();
    if (vers.length) return path.join(plat, vers[vers.length - 1], 'MpCmdRun.exe');
  } catch (e) { /* fall through */ }
  const p = path.join(process.env.ProgramFiles || 'C:\\Program Files', 'Windows Defender', 'MpCmdRun.exe');
  return fs.existsSync(p) ? p : null;
}

// Runs a Defender scan. type: 1 = quick, 2 = full, 3 = one file/folder.
// Never removes anything itself (-DisableRemediation); Sentivyre shows the result instead.
function defenderScan(type, target, onChild) {
  return new Promise((resolve) => {
    const exe = defenderPath();
    if (!exe) return resolve({ available: false });
    const args = ['-Scan', '-ScanType', String(type), '-DisableRemediation'];
    if (type === 3) args.push('-File', target);
    let out = '';
    const child = spawn(exe, args, { windowsHide: true });
    if (onChild) onChild(child);
    child.stdout.on('data', (d) => { out += d; });
    child.stderr.on('data', (d) => { out += d; });
    child.on('error', () => resolve({ available: false }));
    child.on('close', (code) => {
      const names = [...out.matchAll(/Threat\s*:\s*(.+)/gi)].map((m) => m[1].trim());
      if (code === 2 || names.length) return resolve({ available: true, threat: true, names });
      if (code === 0) return resolve({ available: true, threat: false });
      resolve({ available: true, threat: false, error: out.trim().split('\n').pop() || ('exit ' + code), cancelled: code === null });
    });
  });
}

/* ---------- Sentivyre's own checks ---------- */
function startupDir() {
  return path.join(process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'), 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Startup');
}

function hasWebMark(file) {
  if (process.platform !== 'win32') return false;
  try { return fs.readFileSync(file + ':Zone.Identifier', 'utf8').includes('ZoneId=3'); } catch (e) { return false; }
}

// Returns null when the file looks fine, or { level, reasons } when it needs attention.
function checkFile(file, stat, opts = {}) {
  const name = path.basename(file);
  const ext = path.extname(name).toLowerCase();
  const reasons = []; let level = 0; // 1 = caution, 2 = suspicious, 3 = dangerous
  if (DOUBLE_EXT.test(name)) { level = 3; reasons.push('Fake file type: looks like a document or picture but is really a program'); }
  if (/\s{3,}\.(exe|scr|bat|cmd|com)$/i.test(name)) { level = 3; reasons.push('Hides its real file type with extra spaces'); }
  if (opts.inStartup && (SCRIPT_EXT.has(ext) || ext === '.exe')) { level = Math.max(level, 2); reasons.push('Starts automatically when Windows starts'); }
  if (ext === '.scr' || ext === '.pif' || ext === '.hta') { level = Math.max(level, 2); reasons.push('Unusual program type often used by malware'); }
  if (RISKY_EXT.has(ext) && opts.downloaded) { level = Math.max(level, 1); reasons.push('Program or script downloaded from the internet'); }
  if (RISKY_EXT.has(ext) && hasWebMark(file) && level < 1) { level = 1; reasons.push('Came from the internet'); }
  if (stat && stat.size === 0 && RISKY_EXT.has(ext)) { level = Math.max(level, 1); reasons.push('Empty program file'); }
  return level ? { level, reasons } : null;
}

/* ---------- Folder walking ---------- */
async function walk(dir, depth, state, visit) {
  if (state.cancelled || depth < 0) return;
  let entries;
  try { entries = await fs.promises.readdir(dir, { withFileTypes: true }); } catch (e) { return; }
  for (const e of entries) {
    if (state.cancelled) return;
    const full = path.join(dir, e.name);
    if (e.isSymbolicLink()) continue;
    if (e.isDirectory()) {
      if (!SKIP_DIRS.has(e.name) && !e.name.startsWith('.')) await walk(full, depth - 1, state, visit);
    } else if (e.isFile()) {
      await visit(full);
    }
  }
}

/* ---------- Scans ---------- */
// kind: 'quick' or 'full'. emit(progress) is called while scanning.
function createScan(kind, getPaths, emit) {
  const state = { cancelled: false, child: null };
  const run = async () => {
    const found = []; let files = 0; let lastEmit = 0;
    const home = os.homedir();
    const downloads = getPaths.downloads();
    const targets = kind === 'quick'
      ? [[downloads, 4, { downloaded: true }], [getPaths.desktop(), 3, {}], [getPaths.documents(), 3, {}], [startupDir(), 1, { inStartup: true }], [os.tmpdir(), 1, {}]]
      : [[home, 12, {}], [startupDir(), 1, { inStartup: true }]];

    emit({ state: 'started', kind, defender: !!defenderPath() });
    // Microsoft Defender scans in parallel with Sentivyre's own checks
    const defender = defenderScan(kind === 'quick' ? 1 : 2, null, (c) => { state.child = c; });

    const seen = new Set();
    for (const [dir, depth, opts] of targets) {
      if (!dir || !fs.existsSync(dir)) continue;
      const isDl = path.resolve(dir) === path.resolve(downloads);
      await walk(dir, depth, state, async (file) => {
        if (seen.has(file)) return; seen.add(file);
        files++;
        let stat = null; try { stat = await fs.promises.stat(file); } catch (e) { return; }
        const o = { ...opts, downloaded: opts.downloaded || isDl || file.startsWith(downloads + path.sep) };
        const r = checkFile(file, stat, o);
        if (r) found.push({ file, name: path.basename(file), ...r });
        const now = Date.now();
        if (now - lastEmit > 120) { lastEmit = now; emit({ state: 'progress', files, current: file, found: found.length }); }
      });
    }
    // Ask Defender for a second opinion on anything suspicious
    for (const f of found.filter((x) => x.level >= 2).slice(0, 25)) {
      if (state.cancelled) break;
      const d = await defenderScan(3, f.file);
      if (d.threat) { f.level = 3; f.reasons.unshift('Microsoft Defender: ' + (d.names[0] || 'threat detected')); }
    }
    emit({ state: 'progress', files, current: 'Waiting for Microsoft Defender to finish…', found: found.length });
    const dres = state.cancelled ? { available: false } : await defender;
    found.sort((a, b) => b.level - a.level);
    emit({ state: state.cancelled ? 'cancelled' : 'done', kind, files, found, defender: dres });
  };
  return {
    run,
    cancel() { state.cancelled = true; if (state.child) try { state.child.kill(); } catch (e) { /* ignore */ } }
  };
}

/* ---------- Download Shield ---------- */
function createDownloadWatcher(dir, onResult) {
  const pending = new Map();
  let watcher = null;
  const handle = (name) => {
    if (!name || TEMP_EXT.test(name) || name.startsWith('~$') || name.toLowerCase() === 'desktop.ini') return;
    const file = path.join(dir, name);
    clearTimeout(pending.get(file));
    pending.set(file, setTimeout(async () => {
      pending.delete(file);
      // wait until the download has finished writing
      let last = -1;
      for (let i = 0; i < 20; i++) {
        let s; try { s = await fs.promises.stat(file); } catch (e) { return; }
        if (!s.isFile()) return;
        if (s.size === last) break;
        last = s.size; await new Promise((r) => setTimeout(r, 1500));
      }
      let stat; try { stat = await fs.promises.stat(file); } catch (e) { return; }
      const r = checkFile(file, stat, { downloaded: true });
      const d = await defenderScan(3, file);
      let level = r ? r.level : 0; const reasons = r ? r.reasons.slice() : [];
      if (d.threat) { level = 3; reasons.unshift('Microsoft Defender: ' + (d.names[0] || 'threat detected')); }
      onResult({ file, name, level, reasons, defender: d.available, time: Date.now() });
    }, 1200));
  };
  return {
    start() {
      if (watcher || !fs.existsSync(dir)) return false;
      watcher = fs.watch(dir, { persistent: true }, (_ev, name) => handle(name && name.toString()));
      return true;
    },
    stop() { if (watcher) { watcher.close(); watcher = null; } },
    get running() { return !!watcher; }
  };
}

/* ---------- Quarantine ---------- */
function quarantine(file, qdir) {
  fs.mkdirSync(qdir, { recursive: true });
  const id = Date.now() + '-' + Math.random().toString(36).slice(2, 8);
  const dest = path.join(qdir, id + '.quarantined');
  try { fs.renameSync(file, dest); } catch (e) { fs.copyFileSync(file, dest); fs.unlinkSync(file); }
  const listFile = path.join(qdir, 'list.json');
  let list = []; try { list = JSON.parse(fs.readFileSync(listFile, 'utf8')); } catch (e) { /* new list */ }
  list.unshift({ id, original: file, name: path.basename(file), time: Date.now() });
  fs.writeFileSync(listFile, JSON.stringify(list, null, 1));
  return { id };
}
function quarantineList(qdir) {
  try { return JSON.parse(fs.readFileSync(path.join(qdir, 'list.json'), 'utf8')); } catch (e) { return []; }
}
function restore(id, qdir) {
  const listFile = path.join(qdir, 'list.json');
  const list = quarantineList(qdir); const item = list.find((x) => x.id === id);
  if (!item) throw new Error('Not found');
  let dest = item.original;
  if (fs.existsSync(dest)) { const p = path.parse(dest); dest = path.join(p.dir, p.name + ' (restored)' + p.ext); }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.renameSync(path.join(qdir, id + '.quarantined'), dest);
  fs.writeFileSync(listFile, JSON.stringify(list.filter((x) => x.id !== id), null, 1));
  return dest;
}
function removeForever(id, qdir) {
  const listFile = path.join(qdir, 'list.json');
  try { fs.unlinkSync(path.join(qdir, id + '.quarantined')); } catch (e) { /* already gone */ }
  fs.writeFileSync(listFile, JSON.stringify(quarantineList(qdir).filter((x) => x.id !== id), null, 1));
}

module.exports = { createScan, createDownloadWatcher, checkFile, defenderPath, quarantine, quarantineList, restore, removeForever };
