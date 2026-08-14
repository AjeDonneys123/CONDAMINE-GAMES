import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { execSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

await cp(resolve(root, 'public/index.html'), resolve(dist, 'index.html'));
await cp(resolve(root, 'games/wispguard/dist'), resolve(dist, 'wispguard'), { recursive: true });
await cp(resolve(root, 'games/monster-tamer'), resolve(dist, 'monster-tamer'), {
  recursive: true,
  filter: (source) => ![
    '/deploy',
    '/docs',
    '/.github',
    '/.vscode'
  ].some((segment) => source.includes(segment)),
});
await mkdir(resolve(dist, 'simple-rpg'), { recursive: true });
await cp(resolve(root, 'games/simple-rpg'), resolve(dist, 'simple-rpg'), { recursive: true });
await cp(resolve(root, 'public/shared'), resolve(dist, 'shared'), { recursive: true });

let commit = String(process.env.VERCEL_GIT_COMMIT_SHA || '').slice(0, 8);
if (!commit) {
  try { commit = execSync('git rev-parse --short HEAD', { cwd: root }).toString().trim(); }
  catch { commit = 'local'; }
}
await writeFile(resolve(dist, 'version.json'), `${JSON.stringify({ commit, builtAt: new Date().toISOString() })}\n`);

console.log('CONDAMINE-GAMES construit dans dist/.');
