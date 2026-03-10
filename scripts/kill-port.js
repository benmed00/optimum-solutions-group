#!/usr/bin/env node
/**
 * Kill the process using a specific port.
 * Usage: node scripts/kill-port.js <port>
 * Example: node scripts/kill-port.js 9323
 */
import { spawnSync } from 'child_process';
import { platform } from 'os';

const port = process.argv[2];

if (!port || !/^\d+$/.test(port)) {
  console.error('Usage: node scripts/kill-port.js <port>');
  console.error('Example: node scripts/kill-port.js 9323');
  process.exit(1);
}

const portNum = Number.parseInt(port, 10);

function getPidsWindows() {
  const output = spawnSync('netstat', ['-ano'], { encoding: 'utf8' });
  if (output.error) {
    throw new Error(`netstat failed: ${output.error.message}`);
  }
  const lines = output.stdout.split('\n');
  const pids = new Set();
  for (const line of lines) {
    if (line.includes(`:${portNum}`) && line.includes('LISTENING')) {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (/^\d+$/.test(pid)) {
        pids.add(pid);
      }
    }
  }
  return [...pids];
}

function getPidsUnix() {
  const output = spawnSync('lsof', ['-i', `:${portNum}`, '-t'], { encoding: 'utf8' });
  if (output.error) {
    throw new Error(`lsof failed: ${output.error.message}`);
  }
  const pids = output.stdout.trim().split(/\s+/).filter(Boolean);
  return pids;
}

function killProcess(pid) {
  if (platform() === 'win32') {
    spawnSync('taskkill', ['/PID', pid, '/F'], { stdio: 'inherit' });
  } else {
    spawnSync('kill', ['-9', pid], { stdio: 'inherit' });
  }
}

try {
  const pids = platform() === 'win32' ? getPidsWindows() : getPidsUnix();

  if (pids.length === 0) {
    console.log(`No process found using port ${portNum}.`);
    process.exit(0);
  }

  for (const pid of pids) {
    console.log(`Killing process ${pid} on port ${portNum}...`);
    killProcess(pid);
  }
  console.log(`Done. Port ${portNum} is now free.`);
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
