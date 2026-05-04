/**
 * Main entry point for Sonic-Screwdriver CLI
 */

import { SonicCLI } from './sonic-cli.js';

async function main() {
  try {
    const cli = new SonicCLI();
    await cli.run();
  } catch (error) {
    console.error('❌ Sonic-Screwdriver CLI error:', error);
    process.exit(1);
  }
}

main();