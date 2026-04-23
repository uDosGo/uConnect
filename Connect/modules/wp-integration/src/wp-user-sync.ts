/**
 * WP User Synchronization Engine
 * Handles bi-directional sync between WP MySQL and uDos SQLite
 */

import { WpDbConnector } from './wp-db-connector.js';
import { WpUser, UdosUser, SyncConfig, SyncResult, SyncDirection } from './types.js';
import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';

/**
 * User Synchronization Engine
 * Manages user data sync between WordPress and uDos
 */
export class WpUserSync {
  private wpConnector: WpDbConnector;
  private sqliteDb: Database.Database;
  private config: SyncConfig;

  constructor(config: SyncConfig) {
    this.config = config;
    this.wpConnector = new WpDbConnector(config.wpDb);
    this.sqliteDb = new Database(config.sqliteDb.path);
    this.initializeSqlite();
  }

  /**
   * Initialize SQLite database structure
   */
  private initializeSqlite(): void {
    this.sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS udos_users (
        udos_id TEXT PRIMARY KEY,
        wp_id INTEGER UNIQUE,
        user_login TEXT NOT NULL,
        user_email TEXT NOT NULL,
        display_name TEXT,
        user_status INTEGER,
        roles TEXT,
        context TEXT,
        permissions TEXT,
        last_sync TEXT,
        meta TEXT
      )
    `);

    // Create index for faster lookups
    this.sqliteDb.exec('CREATE INDEX IF NOT EXISTS idx_wp_id ON udos_users(wp_id)');
    this.sqliteDb.exec('CREATE INDEX IF NOT EXISTS idx_email ON udos_users(user_email)');
  }

  /**
   * Sync users from WP to uDos
   */
  async syncWpToUdos(batchSize: number = 50): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      syncedUsers: 0,
      failedUsers: 0,
      errors: [],
      timestamp: new Date().toISOString()
    };

    try {
      let offset = 0;
      let hasMore = true;

      while (hasMore) {
        const wpUsers = await this.wpConnector.getAllUsers(batchSize, offset);
        
        if (wpUsers.length === 0) {
          hasMore = false;
          break;
        }

        for (const wpUser of wpUsers) {
          try {
            await this.syncWpUserToUdos(wpUser);
            result.syncedUsers++;
          } catch (error) {
            result.failedUsers++;
            result.errors.push(`Failed to sync user ${wpUser.ID}: ${error instanceof Error ? error.message : String(error)}`);
          }
        }

        offset += batchSize;
      }

      return result;
    } catch (error) {
      result.success = false;
      result.errors.push(error instanceof Error ? error.message : String(error));
      return result;
    }
  }

  /**
   * Sync a single WP user to uDos
   */
  private async syncWpUserToUdos(wpUser: WpUser): Promise<void> {
    const existing = this.sqliteDb
      .prepare('SELECT udos_id FROM udos_users WHERE wp_id = ?')
      .get(wpUser.ID) as { udos_id: string } | undefined;

    const udosUser: UdosUser = {
      ...wpUser,
      udos_id: existing?.udos_id || uuidv4(),
      last_sync: new Date().toISOString(),
      context: 'default',
      permissions: this.mapRolesToPermissions(wpUser.roles)
    };

    if (existing) {
      // Update existing user
      this.sqliteDb
        .prepare(`
          UPDATE udos_users SET
            user_login = ?,
            user_email = ?,
            display_name = ?,
            user_status = ?,
            roles = ?,
            context = ?,
            permissions = ?,
            last_sync = ?,
            meta = ?
          WHERE udos_id = ?
        `)
        .run(
          udosUser.user_login,
          udosUser.user_email,
          udosUser.display_name,
          udosUser.user_status,
          JSON.stringify(udosUser.roles),
          udosUser.context,
          JSON.stringify(udosUser.permissions),
          udosUser.last_sync,
          JSON.stringify(udosUser.meta),
          udosUser.udos_id
        );
    } else {
      // Insert new user
      this.sqliteDb
        .prepare(`
          INSERT INTO udos_users (
            udos_id, wp_id, user_login, user_email, display_name,
            user_status, roles, context, permissions, last_sync, meta
          ) VALUES (
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?
          )
        `)
        .run(
          udosUser.udos_id,
          udosUser.ID,
          udosUser.user_login,
          udosUser.user_email,
          udosUser.display_name,
          udosUser.user_status,
          JSON.stringify(udosUser.roles),
          udosUser.context,
          JSON.stringify(udosUser.permissions),
          udosUser.last_sync,
          JSON.stringify(udosUser.meta)
        );
    }
  }

  /**
   * Map WP roles to uDos permissions
   */
  private mapRolesToPermissions(roles: string[]): string[] {
    const permissions: string[] = [];

    // Base permissions for all users
    permissions.push('read:feed', 'create:reply');

    // Role-based permissions
    if (roles.includes('administrator')) {
      permissions.push(
        'manage:users',
        'manage:settings',
        'delete:any',
        'admin:all'
      );
    }

    if (roles.includes('editor')) {
      permissions.push(
        'edit:any',
        'publish:any',
        'moderate:comments'
      );
    }

    if (roles.includes('author')) {
      permissions.push(
        'edit:own',
        'publish:own',
        'delete:own'
      );
    }

    if (roles.includes('contributor')) {
      permissions.push('edit:own', 'delete:own');
    }

    if (roles.includes('subscriber')) {
      // Subscribers get basic permissions
    }

    return permissions;
  }

  /**
   * Get uDos user by WP ID
   */
  getUdosUserByWpId(wpId: number): UdosUser | null {
    const row = this.sqliteDb
      .prepare(`
        SELECT 
          udos_id, wp_id, user_login, user_email, display_name,
          user_status, roles, context, permissions, last_sync, meta
        FROM udos_users WHERE wp_id = ?
      `)
      .get(wpId);

    if (!row) return null;

    return {
      ...row,
      roles: JSON.parse(row.roles),
      permissions: JSON.parse(row.permissions),
      meta: JSON.parse(row.meta)
    };
  }

  /**
   * Get uDos user by email
   */
  getUdosUserByEmail(email: string): UdosUser | null {
    const row = this.sqliteDb
      .prepare(`
        SELECT 
          udos_id, wp_id, user_login, user_email, display_name,
          user_status, roles, context, permissions, last_sync, meta
        FROM udos_users WHERE user_email = ?
      `)
      .get(email);

    if (!row) return null;

    return {
      ...row,
      roles: JSON.parse(row.roles),
      permissions: JSON.parse(row.permissions),
      meta: JSON.parse(row.meta)
    };
  }

  /**
   * Get all uDos users
   */
  getAllUdosUsers(): UdosUser[] {
    const rows = this.sqliteDb
      .prepare(`
        SELECT 
          udos_id, wp_id, user_login, user_email, display_name,
          user_status, roles, context, permissions, last_sync, meta
        FROM udos_users
      `)
      .all();

    return rows.map(row => ({
      ...row,
      roles: JSON.parse(row.roles),
      permissions: JSON.parse(row.permissions),
      meta: JSON.parse(row.meta)
    }));
  }

  /**
   * Close connections
   */
  async close(): Promise<void> {
    await this.wpConnector.close();
    this.sqliteDb.close();
  }

  /**
   * Factory method
   */
  static async create(config: SyncConfig): Promise<WpUserSync> {
    const sync = new WpUserSync(config);
    
    // Test WP connection
    const wpConnected = await sync.wpConnector.testConnection();
    if (!wpConnected) {
      throw new Error('Failed to connect to WordPress database');
    }

    return sync;
  }
}

export async function syncWpUsers(config: SyncConfig): Promise<SyncResult> {
  const sync = await WpUserSync.create(config);
  try {
    return await sync.syncWpToUdos();
  } finally {
    await sync.close();
  }
}
