// tools/localhost-library/src/db.ts
// User Database with SQLite - Phase 8B

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcrypt';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

// SQLite database wrapper with promises
sqlite3.verbose();

// User interface
interface User {
  id?: number;
  user_login: string;
  user_pass: string;
  user_email?: string;
  display_name?: string;
  role: 'admin' | 'editor' | 'viewer' | 'guest';
  home_device?: string;
  trusted_devices?: string; // JSON array
  contact_sync_enabled?: number; // 0 or 1
  created_at?: string;
  last_seen?: string;
}

interface Session {
  session_id: string;
  user_id: number;
  expires: string;
  ip?: string;
}

// Database class
class UserDatabase {
  private db: any;
  private dbPath: string;
  private jwtSecret: string;

  constructor(dbPath: string, jwtSecret: string = 'udos-default-secret-change-me') {
    this.dbPath = dbPath;
    this.jwtSecret = jwtSecret;
    this.db = null;
  }

  // Initialize database connection
  async initialize(): Promise<void> {
    try {
      // Ensure directory exists
      const dbDir = path.dirname(this.dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      // Open database connection
      this.db = await open({
        filename: this.dbPath,
        driver: sqlite3.Database
      });

      // Create tables if they don't exist
      await this.createTables();

      // Create default admin user if none exists
      await this.createDefaultAdmin();

      console.log(chalk.green(`✅ Database initialized: ${this.dbPath}`));
    } catch (error: unknown) {
      console.error(chalk.red('❌ Database initialization failed:'), 
        error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  // Create database tables
  private async createTables(): Promise<void> {
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS wp_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_login TEXT UNIQUE NOT NULL,
        user_pass TEXT NOT NULL,
        user_email TEXT,
        display_name TEXT,
        role TEXT DEFAULT 'viewer',
        home_device TEXT,
        trusted_devices TEXT,
        contact_sync_enabled INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_seen DATETIME
      )
    `);

    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS wp_sessions (
        session_id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        expires DATETIME NOT NULL,
        ip TEXT,
        FOREIGN KEY (user_id) REFERENCES wp_users(id)
      )
    `);

    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS wp_options (
        option_name TEXT PRIMARY KEY,
        option_value TEXT
      )
    `);

    // Create indexes for performance
    await this.db.exec('CREATE INDEX IF NOT EXISTS idx_users_login ON wp_users(user_login)');
    await this.db.exec('CREATE INDEX IF NOT EXISTS idx_users_role ON wp_users(role)');
    await this.db.exec('CREATE INDEX IF NOT EXISTS idx_sessions_user ON wp_sessions(user_id)');
    await this.db.exec('CREATE INDEX IF NOT EXISTS idx_sessions_expires ON wp_sessions(expires)');

    console.log(chalk.blue('📋 Database tables created'));
  }

  // Create default admin user if database is empty
  private async createDefaultAdmin(): Promise<void> {
    const count = await this.db.get('SELECT COUNT(*) as count FROM wp_users');
    
    if (count.count === 0) {
      const adminUser: User = {
        user_login: 'admin',
        user_pass: await this.hashPassword('admin'),
        user_email: 'admin@example.com',
        display_name: 'Administrator',
        role: 'admin',
        contact_sync_enabled: 1
      };

      await this.createUser(adminUser);
      console.log(chalk.yellow('⚠️  Created default admin user: admin/admin'));
      console.log(chalk.yellow('⚠️  Please change the password immediately!'));
    }
  }

  // Hash password using bcrypt
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  // Create a new user
  async createUser(user: User): Promise<User> {
    const hashedPassword = await this.hashPassword(user.user_pass);
    
    const result = await this.db.run(
      `INSERT INTO wp_users (
        user_login, user_pass, user_email, display_name, 
        role, home_device, trusted_devices, contact_sync_enabled
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user.user_login,
        hashedPassword,
        user.user_email,
        user.display_name,
        user.role,
        user.home_device,
        user.trusted_devices || '[]',
        user.contact_sync_enabled || 1
      ]
    );

    return { ...user, id: result.lastID };
  }

  // Find user by login
  async findUserByLogin(login: string): Promise<User | null> {
    return await this.db.get(
      'SELECT * FROM wp_users WHERE user_login = ?',
      [login]
    ) || null;
  }

  // Find user by email
  async findUserByEmail(email: string): Promise<User | null> {
    return await this.db.get(
      'SELECT * FROM wp_users WHERE user_email = ?',
      [email]
    ) || null;
  }

  // Find user by ID
  async findUserById(id: number): Promise<User | null> {
    return await this.db.get(
      'SELECT * FROM wp_users WHERE id = ?',
      [id]
    ) || null;
  }

  // Verify user password
  async verifyPassword(login: string, password: string): Promise<boolean> {
    const user = await this.findUserByLogin(login);
    if (!user) return false;
    
    return await bcrypt.compare(password, user.user_pass);
  }

  // Update user last seen timestamp
  async updateLastSeen(userId: number): Promise<void> {
    await this.db.run(
      'UPDATE wp_users SET last_seen = CURRENT_TIMESTAMP WHERE id = ?',
      [userId]
    );
  }

  // Create a new session
  async createSession(session: Session): Promise<Session> {
    await this.db.run(
      `INSERT INTO wp_sessions (
        session_id, user_id, expires, ip
      ) VALUES (?, ?, ?, ?)`,
      [session.session_id, session.user_id, session.expires, session.ip]
    );
    
    return session;
  }

  // Find session by ID
  async findSession(sessionId: string): Promise<Session | null> {
    return await this.db.get(
      'SELECT * FROM wp_sessions WHERE session_id = ?',
      [sessionId]
    ) || null;
  }

  // Delete session
  async deleteSession(sessionId: string): Promise<void> {
    await this.db.run(
      'DELETE FROM wp_sessions WHERE session_id = ?',
      [sessionId]
    );
  }

  // Clean up expired sessions
  async cleanupExpiredSessions(): Promise<number> {
    const result = await this.db.run(
      'DELETE FROM wp_sessions WHERE expires < CURRENT_TIMESTAMP'
    );
    
    return result.changes || 0;
  }

  // List all users
  async listUsers(): Promise<User[]> {
    return await this.db.all(
      'SELECT * FROM wp_users ORDER BY created_at DESC'
    );
  }

  // Update user role
  async updateUserRole(userId: number, role: User['role']): Promise<void> {
    await this.db.run(
      'UPDATE wp_users SET role = ? WHERE id = ?',
      [role, userId]
    );
  }

  // Delete user
  async deleteUser(userId: number): Promise<void> {
    // First delete sessions
    await this.db.run('DELETE FROM wp_sessions WHERE user_id = ?', [userId]);
    
    // Then delete user
    await this.db.run('DELETE FROM wp_users WHERE id = ?', [userId]);
  }

  // Get user option
  async getOption(name: string): Promise<string | null> {
    const result = await this.db.get(
      'SELECT option_value FROM wp_options WHERE option_name = ?',
      [name]
    );
    
    return result?.option_value || null;
  }

  // Set user option
  async setOption(name: string, value: string): Promise<void> {
    await this.db.run(
      `INSERT OR REPLACE INTO wp_options (option_name, option_value) 
       VALUES (?, ?)`,
      [name, value]
    );
  }

  // Generate JWT token for user
  generateToken(user: User): string {
    return jwt.sign(
      {
        userId: user.id,
        username: user.user_login,
        role: user.role
      },
      this.jwtSecret,
      { expiresIn: '24h' }
    );
  }

  // Verify JWT token
  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      return null;
    }
  }

  // Generate session ID
  generateSessionId(): string {
    return uuidv4();
  }

  // Close database connection
  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      console.log(chalk.blue('💾 Database connection closed'));
    }
  }

  // Get database path
  getDbPath(): string {
    return this.dbPath;
  }

  // Get JWT secret (for testing)
  getJwtSecret(): string {
    return this.jwtSecret;
  }
}

export { UserDatabase, User, Session };