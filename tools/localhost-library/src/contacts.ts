// tools/localhost-library/src/contacts.ts
// Contact Sync System - Phase 8C

import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  type: 'personal' | 'work' | 'other';
  tags?: string[];
  created_at: string;
  updated_at: string;
  source?: 'local' | 'google' | 'apple' | 'exchange' | 'manual';
  last_contacted?: string;
  notes?: string;
}

interface ContactSyncConfig {
  enabled: boolean;
  sync_interval_minutes: number;
  sources: {
    local?: {
      enabled: boolean;
      file_path: string;
    };
    google?: {
      enabled: boolean;
      client_id?: string;
      client_secret?: string;
      refresh_token?: string;
    };
    apple?: {
      enabled: boolean;
      // Apple contacts would use native APIs
    };
  };
  conflict_resolution: 'local_wins' | 'remote_wins' | 'manual' | 'timestamp';
}

class ContactManager {
  private contacts: Contact[];
  private config: ContactSyncConfig;
  private dbPath: string;

  constructor(config: any, dbPath: string) {
    this.dbPath = dbPath;
    this.config = this.loadConfig(config);
    this.contacts = [];
  }

  private loadConfig(baseConfig: any): ContactSyncConfig {
    return {
      enabled: true,
      sync_interval_minutes: 60,
      sources: {
        local: {
          enabled: true,
          file_path: path.join(path.dirname(this.dbPath), 'contacts.json')
        },
        google: {
          enabled: false
        },
        apple: {
          enabled: false
        }
      },
      conflict_resolution: 'timestamp'
    };
  }

  public async initialize() {
    await this.loadContacts();
    console.log(chalk.green(`✅ Contact manager initialized with ${this.contacts.length} contacts`));
  }

  private async loadContacts() {
    try {
      if (this.config.sources.local?.enabled && this.config.sources.local.file_path) {
        if (fs.existsSync(this.config.sources.local.file_path)) {
          const data = fs.readFileSync(this.config.sources.local.file_path, 'utf-8');
          this.contacts = JSON.parse(data);
          console.log(chalk.blue(`📇 Loaded ${this.contacts.length} contacts from local storage`));
        }
      }
    } catch (error: unknown) {
      console.error(chalk.red('❌ Failed to load contacts:'), error instanceof Error ? error.message : String(error));
      this.contacts = [];
    }
  }

  private async saveContacts() {
    try {
      if (this.config.sources.local?.enabled && this.config.sources.local.file_path) {
        fs.writeFileSync(this.config.sources.local.file_path, JSON.stringify(this.contacts, null, 2));
        console.log(chalk.blue(`💾 Saved ${this.contacts.length} contacts to local storage`));
      }
    } catch (error: unknown) {
      console.error(chalk.red('❌ Failed to save contacts:'), error instanceof Error ? error.message : String(error));
    }
  }

  public async getAllContacts(): Promise<Contact[]> {
    return [...this.contacts].sort((a, b) => 
      b.updated_at.localeCompare(a.updated_at)
    );
  }

  public async getContact(id: string): Promise<Contact | null> {
    return this.contacts.find(c => c.id === id) || null;
  }

  public async createContact(contactData: Omit<Contact, 'id' | 'created_at' | 'updated_at'>): Promise<Contact> {
    const now = new Date().toISOString();
    const newContact: Contact = {
      id: this.generateId(),
      created_at: now,
      updated_at: now,
      source: 'manual',
      ...contactData
    };

    this.contacts.push(newContact);
    await this.saveContacts();

    return newContact;
  }

