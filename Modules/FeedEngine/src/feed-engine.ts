import { FeedSource, FeedItem, FeedConfig, UniversalFeed, FeedStats, PINGMessage, PONGMessage, FeedEvent } from './types.js';
import axios from 'axios';
import { parse } from 'node-html-parser';
import { Feed } from 'feed';
import fs from 'fs-extra';
import path from 'node:path';

/**
 * Universal Feed Engine
 * Implements the universal feed format with PING/PONG operations
 */
export class FeedEngine {
  private config: FeedConfig;
  private feeds: Map<string, UniversalFeed>;
  private eventListeners: ((event: FeedEvent) => void)[];
  
  constructor(config: FeedConfig) {
    this.config = config;
    this.feeds = new Map();
    this.eventListeners = [];
    
    // Initialize feeds from config
    this.initializeFeeds();
  }
  
  private initializeFeeds(): void {
    for (const source of this.config.sources) {
      const feed: UniversalFeed = {
        id: source.id,
        name: source.name,
        description: `Feed from ${source.type} source: ${source.url}`,
        sources: [source],
        items: [],
        stats: {
          totalItems: 0,
          lastUpdated: new Date().toISOString(),
          lastProcessed: new Date().toISOString(),
          errorCount: 0,
          successCount: 0
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.feeds.set(source.id, feed);
    }
  }
  
  public async fetchAllFeeds(): Promise<void> {
    const promises = Array.from(this.feeds.values()).map(feed => 
      this.fetchFeed(feed.sources[0])
    );
    await Promise.all(promises);
  }
  
  public async fetchFeed(source: FeedSource): Promise<void> {
    const feed = this.feeds.get(source.id);
    if (!feed) {
      this.emitEvent({
        type: 'feed_error',
        timestamp: new Date().toISOString(),
        feedId: source.id,
        error: new Error(`Feed ${source.id} not found`)
      });
      return;
    }
    
    this.emitEvent({
      type: 'feed_processing',
      timestamp: new Date().toISOString(),
      feedId: source.id
    });
    
    try {
      let items: FeedItem[] = [];
      
      switch (source.type) {
        case 'rss':
        case 'atom':
          items = await this.fetchRSSFeed(source);
          break;
        case 'json':
          items = await this.fetchJSONFeed(source);
          break;
        case 'github':
          items = await this.fetchGitHubFeed(source);
          break;
        case 'webhook':
          // Webhook feeds are passive, they get updated via incoming requests
          items = feed.items;
          break;
        case 'custom':
          // Custom feeds would be handled by plugins
          items = feed.items;
          break;
      }
      
      // Update feed with new items
      feed.items = this.mergeItems(feed.items, items);
      feed.stats.totalItems = feed.items.length;
      feed.stats.lastUpdated = new Date().toISOString();
      feed.stats.successCount++;
      feed.updatedAt = new Date().toISOString();
      
      this.emitEvent({
        type: 'feed_updated',
        timestamp: new Date().toISOString(),
        feedId: source.id,
        data: { itemsAdded: items.length }
      });
      
    } catch (error) {
      feed.stats.errorCount++;
      this.emitEvent({
        type: 'feed_error',
        timestamp: new Date().toISOString(),
        feedId: source.id,
        error: error instanceof Error ? error : new Error(String(error))
      });
    }
  }
  
  private async fetchRSSFeed(source: FeedSource): Promise<FeedItem[]> {
    const response = await this.fetchWithAuth(source);
    const root = parse(response.data);
    const items = root.querySelectorAll('item, entry');
    
    return items.map((item: any, index: number) => ({
      id: item.querySelector('guid, id')?.textContent || `${source.id}-${index}`,
      feedId: source.id,
      title: item.querySelector('title')?.textContent || 'Untitled',
      content: item.querySelector('description, content, summary')?.textContent || '',
      url: item.querySelector('link')?.getAttribute('href') || undefined,
      author: item.querySelector('author, dc\:creator')?.textContent || undefined,
      publishedAt: item.querySelector('pubDate, published, updated')?.textContent || new Date().toISOString(),
      sourceType: source.type,
      rawData: item
    }));
  }
  
  private async fetchJSONFeed(source: FeedSource): Promise<FeedItem[]> {
    const response = await this.fetchWithAuth(source);
    const data = response.data;
    
    if (Array.isArray(data)) {
      return data.map((item: any, index: number) => ({
        id: item.id || `${source.id}-${index}`,
        feedId: source.id,
        title: item.title || item.name || 'Untitled',
        content: item.content || item.description || '',
        url: item.url || item.link || undefined,
        author: item.author || undefined,
        publishedAt: item.publishedAt || item.date || new Date().toISOString(),
        sourceType: source.type,
        rawData: item
      }));
    } else if (data.items || data.entries) {
      const items = data.items || data.entries;
      return items.map((item: any, index: number) => ({
        id: item.id || `${source.id}-${index}`,
        feedId: source.id,
        title: item.title || 'Untitled',
        content: item.content || item.description || '',
        url: item.url || undefined,
        author: item.author || undefined,
        publishedAt: item.publishedAt || new Date().toISOString(),
        sourceType: source.type,
        rawData: item
      }));
    } else {
      return [{
        id: `${source.id}-0`,
        feedId: source.id,
        title: source.name || 'JSON Feed',
        content: JSON.stringify(data, null, 2),
        publishedAt: new Date().toISOString(),
        sourceType: source.type,
        rawData: data
      }];
    }
  }
  
  private async fetchGitHubFeed(source: FeedSource): Promise<FeedItem[]> {
    // GitHub feeds typically require authentication
    const response = await this.fetchWithAuth(source);
    const data = response.data;
    
    if (Array.isArray(data)) {
      return data.map((item: any, index: number) => ({
        id: item.id || item.node_id || `${source.id}-${index}`,
        feedId: source.id,
        title: item.title || item.name || item.login || 'GitHub Event',
        content: item.body || item.description || JSON.stringify(item, null, 2),
        url: item.html_url || undefined,
        author: item.user?.login || item.login || undefined,
        publishedAt: item.created_at || item.updated_at || new Date().toISOString(),
        sourceType: source.type,
        rawData: item
      }));
    } else {
      return [{
        id: `${source.id}-0`,
        feedId: source.id,
        title: source.name || 'GitHub Feed',
        content: JSON.stringify(data, null, 2),
        publishedAt: new Date().toISOString(),
        sourceType: source.type,
        rawData: data
      }];
    }
  }
  
  private async fetchWithAuth(source: FeedSource): Promise<any> {
    const config: any = {
      headers: source.headers || {},
      timeout: this.config.processing?.timeout || 10000
    };
    
    if (source.auth) {
      switch (source.auth.type) {
        case 'basic':
          if (source.auth.username && source.auth.password) {
            config.auth = {
              username: source.auth.username,
              password: source.auth.password
            };
          }
          break;
        case 'bearer':
          if (source.auth.token) {
            config.headers = {
              ...config.headers,
              'Authorization': `Bearer ${source.auth.token}`
            };
          }
          break;
        case 'oauth':
          if (source.auth.token) {
            config.headers = {
              ...config.headers,
              'Authorization': `Bearer ${source.auth.token}`
            };
          }
          break;
      }
    }
    
    return await axios.get(source.url, config);
  }
  
  private mergeItems(existingItems: FeedItem[], newItems: FeedItem[]): FeedItem[] {
    const existingIds = new Set(existingItems.map(item => item.id));
    const uniqueNewItems = newItems.filter(item => !existingIds.has(item.id));
    return [...uniqueNewItems, ...existingItems];
  }
  
  // PING/PONG Operations
  public sendPING(source: string, data?: any): PINGMessage {
    const message: PINGMessage = {
      type: 'PING',
      timestamp: new Date().toISOString(),
      source: source,
      data: data
    };
    
    this.emitEvent({
      type: 'ping',
      timestamp: message.timestamp,
      message: message
    });
    
    return message;
  }
  
  public sendPONG(pingMessage: PINGMessage, data?: any): PONGMessage {
    const message: PONGMessage = {
      type: 'PONG',
      timestamp: new Date().toISOString(),
      source: 'feed-engine',
      responseTo: pingMessage.timestamp, // Using timestamp as ID for simplicity
      data: data
    };
    
    this.emitEvent({
      type: 'pong',
      timestamp: message.timestamp,
      message: message
    });
    
    return message;
  }
  
  // Event System
  public onEvent(listener: (event: FeedEvent) => void): void {
    this.eventListeners.push(listener);
  }
  
  public offEvent(listener: (event: FeedEvent) => void): void {
    this.eventListeners = this.eventListeners.filter(l => l !== listener);
  }
  
  private emitEvent(event: FeedEvent): void {
    for (const listener of this.eventListeners) {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in feed event listener:', error);
      }
    }
  }
  
  // Storage Operations
  public async saveToStorage(feedId: string, storageType: 'jsonl' | 'json' = 'jsonl'): Promise<void> {
    const feed = this.feeds.get(feedId);
    if (!feed) {
      throw new Error(`Feed ${feedId} not found`);
    }
    
    const storageConfig = this.config.storage || { type: 'jsonl' };
    const storagePath = storageConfig.path || './feeds';
    
    await fs.ensureDir(storagePath);
    
    if (storageType === 'jsonl') {
      const filePath = path.join(storagePath, `${feedId}.jsonl`);
      const lines = feed.items.map(item => JSON.stringify(item));
      await fs.writeFile(filePath, lines.join('\n') + '\n');
    } else {
      const filePath = path.join(storagePath, `${feedId}.json`);
      await fs.writeFile(filePath, JSON.stringify(feed, null, 2));
    }
  }
  
  public async loadFromStorage(feedId: string, storageType: 'jsonl' | 'json' = 'jsonl'): Promise<void> {
    const storageConfig = this.config.storage || { type: 'jsonl' };
    const storagePath = storageConfig.path || './feeds';
    
    try {
      if (storageType === 'jsonl') {
        const filePath = path.join(storagePath, `${feedId}.jsonl`);
        if (await fs.pathExists(filePath)) {
          const content = await fs.readFile(filePath, 'utf8');
          const lines = content.split('\n').filter(line => line.trim());
          const items = lines.map(line => JSON.parse(line));
          
          const feed = this.feeds.get(feedId);
          if (feed) {
            feed.items = items;
            feed.stats.totalItems = items.length;
            feed.stats.lastUpdated = new Date().toISOString();
          }
        }
      } else {
        const filePath = path.join(storagePath, `${feedId}.json`);
        if (await fs.pathExists(filePath)) {
          const content = await fs.readFile(filePath, 'utf8');
          const feedData = JSON.parse(content);
          this.feeds.set(feedId, feedData);
        }
      }
    } catch (error) {
      console.error(`Error loading feed ${feedId} from storage:`, error);
      throw error;
    }
  }
  
  // Feed Management
  public getFeed(feedId: string): UniversalFeed | undefined {
    return this.feeds.get(feedId);
  }
  
  public getAllFeeds(): UniversalFeed[] {
    return Array.from(this.feeds.values());
  }
  
  public addFeedSource(source: FeedSource): void {
    const feed: UniversalFeed = {
      id: source.id,
      name: source.name,
      description: `Feed from ${source.type} source: ${source.url}`,
      sources: [source],
      items: [],
      stats: {
        totalItems: 0,
        lastUpdated: new Date().toISOString(),
        lastProcessed: new Date().toISOString(),
        errorCount: 0,
        successCount: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.feeds.set(source.id, feed);
    this.config.sources.push(source);
  }
  
  public removeFeedSource(sourceId: string): void {
    this.feeds.delete(sourceId);
    this.config.sources = this.config.sources.filter(source => source.id !== sourceId);
  }
  
  public async startScheduling(intervalMinutes: number = 60): Promise<void> {
    console.log(`Starting feed scheduling with interval: ${intervalMinutes} minutes`);
    
    // Initial fetch
    await this.fetchAllFeeds();
    
    // Schedule periodic fetches
    setInterval(async () => {
      console.log('Running scheduled feed fetch...');
      await this.fetchAllFeeds();
    }, intervalMinutes * 60 * 1000);
  }
}