import { Database } from 'sqlite3';
import { resolve } from 'path';
import { getVaultRoot } from '../paths.js';
import { GhostProfile, readProfile } from './ghost.js';
import chalk from 'chalk';

export class ContactDatabase {
  private db: Database;
  private dbPath: string;
  
  constructor() {
    const vaultRoot = getVaultRoot();
    this.dbPath = resolve(vaultRoot, 'contacts.db');
    this.db = new Database(this.dbPath);
    this.initializeDatabase();
  }
  
  private initializeDatabase(): void {
    this.db.serialize(() => {
      this.db.run(`
        CREATE TABLE IF NOT EXISTS contacts (
          user_id TEXT PRIMARY KEY,
          email TEXT UNIQUE,
          name TEXT,
          registered_at DATETIME,
          aliases TEXT,
          install_ids TEXT,
          role TEXT
        )
      `);
      
      this.db.run(`
        CREATE TABLE IF NOT EXISTS contact_aliases (
          alias_id TEXT PRIMARY KEY,
          user_id TEXT,
          FOREIGN KEY (user_id) REFERENCES contacts(user_id)
        )
      `);
    });
  }
  
  public registerUser(profile: GhostProfile, realUserId: string): void {
    if (profile.user.is_registered) {
      console.log(chalk.yellow('⚠️ User is already registered'));
      return;
    }
    
    const ghostId = profile.user.user_id;
    const installId = profile.install.install_id;
    
    this.db.serialize(() => {
      // Insert the real user
      const stmt = this.db.prepare(`
        INSERT INTO contacts (user_id, email, name, registered_at, aliases, install_ids, role)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      const aliases = JSON.stringify([ghostId]);
      const installIds = JSON.stringify([installId]);
      
      stmt.run(
        realUserId,
        profile.user.email,
        profile.user.name,
        new Date().toISOString(),
        aliases,
        installIds,
        profile.user.role
      );
      
      stmt.finalize();
      
      // Store the ghost ID as an alias
      const aliasStmt = this.db.prepare(`
        INSERT INTO contact_aliases (alias_id, user_id) VALUES (?, ?)
      `);
      aliasStmt.run(ghostId, realUserId);
      aliasStmt.finalize();
      
      console.log(chalk.green('✅ User registered in contact database'));
    });
  }
  
  public findUserByEmail(email: string): any {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM contacts WHERE email = ?',
        [email],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }
  
  public findUserById(userId: string): any {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM contacts WHERE user_id = ?',
        [userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }
  
  public findGhostAliases(userId: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT alias_id FROM contact_aliases WHERE user_id = ?',
        [userId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows.map(row => row.alias_id));
        }
      );
    });
  }
  
  public listGhosts(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM contacts WHERE user_id LIKE "ghost_%"',
        [],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }
  
  public close(): void {
    this.db.close();
  }
}

export function cmdContactsList() {
  const db = new ContactDatabase();
  
  db.listGhosts()
    .then(ghosts => {
      if (ghosts.length === 0) {
        console.log(chalk.dim('No ghost users found.'));
        return;
      }
      
      console.log(chalk.blue('👻 Ghost Users:'));
      ghosts.forEach(ghost => {
        console.log(`  ${chalk.cyan(ghost.user_id)} - ${ghost.name || 'Ghost'}`);
      });
    })
    .catch(error => {
      console.error(chalk.red('❌ Failed to list ghosts:'), error);
    })
    .finally(() => {
      db.close();
    });
}

export function registerContactsCommands(program: Command) {
  program
    .command('user')
    .description('User management')
    .action(async () => {
      // Show user list subcommands
      console.log(chalk.dim('Available user commands:'));
      console.log(chalk.dim('  udo user list --role ghost'));
    });
  
  program
    .command('user list')
    .description('List users')
    .option('--role <role>', 'Filter by role (ghost, developer, admin, user)')
    .action(async (options) => {
      if (options.role === 'ghost') {
        cmdContactsList();
      } else {
        console.log(chalk.dim('User listing by role not yet implemented'));
      }
    });
}
