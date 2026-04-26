/**
 * Build system for PublishLane
 * Supports Jekyll, static HTML, and Next.js formats
 */

import fs from 'fs-extra';
import path from 'path';
import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';
import yaml from 'yaml';
import { loadConfig } from './utils';

// Markdown parser
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
});

/**
 * Build documentation site
 */
export async function build(options: any) {
  // Load configuration
  const config = await loadConfig(options.config);
  
  // Override with CLI options
  const sourceDir = options.source || config.source || 'docs';
  const outputDir = options.output || config.output || '_site';
  const format = options.format || config.format || 'jekyll';
  
  // Ensure directories exist
  await fs.ensureDir(sourceDir);
  await fs.emptyDir(outputDir);
  
  console.log(`Source: ${sourceDir}`);
  console.log(`Output: ${outputDir}`);
  console.log(`Format: ${format}`);
  
  // Read all markdown files
  const files = await fs.readdir(sourceDir);
  const markdownFiles = files.filter(f => f.endsWith('.md'));
  
  console.log(`Found ${markdownFiles.length} markdown files`);
  
  // Process each file
  for (const file of markdownFiles) {
    const filePath = path.join(sourceDir, file);
    const content = await fs.readFile(filePath, 'utf-8');
    const { data, content: markdown } = matter(content);
    
    // Parse frontmatter
    const frontmatter = data;
    const html = md.render(markdown);
    
    // Generate output based on format
    const outputPath = path.join(outputDir, file.replace('.md', '.html'));
    
    let outputContent = '';
    
    if (format === 'jekyll') {
      outputContent = generateJekyllPage(frontmatter, html);
    } else if (format === 'static') {
      outputContent = generateStaticPage(frontmatter, html);
    } else if (format === 'nextjs') {
      outputContent = generateNextJSPage(frontmatter, html);
    }
    
    await fs.writeFile(outputPath, outputContent);
    console.log(`✅ ${file} → ${path.basename(outputPath)}`);
  }
  
  // Copy assets if they exist
  const assetsDir = path.join(sourceDir, 'assets');
  if (await fs.pathExists(assetsDir)) {
    await fs.copy(assetsDir, path.join(outputDir, 'assets'));
    console.log('✅ Copied assets');
  }
  
  // Generate index.html
  await generateIndex(outputDir, markdownFiles);
}

/**
 * Generate Jekyll-formatted page
 */
function generateJekyllPage(frontmatter: any, content: string): string {
  return `---
${yaml.stringify(frontmatter)}---

${content}`;
}

/**
 * Generate static HTML page
 */
function generateStaticPage(frontmatter: any, content: string): string {
  const title = frontmatter.title || 'Documentation';
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 2rem; color: #333; }
    h1, h2, h3 { color: #2c3e50; }
    pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; }
    code { background: #f5f5f5; padding: 0.2rem 0.4rem; border-radius: 3px; }
    a { color: #3498db; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <article>
    ${content}
  </article>
</body>
</html>`;
}

/**
 * Generate Next.js page
 */
function generateNextJSPage(frontmatter: any, content: string): string {
  return `import Head from 'next/head';
import Layout from '../components/Layout';

export default function Page() {
  return (
    <Layout>
      <Head>
        <title>${frontmatter.title || 'Documentation'}</title>
      </Head>
      <div dangerouslySetInnerHTML={{ __html: 
        "`${content.replace(/`/g, '\\`')}`" }} />
    </Layout>
  )
}

export const frontmatter = ${JSON.stringify(frontmatter, null, 2)};
`;
}

/**
 * Generate index.html
 */
async function generateIndex(outputDir: string, files: string[]) {
  const indexPath = path.join(outputDir, 'index.html');
  
  const pages = files.map(f => {
    const name = f.replace('.md', '');
    return `<li><a href="${name}.html">${name}</a></li>`;
  }).join('\n');
  
  const indexContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Documentation</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 2rem; color: #333; }
    h1 { color: #2c3e50; }
    ul { list-style: none; padding: 0; }
    li { margin: 0.5rem 0; }
    a { color: #3498db; text-decoration: none; font-size: 1.1rem; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <h1>Documentation</h1>
  <ul>
    ${pages}
  </ul>
</body>
</html>`;
  
  await fs.writeFile(indexPath, indexContent);
  console.log('✅ Generated index.html');
}
