#!/usr/bin/env node
import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const destDir = join(root, 'public', 'api-docs');

if (!existsSync(destDir)) {
  mkdirSync(destDir, { recursive: true });
}

copyFileSync(
  join(root, 'docs', 'api', 'openapi.yaml'),
  join(destDir, 'openapi.yaml')
);
