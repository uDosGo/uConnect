/**
 * Filtering System
 * Centralized filtering logic for import/export operations
 */

import { FilterCriteria } from './types.js';
import { WordPressPost } from '../lib/wordpress-client.js';
import { UdosNote } from '../types.js';

/**
 * Filter System
 * Provides centralized filtering capabilities for both import and export operations
 */
export class FilterSystem {
  
  /**
   * Apply multiple filters to a list of items
   */
  applyFilters<T>(items: T[], criteria: FilterCriteria): T[] {
    let filteredItems = [...items];
    
    // Apply date filter if specified
    if (criteria.date) {
      const dateFilter = this.createDateFilter(criteria.date.since, criteria.date.before);
      filteredItems = filteredItems.filter(dateFilter);
    }
    
    // Apply status filter if specified
    if (criteria.status && criteria.status.length > 0) {
      const statusFilter = this.createStatusFilter(criteria.status);
      filteredItems = filteredItems.filter(statusFilter);
    }
    
    // Apply category filter if specified
    if (criteria.categories && criteria.categories.length > 0) {
      const categoryFilter = this.createCategoryFilter(criteria.categories);
      filteredItems = filteredItems.filter(categoryFilter);
    }
    
    // Apply tag filter if specified
    if (criteria.tags && criteria.tags.length > 0) {
      const tagFilter = this.createTagFilter(criteria.tags);
      filteredItems = filteredItems.filter(tagFilter);
    }
    
    // Apply custom filter if specified
    if (criteria.custom) {
      const customFilter = this.createCustomFilter(criteria.custom);
      filteredItems = filteredItems.filter(customFilter);
    }
    
    return filteredItems;
  }
  
  /**
   * Create a date filter function
   */
  createDateFilter(since?: string, before?: string): (item: any) => boolean {
    const sinceDate = since ? new Date(since) : new Date(0);
    const beforeDate = before ? new Date(before) : new Date();
    
    return (item) => {
      // Handle both WordPress posts and uDos notes
      const itemDate = item.date ? new Date(item.date) : 
                      item.createdAt ? new Date(item.createdAt) : 
                      item.updatedAt ? new Date(item.updatedAt) : 
                      new Date(0);
      
      return itemDate >= sinceDate && itemDate <= beforeDate;
    };
  }
  
  /**
   * Create a status filter function
   */
  createStatusFilter(statuses: string[]): (item: any) => boolean {
    return (item) => {
      const itemStatus = item.status || 'draft';
      return statuses.includes(itemStatus);
    };
  }
  
  /**
   * Create a category filter function
   * Handles both WordPress category IDs (numbers) and uDos category names (strings)
   */
  createCategoryFilter(categories: (number | string)[]): (item: any) => boolean {
    return (item) => {
      // Handle WordPress posts (categories are numbers)
      if (item.categories) {
        return item.categories.some((catId: number) => 
          categories.includes(catId)
        );
      }
      
      // Handle uDos notes (categories are strings)
      if (item.categories) {
        return item.categories.some((catName: string) => 
          categories.includes(catName)
        );
      }
      
      return false;
    };
  }
  
  /**
   * Create a tag filter function
   * Handles both WordPress tag IDs (numbers) and uDos tag names (strings)
   */
  createTagFilter(tags: (number | string)[]): (item: any) => boolean {
    return (item) => {
      // Handle WordPress posts (tags are numbers)
      if (item.tags) {
        return item.tags.some((tagId: number) => 
          tags.includes(tagId)
        );
      }
      
      // Handle uDos notes (tags are strings)
      if (item.tags) {
        return item.tags.some((tagName: string) => 
          tags.includes(tagName)
        );
      }
      
      return false;
    };
  }
  
  /**
   * Create a custom filter function
   * Supports simple text matching in title or content
   */
  createCustomFilter(query: string): (item: any) => boolean {
    const lowerQuery = query.toLowerCase();
    
    return (item) => {
      const title = item.title?.toLowerCase() || '';
      const content = item.content?.toLowerCase() || '';
      const excerpt = item.excerpt?.toLowerCase() || '';
      
      return title.includes(lowerQuery) || 
             content.includes(lowerQuery) || 
             excerpt.includes(lowerQuery);
    };
  }
  
