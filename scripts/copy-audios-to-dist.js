const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const audioDir = path.join(distDir, 'audio');

const sources = [
  {
    from: path.join(projectRoot, 'assets', 'audio', 'qr-004.mp3'),
    to: path.join(audioDir, 'qr-004.mp3'),
  },
  {
    from: path.join(projectRoot, 'assets', 'audio', 'qr-005.mp3'),
    to: path.join(audioDir, 'qr-005.mp3'),
  },
  {
    from: path.join(projectRoot, 'assets', 'audio', 'qr-006.mp3'),
    to: path.join(audioDir, 'qr-006.mp3'),
  },
];

if (!fs.existsSync(distDir)) {
  console.error('dist folder not found. Run web export first. Expected:', distDir);
  process.exit(1);
}

fs.mkdirSync(audioDir, { recursive: true });

for (const { from, to } of sources) {
  if (!fs.existsSync(from)) {
    console.error('Audio file not found:', from);
    process.exit(1);
  }
  fs.copyFileSync(from, to);
  console.log('Copied:', path.relative(projectRoot, from), '->', path.relative(projectRoot, to));
}
