import fs from 'fs';
import path from 'path';

const dir = path.join(process.cwd(), 'frontend', 'public', 'rewards');
const files = fs.readdirSync(dir);

for (const file of files) {
  if (file.includes('Rifle Paper')) {
    fs.renameSync(path.join(dir, file), path.join(dir, 'notebook.jpg'));
    console.log('Renamed', file, 'to notebook.jpg');
  }
}
