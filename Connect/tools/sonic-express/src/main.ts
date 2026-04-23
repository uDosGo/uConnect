/**
 * Main entry point for the uDos Webhook Helper Installer and Session Launcher
 */

import { Installer } from './installer.js';
import { SessionLauncher } from './session-launcher.js';
import { InitLauncher } from './init-launcher.js';

async function main() {
  try {
    const args = process.argv.slice(2);
    const command = args[0];
    let installer: Installer | undefined;
    let sessionLauncher: SessionLauncher | undefined;
    let initLauncher: InitLauncher | undefined;

    switch (command) {
      case 'install':
        installer = new Installer();
        await installer.install();
        break;
      case 'start':
        sessionLauncher = new SessionLauncher();
        await sessionLauncher.start();
        break;
      case 'stop':
        sessionLauncher = new SessionLauncher();
        await sessionLauncher.stop();
        break;
      case 'restart':
        sessionLauncher = new SessionLauncher();
        await sessionLauncher.restart();
        break;
      case 'health':
        installer = new Installer();
        await installer.healthCheck();
        break;
      case 'self-heal':
        installer = new Installer();
        await installer.selfHeal();
        break;
      case 'cleanup':
        installer = new Installer();
        await installer.cleanup();
        break;
      case 'init':
        initLauncher = new InitLauncher();
        await initLauncher.init();
        break;
      case 'init-health':
        initLauncher = new InitLauncher();
        await initLauncher.healthCheck();
        break;
      case 'init-self-heal':
        initLauncher = new InitLauncher();
        await initLauncher.selfHeal();
        break;
      case 'init-restart':
        initLauncher = new InitLauncher();
        await initLauncher.restart();
        break;
      case 'init-cleanup':
        initLauncher = new InitLauncher();
        await initLauncher.cleanup();
        break;
      default:
        console.log('📋 uDos Commands:');
        console.log('  install      Run the installer');
        console.log('  start        Start the session launcher');
        console.log('  stop         Stop the session launcher');
        console.log('  restart      Restart the session launcher');
        console.log('  health       Perform a health check');
        console.log('  self-heal    Perform self-healing');
        console.log('  cleanup      Clean up resources');
        console.log('');
        console.log('📋 Init Launcher Commands:');
        console.log('  init         Initialize and launch uDos');
        console.log('  init-health  Perform health check on init launcher');
        console.log('  init-self-heal Perform self-healing on init launcher');
        console.log('  init-restart Restart init launcher services');
        console.log('  init-cleanup Clean up init launcher resources');
        break;
    }
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();