// Universal Feed Format Types
// Based on UNIVERSAL_FEED_INTEGRATION_PLAN.md

export type FeedSource = {
  id: string;
  name: string;
  type: 'rss' | 'atom' | 'json' | 'github' | 'gitlab' | 'webhook' | 'custom';
  url: string;
  interval?: number; // in minutes
  enabled?: boolean;
  headers?: Record<string, string>;
  auth?: {
    type: 'basic' | 'bearer' | 'oauth';
    token?: string;
    username?: string;
    password?: string;
  };
};

export type FeedItem = {
  id: string;
  feedId: string;
  title: string;
  content: string;
  url?: string;
  author?: string;
  publishedAt: string; // ISO 8601
  updatedAt?: string; // ISO 8601
  categories?: string[];
  metadata?: Record<string, any>;
  sourceType: string;
  rawData?: any; // Original raw data from source
};

export type FeedStats = {
  totalItems: number;
  lastUpdated: string;
  lastProcessed: string;
  errorCount: number;
  successCount: number;
};

export type FeedConfig = {
  sources: FeedSource[];
  processing?: {
    maxItems?: number;
    timeout?: number;
    retries?: number;
  };
  storage?: {
    type: 'jsonl' | 'sqlite' | 'memory';
    path?: string;
  };
};

export type PINGMessage = {
  type: 'PING';
  timestamp: string;
  source: string;
  data?: any;
};

export type PONGMessage = {
  type: 'PONG';
  timestamp: string;
  source: string;
  responseTo: string; // ID of the PING message being responded to
  data?: any;
};

export type FeedEvent = {
  type: 'feed_updated' | 'feed_error' | 'feed_processing' | 'ping' | 'pong';
  timestamp: string;
  feedId?: string;
  message?: PINGMessage | PONGMessage;
  error?: Error;
  data?: any;
};

export type UniversalFeed = {
  id: string;
  name: string;
  description: string;
  sources: FeedSource[];
  items: FeedItem[];
  stats: FeedStats;
  createdAt: string;
  updatedAt: string;
};