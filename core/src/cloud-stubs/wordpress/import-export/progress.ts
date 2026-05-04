/**
 * Progress Tracking System
 * Real-time progress tracking for import/export operations
 */

import { ProgressStatus, ProgressSummary } from './types.js';

/**
 * Progress Tracker
 * Tracks and reports progress for long-running operations
 */
export class ProgressTracker {
  private operation: string;
  private total: number;
  private completed: number;
  private success: number;
  private failed: number;
  private startTime: number;
  private lastUpdateTime: number;
  private updateIntervalMs: number;
  private onProgressUpdate?: (status: ProgressStatus) => void;
  
  constructor() {
    this.operation = '';
    this.total = 0;
    this.completed = 0;
    this.success = 0;
    this.failed = 0;
    this.startTime = 0;
    this.lastUpdateTime = 0;
    this.updateIntervalMs = 1000; // Default: update every 1 second
  }
  
  /**
   * Start tracking a new operation
   */
  startTracking(operation: string, total: number, updateIntervalMs: number = 1000): void {
    this.operation = operation;
    this.total = total;
    this.completed = 0;
    this.success = 0;
    this.failed = 0;
    this.startTime = Date.now();
    this.lastUpdateTime = this.startTime;
    this.updateIntervalMs = updateIntervalMs;
    
    console.log(`🚀 Starting ${operation}: ${total} items to process`);
    this.reportProgress();
  }
  
  /**
   * Update progress with a completed item
   */
  updateProgress(isSuccess: boolean = true): void {
    this.completed++;
    if (isSuccess) {
      this.success++;
    } else {
      this.failed++;
    }
    
    // Report progress at specified intervals
    const now = Date.now();
    if (now - this.lastUpdateTime >= this.updateIntervalMs) {
      this.reportProgress();
      this.lastUpdateTime = now;
    }
  }
  
  /**
   * Complete the tracking and return summary
   */
  completeTracking(): ProgressSummary {
    const endTime = Date.now();
    const durationMs = endTime - this.startTime;
    
    // Final progress report
    this.reportProgress(true);
    
    const summary: ProgressSummary = {
      operation: this.operation,
      total: this.total,
      completed: this.completed,
      success: this.success,
      failed: this.failed,
      durationMs: durationMs,
      startedAt: new Date(this.startTime).toISOString(),
      completedAt: new Date(endTime).toISOString()
    };
    
    console.log(`✅ Completed ${this.operation} in ${durationMs}ms`);
    console.log(`📊 Results: ${this.success} succeeded, ${this.failed} failed`);
    
    // Reset for next operation
    this.operation = '';
    this.total = 0;
    this.completed = 0;
    this.success = 0;
    this.failed = 0;
    this.startTime = 0;
    this.lastUpdateTime = 0;
    
    return summary;
  }
  
  /**
   * Get current progress status
   */
  getCurrentProgress(): ProgressStatus {
    const now = Date.now();
    const elapsed = now - this.startTime;
    
    // Calculate estimated time remaining
    let estimatedTimeRemaining: number | undefined;
    if (this.completed > 0 && this.completed < this.total) {
      const timePerItem = elapsed / this.completed;
      estimatedTimeRemaining = Math.round((this.total - this.completed) * timePerItem);
    }
    
    return {
      operation: this.operation,
      total: this.total,
      completed: this.completed,
      percentage: this.total > 0 ? Math.round((this.completed / this.total) * 100) : 0,
      estimatedTimeRemaining,
      startedAt: new Date(this.startTime).toISOString(),
      statusMessage: this.getStatusMessage()
    };
  }
  
  /**
   * Set a callback for progress updates
   */
  setOnProgressUpdate(callback: (status: ProgressStatus) => void): void {
    this.onProgressUpdate = callback;
  }
  
  /**
   * Log progress message
   */
  logProgress(message: string): void {
    console.log(`📋 ${message}`);
  }
  
  /**
   * Report current progress
   */
  private reportProgress(force: boolean = false): void {
    const now = Date.now();
    
    // Only report if enough time has passed or if forced
    if (!force && now - this.lastUpdateTime < this.updateIntervalMs) {
      return;
    }
    
    const status = this.getCurrentProgress();
    
    // Format progress message
    const progressBar = this.getProgressBar(status.percentage);
    const timeInfo = status.estimatedTimeRemaining 
      ? `~${Math.round(status.estimatedTimeRemaining / 1000)}s remaining`
      : '';
    
    console.log(`📊 ${status.operation}: ${progressBar} ${status.completed}/${status.total} ${timeInfo}`);
    
    // Call progress update callback if set
    if (this.onProgressUpdate) {
      this.onProgressUpdate(status);
    }
    
    this.lastUpdateTime = now;
  }
  
  /**
   * Get status message
   */
  private getStatusMessage(): string {
    const percentage = this.total > 0 ? Math.round((this.completed / this.total) * 100) : 0;
    
    if (percentage < 30) {
      return 'Starting up...';
    } else if (percentage < 60) {
      return 'In progress...';
    } else if (percentage < 90) {
      return 'Almost there...';
    } else {
      return 'Finalizing...';
    }
  }
  
  /**
   * Get progress bar visualization
   */
  private getProgressBar(percentage: number): string {
    const barLength = 20;
    const filled = Math.round((percentage / 100) * barLength);
    const empty = barLength - filled;
    
    return `[${'='.repeat(filled)}${' '.repeat(empty)}] ${percentage}%`;
  }
  
  /**
   * Calculate estimated completion time
   */
  getEstimatedCompletionTime(): number | null {
    if (this.completed === 0) return null;
    
    const elapsed = Date.now() - this.startTime;
    const timePerItem = elapsed / this.completed;
    const remainingItems = this.total - this.completed;
    
    return Math.round(remainingItems * timePerItem);
  }
  
  /**
   * Get progress summary without completing
   */
  getProgressSummary(): Omit<ProgressSummary, 'completedAt'> {
    const now = Date.now();
    const durationMs = now - this.startTime;
    
    return {
      operation: this.operation,
      total: this.total,
      completed: this.completed,
      success: this.success,
      failed: this.failed,
      durationMs: durationMs,
      startedAt: new Date(this.startTime).toISOString()
    };
  }
}

/**
 * Progress Tracker Factory
 */
export class ProgressTrackerFactory {
  private static instance: ProgressTracker | null = null;
  
  static getProgressTracker(): ProgressTracker {
    if (!this.instance) {
      this.instance = new ProgressTracker();
    }
    return this.instance;
  }
  
  static reset(): void {
    this.instance = null;
  }
}