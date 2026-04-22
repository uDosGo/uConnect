// core/src/commands/publish.ts
// Static Site Generator for uDosConnect - Phase 8A

import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import matter from 'gray-matter';
import { marked } from 'marked';
import nunjucks from 'nunjucks';
import chokidar from 'chokidar';
import { execSync } from 'child_process';
import os from 'os';

// Publish configuration interface
interface PublishConfig {
  vaultPath: string;
  outputPath: string;
  templatePath: string;
  baseUrl: string;
  watchMode: boolean;
  forceRebuild: boolean;
}

// Default configuration
const DEFAULT_CONFIG: PublishConfig = {
  vaultPath: path.join(os.homedir(), 'vault'),
  outputPath: '/srv/udos/www',
  templatePath: path.join(process.cwd(), 'core', 'templates'),
  baseUrl: '/',
  watchMode: false,
  forceRebuild: false
};

// Ensure directory exists
function ensureDirectory(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Load publish configuration
function loadConfig(): PublishConfig {
  // Try to load from environment variables
  const config: PublishConfig = { ...DEFAULT_CONFIG };

  if (process.env.UDOS_VAULT_PATH) {
    config.vaultPath = process.env.UDOS_VAULT_PATH;
  }

  if (process.env.UDOS_PUBLISH_OUTPUT) {
    config.outputPath = process.env.UDOS_PUBLISH_OUTPUT;
  }

  return config;
}

// Initialize Nunjucks templating engine
function initializeTemplates(templatePath: string): nunjucks.Environment {
  ensureDirectory(templatePath);
  const env = nunjucks.configure(templatePath, { autoescape: true });
  
  // Add custom date filter
  env.addFilter('date', (dateString: string, format: string = 'MMMM D, YYYY') => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString; // Return original if invalid
      }
      
      // Simple format replacement
      return format
        .replace('MMMM', date.toLocaleString('default', { month: 'long' }))
        .replace('D', date.getDate().toString())
        .replace('YYYY', date.getFullYear().toString());
    } catch (error) {
      return dateString;
    }
  });
  
  return env;
}

// Convert markdown file to HTML
async function convertMarkdownToHtml(
  filePath: string,
  config: PublishConfig,
  env: nunjucks.Environment
): Promise<{ html: string; frontmatter: any; outputPath: string }> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const { data: frontmatter, content: markdownContent } = matter(content);

  // Set default frontmatter values
  const metadata = {
    title: frontmatter.title || path.basename(filePath, '.md'),
    date: frontmatter.date || new Date().toISOString(),
    author: frontmatter.author || 'Anonymous',
    description: frontmatter.description || '',
    keywords: frontmatter.keywords || [],
    required_role: frontmatter.required_role || 'viewer',
    published: frontmatter.published !== false,
    ...frontmatter
  };

  // Convert markdown to HTML
  const htmlContent = marked.parse(markdownContent);

  // Apply template
  const template = frontmatter.template || 'default.html';
  const html = env.render(template, {
    title: metadata.title,
    content: htmlContent,
    frontmatter: metadata,
    baseUrl: config.baseUrl
  });

  // Determine output path
  const relativePath = path.relative(config.vaultPath, filePath);
  const outputDir = path.join(config.outputPath, path.dirname(relativePath));
  const outputPath = path.join(outputDir, path.basename(filePath, '.md') + '.html');

  return { html, frontmatter: metadata, outputPath };
}

// Build index page
async function buildIndexPage(
  config: PublishConfig,
  env: nunjucks.Environment,
  files: string[]
): Promise<void> {
  const indexData = files.map(file => {
    const content = fs.readFileSync(file, 'utf-8');
    const { data: frontmatter } = matter(content);
    const relativePath = path.relative(config.vaultPath, file);
    const url = path.join(config.baseUrl, relativePath.replace(/\.md$/, '.html'));

    return {
      title: frontmatter.title || path.basename(file, '.md'),
      date: frontmatter.date || new Date().toISOString(),
      description: frontmatter.description || '',
      url: url,
      published: frontmatter.published !== false
    };
  }).filter(item => item.published);

  // Sort by date (newest first)
  indexData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const indexHtml = env.render('index.html', {
    title: 'uDosConnect Portal',
    items: indexData,
    baseUrl: config.baseUrl
  });

  const indexPath = path.join(config.outputPath, 'index.html');
  fs.writeFileSync(indexPath, indexHtml);
  console.log(chalk.green(`✅ Generated index page: ${indexPath}`));
}

