import axios from 'axios';
import { getConfig } from '../config.js';

/**
 * WordPress Configuration Interface
 */
export interface WordPressConfig {
  WORDPRESS_URL?: string;
  WORDPRESS_USERNAME?: string;
  WORDPRESS_APPLICATION_PASSWORD?: string;
  POST_TYPE?: string;
}

/**
 * WordPress Post interface
 */
export interface WordPressPost {
  id?: number;
  date?: string;
  date_gmt?: string;
  guid?: { rendered: string };
  modified?: string;
  modified_gmt?: string;
  slug?: string;
  status?: string;
  type?: string;
  link?: string;
  title?: { rendered: string };
  content?: { rendered: string; protected: boolean };
  excerpt?: { rendered: string; protected: boolean };
  author?: number;
  featured_media?: number;
  comment_status?: string;
  ping_status?: string;
  sticky?: boolean;
  template?: string;
  format?: string;
  meta?: any;
  categories?: number[];
  tags?: number[];
  [key: string]: any;
}

export interface WordPressMedia {
  id: number;
  date: string;
  slug: string;
  type: string;
  link: string;
  title: { rendered: string };
  author: number;
  caption?: string;
  alt_text?: string;
  media_type?: string;
  mime_type?: string;
  source_url?: string;
  [key: string]: any;
}

export interface WordPressUser {
  id: number;
  name: string;
  url: string;
  description: string;
  link: string;
  slug: string;
  avatar_urls: { [size: string]: string };
  [key: string]: any;
}

export interface WordPressCategory {
  id: number;
  name: string;
  slug: string;
  link: string;
  [key: string]: any;
}

export interface WordPressTag {
  id: number;
  name: string;
  slug: string;
  link: string;
  [key: string]: any;
}

export interface APIError {
  code: string;
  message: string;
  data?: { status?: number; [key: string]: any };
}

/**
 * WordPress REST API Client
 * Full implementation for A2 WordPress integration
 */
export class WordPressClient {
  private client: any;
  private config: WordPressConfig;
  
  constructor(config: WordPressConfig) {
    if (!config.WORDPRESS_URL) {
      throw new Error('WordPress URL is required');
    }
    
    this.config = config;
    
    // Build the WordPress REST API base URL
    const baseURL = config.WORDPRESS_URL.endsWith('/') 
      ? `${config.WORDPRESS_URL}wp-json/wp/v2`
      : `${config.WORDPRESS_URL}/wp-json/wp/v2`;
    
    // Create axios instance with basic auth
    this.client = axios.create({
      baseURL,
      auth: config.WORDPRESS_USERNAME && config.WORDPRESS_APPLICATION_PASSWORD ? {
        username: config.WORDPRESS_USERNAME,
        password: config.WORDPRESS_APPLICATION_PASSWORD
      } : undefined,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'uDosConnect/1.0'
      },
      timeout: 30000
    });
  }
  
  /**
   * Get WordPress configuration from environment or config files
   */
  static async createFromConfig(): Promise<WordPressClient> {
    const config = await getConfig();
    
    return new WordPressClient({
      WORDPRESS_URL: process.env.WORDPRESS_URL || config.WORDPRESS_URL,
      WORDPRESS_USERNAME: process.env.WORDPRESS_USERNAME || config.WORDPRESS_USERNAME,
      WORDPRESS_APPLICATION_PASSWORD: process.env.WORDPRESS_APPLICATION_PASSWORD || config.WORDPRESS_APPLICATION_PASSWORD,
      POST_TYPE: process.env.POST_TYPE || config.POST_TYPE || 'post'
    });
  }
  
  /**
   * Test API connectivity
   */
  async testConnectivity(): Promise<boolean> {
    try {
      await this.getPosts({ perPage: 1 });
      return true;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Get posts with pagination
   */
  async getPosts(options: {
    perPage?: number;
    page?: number;
    categories?: number[];
    tags?: number[];
    search?: string;
    after?: string;
    before?: string;
    status?: string[];
  } = {}): Promise<WordPressPost[]> {
    const params: any = {
      per_page: options.perPage || 10,
      page: options.page || 1,
      context: 'edit'
    };
    
    if (options.categories) params.categories = options.categories.join(',');
    if (options.tags) params.tags = options.tags.join(',');
    if (options.search) params.search = options.search;
    if (options.after) params.after = options.after;
    if (options.before) params.before = options.before;
    if (options.status) params.status = options.status.join(',');
    
    const response = await this.client.get('/posts', { params });
    return response.data;
  }
  
  /**
   * Get media item by ID
   */
  async getMedia(mediaId: number): Promise<any> {
    const response = await this.client.get(`/media/${mediaId}`);
    return response.data;
  }
  
  /**
   * Get a single post by ID
   */
  async getPost(id: number): Promise<WordPressPost> {
    const response = await this.client.get(`/posts/${id}`, {
      params: { context: 'edit' }
    });
    return response.data;
  }
  
  /**
   * Create a new post
   */
  async createPost(post: WordPressPost): Promise<WordPressPost> {
    const response = await this.client.post('/posts', post, {
      params: { status: post.status || 'draft' }
    });
    return response.data;
  }
  
  /**
   * Update an existing post
   */
  async updatePost(id: number, post: WordPressPost): Promise<WordPressPost> {
    const response = await this.client.post(`/posts/${id}`, post);
    return response.data;
  }
  
  /**
   * Delete a post
   */
  async deletePost(id: number, force: boolean = false): Promise<any> {
    await this.client.delete(`/posts/${id}`, {
      params: { force }
    });
  }
  
  /**
   * Upload media file
   */
  async uploadMedia(filePath: string, fileName?: string): Promise<WordPressMedia> {
    throw new Error('Media upload not yet implemented in A2');
  }
  
  /**
   * Get all categories
   */
  async getCategories(): Promise<WordPressCategory[]> {
    const response = await this.client.get('/categories', {
      params: { per_page: 100, context: 'view' }
    });
    return response.data;
  }
  
  /**
   * Get all tags
   */
  async getTags(): Promise<WordPressTag[]> {
    const response = await this.client.get('/tags', {
      params: { per_page: 100, context: 'view' }
    });
    return response.data;
  }
  
  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<WordPressUser> {
    const response = await this.client.get('/users/me', {
      params: { context: 'edit' }
    });
    return response.data;
  }
}

/**
 * WordPress API Client Factory
 */
export class WordPressClientFactory {
  private static instance: WordPressClient | null = null;
  
  static async getClient(): Promise<WordPressClient> {
    if (!this.instance) {
      this.instance = await WordPressClient.createFromConfig();
    }
    return this.instance;
  }
  
  static reset(): void {
    this.instance = null;
  }
}