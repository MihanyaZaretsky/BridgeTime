const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const outDir = path.join(projectRoot, 'assets', 'audio');

const targets = [
  { contains: 'Valerij_Meladze_-_Vera', out: 'qr-004.mp3' },
  { contains: 'nu_pogodi_14-02', out: 'qr-005.mp3' },
  { contains: 'Billie Jean', out: 'qr-006.mp3' },
  { contains: 'Егор Крид - Будильник', out: 'qr-016.mp3' },
  { contains: 'Justin Bieber - Baby', out: 'qr-017.mp3' },
  { contains: 'basta_-_vypusknoy-medlyachok', out: 'qr-018.mp3' },
];

function listMp3Candidates(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isFile() && d.name.toLowerCase().endsWith('.mp3'))
    .map((d) => path.join(dir, d.name));
}

fs.mkdirSync(outDir, { recursive: true });

const candidates = listMp3Candidates(projectRoot);

for (const t of targets) {
  const found = candidates.find((p) => path.basename(p).includes(t.contains));
  if (!found) {
    console.error('Source audio not found for:', t.contains);
    console.error('Searched in:', projectRoot);
    process.exit(1);
  }
  const dest = path.join(outDir, t.out);
  fs.copyFileSync(found, dest);
  console.log('Copied:', path.relative(projectRoot, found), '->', path.relative(projectRoot, dest));
}
