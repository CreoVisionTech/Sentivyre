// Sentivyre network checker: Wi-Fi safety and devices on your network (Windows).
const os = require('os');
const dns = require('dns').promises;
const { execFile, spawn } = require('child_process');

function run(cmd, args, timeout = 15000) {
  return new Promise((resolve) => {
    execFile(cmd, args, { windowsHide: true, timeout, maxBuffer: 4 * 1024 * 1024 }, (err, stdout) => resolve(err && !stdout ? '' : String(stdout || '')));
  });
}

function field(text, name) {
  const m = text.match(new RegExp('^\\s*' + name + '\\s*:\\s*(.+)$', 'im'));
  return m ? m[1].trim() : '';
}

async function getWifi() {
  if (process.platform !== 'win32') return { connected: false, wired: true };
  const out = await run('netsh', ['wlan', 'show', 'interfaces']);
  const state = field(out, 'State');
  if (!out || !/connected/i.test(state) || /disconnected/i.test(state)) return { connected: false, wired: true };
  const auth = field(out, 'Authentication');
  const cipher = field(out, 'Cipher');
  const signal = field(out, 'Signal');
  const ssid = field(out, 'SSID');
  const band = field(out, 'Band') || field(out, 'Radio type');
  let level = 'safe'; const notes = [];
  if (/open/i.test(auth) || /none/i.test(cipher)) { level = 'danger'; notes.push('This Wi-Fi has no password, so anyone nearby can see what you send. Avoid logging in or banking here.'); }
  else if (/wep/i.test(auth + cipher)) { level = 'danger'; notes.push('WEP security is very old and can be broken in minutes.'); }
  else if (/wpa-personal|wpa-psk/i.test(auth) && !/wpa2|wpa3/i.test(auth)) { level = 'warn'; notes.push('WPA (version 1) is outdated. Ask for WPA2 or WPA3.'); }
  else if (/tkip/i.test(cipher)) { level = 'warn'; notes.push('TKIP encryption is outdated. Switch the router to AES.'); }
  else if (/wpa3/i.test(auth)) notes.push('WPA3 is the newest and strongest Wi-Fi security.');
  else notes.push('WPA2 with AES is a safe, standard setup.');
  return { connected: true, ssid, auth, cipher, signal, band, level, notes };
}

function localIPv4() {
  for (const list of Object.values(os.networkInterfaces())) {
    for (const i of list || []) {
      if (i.family === 'IPv4' && !i.internal && !i.address.startsWith('169.254.')) return i;
    }
  }
  return null;
}

async function gateway() {
  if (process.platform !== 'win32') return '';
  const out = await run('ipconfig', []);
  const m = [...out.matchAll(/Default Gateway[ .]*:\s*([\d.]+)/gi)].map((x) => x[1]).filter(Boolean);
  return m[0] || '';
}

function ping(ip) {
  return new Promise((resolve) => {
    const c = spawn('ping', ['-n', '1', '-w', '300', ip], { windowsHide: true });
    c.on('close', () => resolve()); c.on('error', () => resolve());
  });
}

async function sweep(base, onProgress) {
  const ips = []; for (let i = 1; i < 255; i++) ips.push(base + i);
  let done = 0; const workers = [];
  const next = async () => { while (ips.length) { await ping(ips.shift()); done++; if (onProgress && done % 16 === 0) onProgress(done / 254); } };
  for (let w = 0; w < 48; w++) workers.push(next());
  await Promise.all(workers);
}

async function nameOf(ip) {
  try { const n = await Promise.race([dns.reverse(ip), new Promise((_, rej) => setTimeout(() => rej(new Error('t')), 900))]); return (n && n[0]) || ''; } catch (e) { return ''; }
}

async function getDevices(deep, onProgress) {
  const me = localIPv4();
  const gw = await gateway();
  if (process.platform !== 'win32' || !me) return { me: me && me.address, gateway: gw, devices: [] };
  if (deep) await sweep(me.address.split('.').slice(0, 3).join('.') + '.', onProgress);
  const out = await run('arp', ['-a']);
  const prefix = me.address.split('.').slice(0, 3).join('.') + '.';
  const seen = new Map();
  for (const m of out.matchAll(/^\s*(\d+\.\d+\.\d+\.\d+)\s+([0-9a-f]{2}(?:-[0-9a-f]{2}){5})\s+(\w+)/gim)) {
    const [, ip, mac, type] = m;
    if (!ip.startsWith(prefix) || /ff-ff-ff-ff-ff-ff/i.test(mac) || /^01-00-5e/i.test(mac) || ip.endsWith('.255')) continue;
    if (!/dynamic/i.test(type) && ip !== gw) continue;
    seen.set(ip, { ip, mac: mac.toUpperCase().replace(/-/g, ':') });
  }
  seen.set(me.address, { ip: me.address, mac: (me.mac || '').toUpperCase(), self: true });
  const devices = [...seen.values()].sort((a, b) => Number(a.ip.split('.')[3]) - Number(b.ip.split('.')[3]));
  await Promise.all(devices.map(async (d) => {
    d.router = d.ip === gw;
    d.name = d.self ? os.hostname() : await nameOf(d.ip);
    // a "locally administered" MAC is usually a phone using a private (random) address
    const first = parseInt((d.mac || '00').slice(0, 2), 16);
    d.privateMac = !d.self && !Number.isNaN(first) && (first & 2) === 2;
  }));
  return { me: me.address, gateway: gw, devices };
}

module.exports = { getWifi, getDevices };
