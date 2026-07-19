import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const roots = ['public', 'scripts'];
const problems = [];

async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await walk(path);
    if (entry.isFile() && /\.(html|css|js)$/.test(entry.name)) {
      const content = await readFile(path, 'utf8');
      const lines = content.split('\n');
      const debugPattern = new RegExp('TO' + 'DO|console\\.log\\(');
      if (debugPattern.test(content) && !path.endsWith('build.js') && !path.endsWith('lint.js')) problems.push(`${path}: remove debug markers`);
      if (lines.some((line) => /[ \t]+$/.test(line))) problems.push(`${path}: remove trailing whitespace`);
    }
  }
}

for (const root of roots) await walk(root);
if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log('Lint checks passed');