// Build RSS feed
async function buildRssFeed(
  config: PublishConfig,
  files: string[]
): Promise<void> {
  const feedItems = files.map(file => {
    const content = fs.readFileSync(file, 'utf-8');
    const { data: frontmatter } = matter(content);
    const relativePath = path.relative(config.vaultPath, file);
    const url = path.join(config.baseUrl, relativePath.replace(/\.md$/, '.html'));

    return {
      title: frontmatter.title || path.basename(file, '.md'),
      description: frontmatter.description || '',
      url: url,
      date: frontmatter.date || new Date().toISOString(),
      published: frontmatter.published !== false
    };
  }).filter(item => item.published);

  // Sort by date (newest first)
  feedItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>uDosConnect Portal</title>
    <link>${config.baseUrl}</link>
    <description>Content published from uDosConnect vault</description>
    ${feedItems.map(item => `
    <item>
      <title>${item.title}</title>
      <link>${item.url}</link>
      <description>${item.description}</description>
      <pubDate>${new Date(item.date).toUTCString()}</pubDate>
    </item>`).join('')}
  </channel>
</rss>`;

  const rssPath = path.join(config.outputPath, 'rss.xml');
  fs.writeFileSync(rssPath, rss);
  console.log(chalk.green(`✅ Generated RSS feed: ${rssPath}`));
}

// Build sitemap
async function buildSitemap(
  config: PublishConfig,
  files: string[]
): Promise<void> {
  const urls = files.map(file => {
    const relativePath = path.relative(config.vaultPath, file);
    const urlPath = relativePath.replace(/\.md$/, '.html');
    // Simple URL construction without URL class to avoid errors
    const fullUrl = config.baseUrl.endsWith('/') 
      ? config.baseUrl + urlPath
      : config.baseUrl + '/' + urlPath;
    return fullUrl;
  });

  // Add index page
  urls.unshift(config.baseUrl.endsWith('/') 
    ? config.baseUrl + 'index.html'
    : config.baseUrl + '/index.html');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.map(url => `
  <url>
    <loc>${url}</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
</urlset>`;

  const sitemapPath = path.join(config.outputPath, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, sitemap);
  console.log(chalk.green(`✅ Generated sitemap: ${sitemapPath}`));
}

// Main publish function
async function publishContent(
  inputPath: string = '.',
  options: { watch?: boolean; force?: boolean; baseUrl?: string } = {}
): Promise<void> {
  console.log(chalk.cyan('📰 Starting uDosConnect static site generation...'));

  // Load configuration
  const config = loadConfig();
  if (options.baseUrl) {
    config.baseUrl = options.baseUrl;
  }
  if (options.force) {
    config.forceRebuild = true;
  }
  if (options.watch) {
    config.watchMode = true;
  }

  // Resolve input path
  const sourceDir = path.isAbsolute(inputPath) 
    ? inputPath 
    : path.join(config.vaultPath, inputPath);

  if (!fs.existsSync(sourceDir)) {
    console.log(chalk.red(`❌ Source directory not found: ${sourceDir}`));
    return;
  }

  // Ensure output directory exists
  ensureDirectory(config.outputPath);

  // Initialize templating engine
  const env = initializeTemplates(config.templatePath);

  // Create default templates if they don't exist
  createDefaultTemplates(config.templatePath);

  // Find all markdown files
  console.log(chalk.blue(`🔍 Scanning for markdown files in ${sourceDir}...`));
  const files = await glob('**/*.md', { 
    cwd: sourceDir, 
    absolute: true,
    ignore: ['**/node_modules/**', '**/.git/**', '**/.compost/**']
  });

  if (files.length === 0) {
    console.log(chalk.yellow('⚠️  No markdown files found'));
    return;
  }

  console.log(chalk.blue(`📄 Found ${files.length} markdown files to process`));

  // Process each file
  let processedCount = 0;
  let skippedCount = 0;

  for (const file of files) {
    try {
      const { html, frontmatter, outputPath } = await convertMarkdownToHtml(file, config, env);

      // Check if file should be published
      if (!frontmatter.published) {
        console.log(chalk.yellow(`⚠️  Skipped (not published): ${path.relative(config.vaultPath, file)}`));
        skippedCount++;
        continue;
      }

      // Ensure output directory exists
      ensureDirectory(path.dirname(outputPath));

      // Write HTML file
      fs.writeFileSync(outputPath, html);
      console.log(chalk.green(`✅ Published: ${path.relative(config.vaultPath, file)} → ${path.relative(config.outputPath, outputPath)}`));
      processedCount++;
    } catch (error: unknown) {
      console.log(chalk.red(`❌ Failed to process ${file}: ${error instanceof Error ? error.message : String(error)}`));
    }
  }

  // Build index, RSS, and sitemap
  if (processedCount > 0) {
    await buildIndexPage(config, env, files);
    await buildRssFeed(config, files);
    await buildSitemap(config, files);
  }

  console.log(chalk.cyan(`\n📊 Publishing Summary:`));
  console.log(chalk.green(`✅ Processed: ${processedCount} files`));
  console.log(chalk.yellow(`⚠️  Skipped: ${skippedCount} files (not published)`));
  console.log(chalk.blue(`📁 Output: ${config.outputPath}`));
  console.log(chalk.blue(`🌐 URL: ${config.baseUrl}`));

  // Set up watch mode if requested
  if (config.watchMode) {
    console.log(chalk.cyan('\n👀 Watching for changes...'));
    const watcher = chokidar.watch(sourceDir, {
      ignored: ['**/node_modules/**', '**/.git/**', '**/.compost/**'],
      persistent: true
    });

    watcher
      .on('change', async (changedPath) => {
        if (changedPath.endsWith('.md')) {
          console.log(chalk.blue(`📝 File changed: ${path.relative(sourceDir, changedPath)}`));
          await publishContent(inputPath, { watch: true, force: true, baseUrl: options.baseUrl });
        }
      })
      .on('error', (error: unknown) => {
        console.log(chalk.red(`❌ Watcher error: ${error instanceof Error ? error.message : String(error)}`));
      });

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      watcher.close();
      console.log(chalk.yellow('\n🛑 Watch mode stopped'));
      process.exit(0);
    });
  }
}

// Create default templates if they don't exist
function createDefaultTemplates(templatePath: string): void {
  const templates = [
    {
      name: 'default.html',
      content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ title }}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; margin: 0 auto; max-width: 800px; padding: 20px; color: #333; }
        h1, h2, h3 { color: #2c3e50; }
        a { color: #3498db; text-decoration: none; }
        a:hover { text-decoration: underline; }
        pre { background: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto; }
        code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
        blockquote { border-left: 3px solid #3498db; padding-left: 15px; margin-left: 0; color: #555; }
    </style>
</head>
<body>
    <header>
        <h1>{{ title }}</h1>
        {% if frontmatter.date %}<p style="color: #7f8c8d;">Published: {{ frontmatter.date }}</p>{% endif %}
        {% if frontmatter.author %}<p style="color: #7f8c8d;">Author: {{ frontmatter.author }}</p>{% endif %}
    </header>
    <main>
        {{ content | safe }}
    </main>
    <footer>
        <p style="margin-top: 40px; color: #7f8c8d; font-size: 0.9em;">
            Generated by <a href="https://udosconnect.com">uDosConnect</a>
        </p>
    </footer>
</body>
</html>`
    },
    {
      name: 'index.html',
      content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ title }}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; margin: 0 auto; max-width: 1000px; padding: 20px; color: #333; }
        header { margin-bottom: 30px; border-bottom: 1px solid #eee; padding-bottom: 20px; }
        h1 { color: #2c3e50; margin: 0; }
        .item { margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #f0f0f0; }
        .item h2 { margin: 0 0 5px 0; }
        .item h2 a { color: #2c3e50; text-decoration: none; }
        .item h2 a:hover { color: #3498db; }
        .item .meta { color: #7f8c8d; font-size: 0.9em; }
        .item .description { color: #555; }
        nav { margin-top: 30px; }
        nav a { margin-right: 15px; color: #3498db; }
    </style>
</head>
<body>
    <header>
        <h1>{{ title }}</h1>
        <nav>
            <a href="{{ baseUrl }}">Home</a>
            <a href="{{ baseUrl }}rss.xml">RSS</a>
            <a href="{{ baseUrl }}sitemap.xml">Sitemap</a>
        </nav>
    </header>
    <main>
        {% if items.length > 0 %}
            {% for item in items %}
            <div class="item">
                <h2><a href="{{ item.url }}">{{ item.title }}</a></h2>
                <div class="meta">
                    {% if item.date %}{{ item.date | date("MMMM D, YYYY") }} • {% endif %}
                    <a href="{{ item.url }}">Read more</a>
                </div>
                {% if item.description %}<p class="description">{{ item.description }}</p>{% endif %}
            </div>
            {% endfor %}
        {% else %}
            <p>No content available.</p>
        {% endif %}
    </main>
    <footer>
        <p style="margin-top: 40px; color: #7f8c8d; font-size: 0.9em;">
            Powered by <a href="https://udosconnect.com">uDosConnect</a>
        </p>
    </footer>
</body>
</html>`
    }
  ];

  templates.forEach(template => {
    const templatePathFull = path.join(templatePath, template.name);
    if (!fs.existsSync(templatePathFull)) {
      fs.writeFileSync(templatePathFull, template.content);
      console.log(chalk.dim(`📄 Created default template: ${template.name}`));
    }
  });
}

// Export publish command
export function registerPublishCommands(program: Command): void {
  const publish = program.command('publish').description('Generate static site from vault content');

  publish
    .description('Generate static site from vault content')
    .argument('[path]', 'vault subpath to publish', '.')
    .option('--watch', 'Watch for changes and rebuild automatically')
    .option('--force', 'Force full rebuild (ignore cache)')
    .option('--base-url <url>', 'Base URL for generated links', '/')
    .action(async (inputPath, options) => {
      try {
        await publishContent(inputPath, {
          watch: options.watch,
          force: options.force,
          baseUrl: options.baseUrl
        });
      } catch (error: unknown) {
        console.log(chalk.red('❌ Publishing failed:'), error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });

  // Add permission management command
  publish
    .command('set-permission')
    .description('Set required role for a published page')
    .argument('<file>', 'Markdown file path')
    .requiredOption('--role <role>', 'Required role (viewer, editor, admin)')
    .action((filePath, options) => {
      const fullPath = path.isAbsolute(filePath) 
        ? filePath 
        : path.join(loadConfig().vaultPath, filePath);

      if (!fs.existsSync(fullPath)) {
        console.log(chalk.red(`❌ File not found: ${fullPath}`));
        return;
      }

      const content = fs.readFileSync(fullPath, 'utf-8');
      const { data: frontmatter, content: markdownContent } = matter(content);

      frontmatter.required_role = options.role;

      const newContent = matter.stringify(markdownContent, frontmatter);
      fs.writeFileSync(fullPath, newContent);

      console.log(chalk.green(`✅ Set permission for ${filePath}: required_role = ${options.role}`));
    });

  // Add index generation command
  publish
    .command('generate-index')
    .description('Generate index page for published content')
    .action(async () => {
      const config = loadConfig();
      const env = initializeTemplates(config.templatePath);
      const files = await glob('**/*.md', { 
        cwd: config.vaultPath, 
        absolute: true
      });
      await buildIndexPage(config, env, files);
    });

  // Add RSS feed generation command
  publish
    .command('generate-rss')
    .description('Generate RSS feed for published content')
    .action(async () => {
      const config = loadConfig();
      const files = await glob('**/*.md', { 
        cwd: config.vaultPath, 
        absolute: true
      });
      await buildRssFeed(config, files);
    });

  // Add sitemap generation command
  publish
    .command('generate-sitemap')
    .description('Generate sitemap.xml for published content')
    .action(async () => {
      const config = loadConfig();
      const files = await glob('**/*.md', { 
        cwd: config.vaultPath, 
        absolute: true
      });
      await buildSitemap(config, files);
    });
}