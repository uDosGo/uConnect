/**
 * WordPress Database Connector
 * Handles connections to WordPress MySQL database
 */

import knex from 'knex';
import { WpUser } from './types.js';

/**
 * WP Database Connector
 * Manages connection to WordPress MySQL database
 */
export class WpDbConnector {
  private knexInstance: knex.Knex;
  private config: knex.Knex.Config;

  constructor(config: knex.Knex.Config) {
    this.config = config;
    this.knexInstance = knex(config);
  }

  /**
   * Test database connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.knexInstance.raw('SELECT 1');
      return true;
    } catch (error) {
      console.error('WP DB connection test failed:', error);
      return false;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id: number): Promise<WpUser | null> {
    try {
      const [user] = await this.knexInstance<WpUser>('wp_users')
        .where({ ID: id })
        .select(
          'ID',
          'user_login',
          'user_email',
          'user_registered',
          'display_name',
          'user_status'
        );
      
      if (!user) return null;
      
      // Get user roles
      const roles = await this.knexInstance('wp_usermeta')
        .where({ user_id: id, meta_key: 'wp_capabilities' })
        .select('meta_value')
        .first();
      
      user.roles = roles ? Object.keys(JSON.parse(roles.meta_value)) : [];
      user.meta = {};
      
      return user;
    } catch (error) {
      console.error(`Failed to get user ${id}:`, error);
      return null;
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<WpUser | null> {
    try {
      const [user] = await this.knexInstance<WpUser>('wp_users')
        .where({ user_email: email })
        .select(
          'ID',
          'user_login',
          'user_email',
          'user_registered',
          'display_name',
          'user_status'
        );
      
      return user ? this.getUserById(user.ID) : null;
    } catch (error) {
      console.error(`Failed to get user by email ${email}:`, error);
      return null;
    }
  }

  /**
   * Get all users (with pagination)
   */
  async getAllUsers(limit: number = 100, offset: number = 0): Promise<WpUser[]> {
    try {
      const users = await this.knexInstance<WpUser>('wp_users')
        .select(
          'ID',
          'user_login',
          'user_email',
          'user_registered',
          'display_name',
          'user_status'
        )
        .limit(limit)
        .offset(offset);
      
      // Add roles to each user
      return Promise.all(users.map(user => this.getUserById(user.ID)));
    } catch (error) {
      console.error('Failed to get all users:', error);
      return [];
    }
  }

  /**
   * Create or update user
   */
  async upsertUser(user: Partial<WpUser>): Promise<number> {
    try {
      if (!user.user_login || !user.user_email) {
        throw new Error('user_login and user_email are required');
      }
      
      // Check if user exists
      const existing = await this.knexInstance('wp_users')
        .where({ user_login: user.user_login })
        .first();
      
      if (existing) {
        // Update existing user
        await this.knexInstance('wp_users')
          .where({ ID: existing.ID })
          .update({
            user_email: user.user_email,
            display_name: user.display_name || existing.display_name,
            user_status: user.user_status || existing.user_status
          });
        return existing.ID;
      } else {
        // Create new user
        const [newUser] = await this.knexInstance('wp_users')
          .insert({
            user_login: user.user_login,
            user_email: user.user_email,
            user_registered: new Date().toISOString(),
            display_name: user.display_name || user.user_login,
            user_status: user.user_status || 0
          });
        return newUser;
      }
    } catch (error) {
      console.error('Failed to upsert user:', error);
      throw error;
    }
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    await this.knexInstance.destroy();
  }

  /**
   * Get Knex instance for raw queries
   */
  getKnex(): knex.Knex {
    return this.knexInstance;
  }
}

export function createWpDbConnector(config: knex.Knex.Config): WpDbConnector {
  return new WpDbConnector(config);
}
