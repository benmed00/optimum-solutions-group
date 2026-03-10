#!/usr/bin/env node
/**
 * Export Mermaid diagrams from markdown to PNG and SVG.
 * Extracts ```mermaid blocks from docs/architecture/platform-mapping-and-diagrams.md
 * and renders each via @mermaid-js/mermaid-cli (mmdc).
 *
 * Usage: npm run diagrams:export
 * Output: docs/architecture/diagrams/*.png, *.svg
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const sourceMd = join(root, 'docs', 'architecture', 'platform-mapping-and-diagrams.md');
const outputDir = join(root, 'docs', 'architecture', 'diagrams');

const DIAGRAM_NAMES = [
  'class-diagram',
  'component-diagram',
  'sequence-page-load',
  'sequence-contact-form',
  'sequence-performance',
  'activity-navigation',
  'activity-error-handling',
  'activity-pwa-offline',
  'use-case-diagram',
  'state-error-boundary',
  'state-pwa-install',
  'state-contact-form',
  'er-diagram',
  'deployment-diagram',
  'c4-context',
  'c4-container',
  'c4-component',
];

function extractMermaidBlocks(content) {
  const blocks = [];
  const regex = /```mermaid\r?\n([\s\S]*?)```/g;
  let match;
  let i = 0;
  while ((match = regex.exec(content)) !== null) {
    const name = DIAGRAM_NAMES[i] ?? `diagram-${i + 1}`;
    blocks.push({ name, content: match[1].trim() });
    i++;
  }
  return blocks;
}

function main() {
  if (!existsSync(sourceMd)) {
    console.error('Source file not found:', sourceMd);
    process.exit(1);
  }

  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const content = readFileSync(sourceMd, 'utf-8');
  const blocks = extractMermaidBlocks(content);

  if (blocks.length === 0) {
    console.log('No mermaid blocks found.');
    return;
  }

  console.log(`Found ${blocks.length} mermaid diagram(s). Exporting...`);

  for (const { name, content } of blocks) {
    const mmdPath = join(outputDir, `${name}.mmd`);
    writeFileSync(mmdPath, content, 'utf-8');

    try {
      execSync(`npx mmdc -i "${mmdPath}" -o "${join(outputDir, `${name}.png`)}" -b transparent`, {
        stdio: 'inherit',
        cwd: root,
      });
      execSync(`npx mmdc -i "${mmdPath}" -o "${join(outputDir, `${name}.svg`)}" -b transparent`, {
        stdio: 'inherit',
        cwd: root,
      });
      console.log(`  ✓ ${name}`);
    } catch (err) {
      console.error(`  ✗ ${name}:`, err.message);
    }
  }

  console.log(`\nDone. Output: ${outputDir}`);
}

main();