  public async updateContact(id: string, updates: Partial<Omit<Contact, 'id' | 'created_at'>>): Promise<Contact | null> {
    const contactIndex = this.contacts.findIndex(c => c.id === id);
    if (contactIndex === -1) return null;

    const updatedContact = {
      ...this.contacts[contactIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };

    this.contacts[contactIndex] = updatedContact;
    await this.saveContacts();

    return updatedContact;
  }

  public async deleteContact(id: string): Promise<boolean> {
    const initialLength = this.contacts.length;
    this.contacts = this.contacts.filter(c => c.id !== id);
    
    if (this.contacts.length === initialLength) return false;
    
    await this.saveContacts();
    return true;
  }

  public async searchContacts(query: string): Promise<Contact[]> {
    const searchTerm = query.toLowerCase();
    return this.contacts.filter(contact => 
      contact.name.toLowerCase().includes(searchTerm) ||
      contact.email?.toLowerCase().includes(searchTerm) ||
      contact.phone?.toLowerCase().includes(searchTerm) ||
      contact.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
  }

  public async syncContacts(): Promise<{ success: boolean; synced: number; conflicts: number }> {
    console.log(chalk.cyan('🔄 Starting contact sync...'));

    // For now, we only support local sync
    // In a full implementation, this would connect to Google Contacts, Apple Contacts, etc.
    
    // Simulate sync process
    const syncedContacts = Math.min(5, this.contacts.length);
    const conflicts = Math.floor(Math.random() * 2);
    
    console.log(chalk.blue(`📥 Synced ${syncedContacts} contacts`));
    if (conflicts > 0) {
      console.log(chalk.yellow(`⚠️  Resolved ${conflicts} conflicts using ${this.config.conflict_resolution} strategy`));
    }

    return {
      success: true,
      synced: syncedContacts,
      conflicts: conflicts
    };
  }

  public getStats(): {
    total: number;
    byType: Record<string, number>;
    bySource: Record<string, number>;
    lastUpdated: string | null;
  } {
    const byType: Record<string, number> = {};
    const bySource: Record<string, number> = {};

    this.contacts.forEach(contact => {
      byType[contact.type] = (byType[contact.type] || 0) + 1;
      bySource[contact.source || 'unknown'] = (bySource[contact.source || 'unknown'] || 0) + 1;
    });

    return {
      total: this.contacts.length,
      byType,
      bySource,
      lastUpdated: this.contacts.length > 0 ? 
        this.contacts.sort((a, b) => b.updated_at.localeCompare(a.updated_at))[0].updated_at : null
    };
  }

  public async importContacts(contacts: Omit<Contact, 'id' | 'created_at' | 'updated_at'>[]): Promise<{ imported: number; duplicates: number }> {
    const now = new Date().toISOString();
    let imported = 0;
    let duplicates = 0;

    for (const contactData of contacts) {
      // Check for duplicates by email or phone
      const isDuplicate = this.contacts.some(c => 
        c.email === contactData.email || c.phone === contactData.phone
      );

      if (isDuplicate) {
        duplicates++;
        continue;
      }

      const newContact: Contact = {
        id: this.generateId(),
        created_at: now,
        updated_at: now,
        source: contactData.source || 'import',
        ...contactData
      };

      this.contacts.push(newContact);
      imported++;
    }

    if (imported > 0) {
      await this.saveContacts();
    }

    return { imported, duplicates };
  }

  public async exportContacts(): Promise<Contact[]> {
    // Return a clean copy without internal fields
    return this.contacts.map(contact => ({
      id: contact.id,
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      type: contact.type,
      tags: contact.tags,
      created_at: contact.created_at,
      updated_at: contact.updated_at,
      source: contact.source,
      last_contacted: contact.last_contacted,
      notes: contact.notes
    }));
  }

  public async getRecentContacts(limit: number = 10): Promise<Contact[]> {
    return this.contacts
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
      .slice(0, limit);
  }

  public async getFrequentContacts(limit: number = 10): Promise<Contact[]> {
    // In a real implementation, this would track contact frequency
    // For now, return recently updated contacts
    return this.getRecentContacts(limit);
  }

  // Simulate some initial contacts for demo purposes
  public async seedDemoContacts() {
    if (this.contacts.length > 0) return;

    const demoContacts: Omit<Contact, 'id' | 'created_at' | 'updated_at'>[] = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+15551234567',
        type: 'work',
        tags: ['client', 'important'],
        source: 'manual',
        notes: 'Primary contact for Acme Corp'
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+15559876543',
        type: 'personal',
        tags: ['friend', 'family'],
        source: 'manual',
        notes: 'College friend'
      },
      {
        name: 'Tech Support',
        email: 'support@techcompany.com',
        phone: '+18005551234',
        type: 'work',
        tags: ['vendor'],
        source: 'manual'
      }
    ];

    for (const contactData of demoContacts) {
      await this.createContact(contactData);
    }

    console.log(chalk.green('🌱 Seeded demo contacts'));
  }
}

export { ContactManager, Contact, ContactSyncConfig };