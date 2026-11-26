// Builds the Windows setup file (Sentivyre-Setup-x.y.z.exe) and the update file (latest.yml)
// Works on Windows, Linux or GitHub Actions. Needs NSIS (makensis) installed.
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const setExeInfo = require('./set-exe-info');

const root = path.join(__dirname, '..');
const pkg = require(path.join(root, 'package.json'));
const version = pkg.version;
const dist = path.join(root, 'dist');
const run = (cmd) => execSync(cmd, { cwd: root, stdio: 'inherit' });

// 1. Package the app files (dist/win-unpacked)
fs.rmSync(dist, { recursive: true, force: true });
run('npx electron-builder --win dir --x64 --publish never');

// 2. Put the Sentivyre icon and version details on the .exe
setExeInfo(path.join(dist, 'win-unpacked', 'Sentivyre.exe'), version);

// 3. Build the setup file with NSIS
const setupName = `Sentivyre-Setup-${version}.exe`;
const makensis = process.platform === 'win32' ? '"C:\\Program Files (x86)\\NSIS\\makensis.exe"' : 'makensis';
run(`${makensis} -V2 -DVERSION=${version} -DSRC="${path.join(dist, 'win-unpacked')}" -DOUT="${path.join(dist, setupName)}" -DICON="${path.join(root, 'build', 'icon.ico')}" "${path.join(root, 'installer', 'installer.nsi')}"`);

// 4. Write the update file that the app reads from GitHub Releases
const setup = fs.readFileSync(path.join(dist, setupName));
const sha512 = crypto.createHash('sha512').update(setup).digest('base64');
const yml = [
  `version: ${version}`,
  'files:',
  `  - url: ${setupName}`,
  `    sha512: ${sha512}`,
  `    size: ${setup.length}`,
  `path: ${setupName}`,
  `sha512: ${sha512}`,
  `releaseDate: '${new Date().toISOString()}'`,
  ''
].join('\n');
fs.writeFileSync(path.join(dist, 'latest.yml'), yml);

console.log('\nDone!');
console.log('  Setup file : dist/' + setupName + '  (' + (setup.length / 1048576).toFixed(1) + ' MB)');
console.log('  Update file: dist/latest.yml');
