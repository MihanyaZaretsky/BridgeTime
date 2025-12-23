const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const videosDir = path.join(distDir, 'videos');

const sources = [
  {
    from: path.join(projectRoot, 'Белое солнце пустыни 1970 фрагмент [get.gt].mp4'),
    to: path.join(videosDir, 'qr-001.mp4'),
  },
  {
    from: path.join(projectRoot, 'Поехали Геша Отрывок из фильма Бриллиантовая рука 1968 [get.gt].mp4'),
    to: path.join(videosDir, 'qr-002.mp4'),
  },
  {
    from: path.join(projectRoot, 'Иван Васильевич меняет профессию фрагмент 2 [get.gt].mp4'),
    to: path.join(videosDir, 'qr-003.mp4'),
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
