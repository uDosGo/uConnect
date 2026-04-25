#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const PID_FILE = path.join(__dirname, '../.pid');

if (fs.existsSync(PID_FILE)) {
  const pid = parseInt(fs.readFileSync(PID_FILE, 'utf8'));
  try {
    process.kill(pid, 'SIGTERM');
    console.log(`✅ Stopped process ${pid}`);
  } catch (e) {
    console.log(`⚠ Process ${pid} was not running`);
  }
  fs.unlinkSync(PID_FILE);
} else {
  console.log('⚠ No running dev server (no PID file)');
}
