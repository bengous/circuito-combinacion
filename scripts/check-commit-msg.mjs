// Checks the first line of a commit message against Conventional Commits, as used here:
// "type(scope): summary", e.g. "fix(layout): keep the drawing on screen".
// Run by the commit-msg hook (lefthook.yml) with the path of the message file.
import { readFileSync } from 'node:fs';

const TYPES = [
  'feat',
  'fix',
  'refactor',
  'perf',
  'test',
  'docs',
  'style',
  'build',
  'ci',
  'chore',
  'revert',
];
const PATTERN = new RegExp(`^(${TYPES.join('|')})(\\([a-z0-9-]+\\))?!?: \\S.{0,99}$`);
// Messages written by git itself or by `git commit --fixup`.
const EXEMPT = /^(Merge |Revert "|fixup! |squash! |amend! )/;

const file = process.argv[2];
if (!file) {
  console.error('Usage: node scripts/check-commit-msg.mjs <commit message file>');
  process.exit(2);
}
const subject = readFileSync(file, 'utf8').split('\n')[0] ?? '';

if (!EXEMPT.test(subject) && !PATTERN.test(subject)) {
  console.error(`Commit message: "${subject}"`);
  console.error('Expected "type(scope): summary" (at most ~100 characters), with type one of:');
  console.error(`  ${TYPES.join(', ')}`);
  console.error('Example: fix(settings): keep the dialog on screen on iPhone');
  process.exit(1);
}
