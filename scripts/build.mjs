import { cp, mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

await cp(resolve(root, 'games/wispguard/dist'), resolve(dist, 'wispguard'), { recursive: true });
await cp(resolve(root, 'games/monster-tamer'), resolve(dist, 'monster-tamer'), {
  recursive: true,
  filter: (source) => !source.includes('/deploy') && !source.includes('/docs'),
});
await mkdir(resolve(dist, 'simple-rpg'), { recursive: true });
await cp(resolve(root, 'games/simple-rpg'), resolve(dist, 'simple-rpg'), { recursive: true });
await cp(resolve(root, 'public/shared'), resolve(dist, 'shared'), { recursive: true });

console.log('CONDAMINE-GAMES construit dans dist/.');

