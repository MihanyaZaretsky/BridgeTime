const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const outDir = path.join(projectRoot, 'assets', 'videos');

const targets = [
  { contains: 'Белое солнце пустыни', out: 'qr-001.mp4' },
  { contains: 'Бриллиантовая рука', out: 'qr-002.mp4' },
  { contains: 'Иван Васильевич', out: 'qr-003.mp4' },
];

function listMp4Candidates(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isFile() && d.name.toLowerCase().endsWith('.mp4'))
    .map((d) => path.join(dir, d.name));
}

fs.mkdirSync(outDir, { recursive: true });

const candidates = listMp4Candidates(projectRoot);

for (const t of targets) {
  const found = candidates.find((p) => path.basename(p).includes(t.contains));
  if (!found) {
    console.error('Source video not found for:', t.contains);
    console.error('Searched in:', projectRoot);
    process.exit(1);
  }
  const dest = path.join(outDir, t.out);
  fs.copyFileSync(found, dest);
  console.log('Copied:', path.relative(projectRoot, found), '->', path.relative(projectRoot, dest));
}
