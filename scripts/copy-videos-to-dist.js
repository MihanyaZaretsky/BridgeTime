const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const videosDir = path.join(distDir, 'videos');

const sources = [
  {
    from: path.join(projectRoot, 'assets', 'videos', 'qr-001.mp4'),
    to: path.join(videosDir, 'qr-001.mp4'),
  },
  {
    from: path.join(projectRoot, 'assets', 'videos', 'qr-002.mp4'),
    to: path.join(videosDir, 'qr-002.mp4'),
  },
  {
    from: path.join(projectRoot, 'assets', 'videos', 'qr-003.mp4'),
    to: path.join(videosDir, 'qr-003.mp4'),
  },
  {
    from: path.join(projectRoot, 'assets', 'videos', 'qr-013.mp4'),
    to: path.join(videosDir, 'qr-013.mp4'),
  },
  {
    from: path.join(projectRoot, 'assets', 'videos', 'qr-014.mp4'),
    to: path.join(videosDir, 'qr-014.mp4'),
  },
  {
    from: path.join(projectRoot, 'assets', 'videos', 'qr-015.mp4'),
    to: path.join(videosDir, 'qr-015.mp4'),
  },
];

if (!fs.existsSync(distDir)) {
  console.error('dist folder not found. Run web export first. Expected:', distDir);
  process.exit(1);
}

fs.mkdirSync(videosDir, { recursive: true });

for (const { from, to } of sources) {
  if (!fs.existsSync(from)) {
    console.error('Video file not found:', from);
    process.exit(1);
  }
  fs.copyFileSync(from, to);
  console.log('Copied:', path.relative(projectRoot, from), '->', path.relative(projectRoot, to));
}
