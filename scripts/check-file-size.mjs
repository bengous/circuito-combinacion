// Fails when a source file grows past the limit, to keep files small and reviewable.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const MAX_LINES = 200;
const ROOT = 'src';
const EXTENSIONS = /\.(ts|tsx|css)$/;

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* walk(path);
    else if (EXTENSIONS.test(name)) yield path;
  }
}

const tooLong = [...walk(ROOT)]
  .map((path) => ({ path, lines: readFileSync(path, 'utf8').split('\n').length }))
  .filter((file) => file.lines > MAX_LINES);

if (tooLong.length > 0) {
  console.error(`Files over ${MAX_LINES} lines (split them into smaller modules):`);
  for (const { path, lines } of tooLong) console.error(`  ${path}: ${lines}`);
  process.exit(1);
}
console.log(`OK: every file in ${ROOT}/ is at most ${MAX_LINES} lines.`);
