/**
 * Utility functions for PublishLane
 */

import fs from 'fs-extra';
import path from 'path';
import yaml from 'yaml';

/**
 * Load configuration file
 */
export async function loadConfig(configPath: string): Promise<any> {
  try {
    const fullPath = path.resolve(configPath);
    const content = await fs.readFile(fullPath, 'utf-8');
    return yaml.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // Return default config if file doesn't exist
      return getDefaultConfig();
    }
    throw error;
  }
}

/**
 * Get default configuration
 */
function getDefaultConfig(): any {
  return {
    version: 1,
    source: 'docs',
    output: '_site',
    format: 'jekyll',
    github: {
      repo: 'owner/repo',
      branch: 'gh-pages',
      token: '${GITHUB_TOKEN}'
    },
    themes: {
      primary: 'minima',
      fallback: 'default'
    }
  };
}

/**
 * Validate configuration
 */
export function validateConfig(config: any): void {
  if (!config.source) {
    throw new Error('Configuration error: source directory not specified');
  }
  
  if (!config.output) {
    throw new Error('Configuration error: output directory not specified');
  }
  
  const validFormats = ['jekyll', 'static', 'nextjs'];
  if (!validFormats.includes(config.format)) {
    throw new Error(`Configuration error: invalid format ${config.format}. Must be one of: ${validFormats.join(', ')}`);
  }
}

/**
 * Get document status
 */
export function getDocumentStatus(frontmatter: any): string {
  const status = frontmatter.status || 'draft';
  const validStatuses = ['draft', 'review', 'approved', 'published', 'deprecated'];
  
  if (!validStatuses.includes(status)) {
    return 'draft';
  }
  
  return status;
}

/**
 * Get status color
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: 'gray',
    review: 'yellow',
    approved: 'blue',
    published: 'green',
    deprecated: 'red'
  };
  
  return colors[status] || 'gray';
}

/**
 * Parse frontmatter from file
 */
export async function parseFrontmatter(filePath: string): Promise<{ data: any; content: string }> {
  const content = await fs.readFile(filePath, 'utf-8');
  return matter(content);
}

/**
 * Find all markdown files in directory
 */
export async function findMarkdownFiles(dir: string): Promise<string[]> {
  const files = await fs.readdir(dir);
  return files.filter(f => f.endsWith('.md'));
}

/**
 * Ensure directory exists
 */
export async function ensureOutputDir(dir: string): Promise<void> {
  await fs.ensureDir(dir);
  await fs.emptyDir(dir);
}

/**
 * Copy directory recursively
 */
export async function copyDirectory(src: string, dest: string): Promise<void> {
  await fs.copy(src, dest, { recursive: true });
}