  /**
   * Create a filter for WordPress posts specifically
   */
  createWordPressPostFilter(criteria: FilterCriteria): (post: WordPressPost) => boolean {
    return (post) => {
      // Date filter
      if (criteria.date) {
        const postDate = new Date(post.date || '1970-01-01');
        const sinceDate = criteria.date.since ? new Date(criteria.date.since) : new Date(0);
        const beforeDate = criteria.date.before ? new Date(criteria.date.before) : new Date();
        
        if (postDate < sinceDate || postDate > beforeDate) {
          return false;
        }
      }
      
      // Status filter
      if (criteria.status && criteria.status.length > 0 && !criteria.status.includes(post.status || '')) {
        return false;
      }
      
      // Category filter
      if (criteria.categories && criteria.categories.length > 0 && post.categories) {
        if (!post.categories.some(cat => criteria.categories?.includes(cat))) {
          return false;
        }
      }
      
      // Tag filter
      if (criteria.tags && criteria.tags.length > 0 && post.tags) {
        if (!post.tags.some(tag => criteria.tags?.includes(tag))) {
          return false;
        }
      }
      
      // Custom filter
      if (criteria.custom) {
        const query = criteria.custom.toLowerCase();
        const title = post.title?.rendered?.toLowerCase() || '';
        const content = post.content?.rendered?.toLowerCase() || '';
        const excerpt = post.excerpt?.rendered?.toLowerCase() || '';
        
        if (!title.includes(query) && !content.includes(query) && !excerpt.includes(query)) {
          return false;
        }
      }
      
      return true;
    };
  }
  
  /**
   * Create a filter for uDos notes specifically
   */
  createUdosNoteFilter(criteria: FilterCriteria): (note: UdosNote) => boolean {
    return (note) => {
      // Date filter
      if (criteria.date) {
        const noteDate = new Date(note.updatedAt || note.createdAt || '1970-01-01');
        const sinceDate = criteria.date.since ? new Date(criteria.date.since) : new Date(0);
        const beforeDate = criteria.date.before ? new Date(criteria.date.before) : new Date();
        
        if (noteDate < sinceDate || noteDate > beforeDate) {
          return false;
        }
      }
      
      // Status filter
      if (criteria.status && criteria.status.length > 0 && !criteria.status.includes(note.status || '')) {
        return false;
      }
      
      // Category filter
      if (criteria.categories && criteria.categories.length > 0 && note.categories) {
        if (!note.categories.some(cat => criteria.categories?.includes(cat))) {
          return false;
        }
      }
      
      // Tag filter
      if (criteria.tags && criteria.tags.length > 0 && note.tags) {
        if (!note.tags.some(tag => criteria.tags?.includes(tag))) {
          return false;
        }
      }
      
      // Custom filter
      if (criteria.custom) {
        const query = criteria.custom.toLowerCase();
        const title = note.title.toLowerCase();
        const content = note.content.toLowerCase();
        
        if (!title.includes(query) && !content.includes(query)) {
          return false;
        }
      }
      
      return true;
    };
  }
  
  /**
   * Combine multiple filter criteria with AND logic
   */
  combineFilters(...filters: ((item: any) => boolean)[]): (item: any) => boolean {
    return (item) => {
      return filters.every(filter => filter(item));
    };
  }
  
  /**
   * Combine multiple filter criteria with OR logic
   */
  combineFiltersOr(...filters: ((item: any) => boolean)[]): (item: any) => boolean {
    return (item) => {
      return filters.some(filter => filter(item));
    };
  }
}

/**
 * Filter System Factory
 */
export class FilterSystemFactory {
  private static instance: FilterSystem | null = null;
  
  static getFilterSystem(): FilterSystem {
    if (!this.instance) {
      this.instance = new FilterSystem();
    }
    return this.instance;
  }
  
  static reset(): void {
    this.instance = null;
  }
}