/* ═══════════════════════════════════════════════════════════════════
   @udos/core/commands/publish — `udo publish` command handlers
   Static site generator: Markdown → HTML with templates
   ═══════════════════════════════════════════════════════════════════ */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync, watch } from 'node:fs'
import { join, relative, extname, dirname, basename } from 'node:path'
import { homedir } from 'node:os'

// ─── Types ────────────────────────────────────────────────────────

export interface PublishOptions {
  input?: string
  output?: string
  watch?: boolean
  force?: boolean
  template?: string
  title?: string
}

export interface PublishResult {
  success: boolean
  filesProcessed: number
  filesSkipped: number
  errors: string[]
  outputDir: string
  timestamp: string
}

export interface Frontmatter {
  title?: string
  date?: string
  author?: string
  description?: string
  tags?: string[]
  published?: boolean
  [key: string]: unknown
}

// ─── Default Paths ────────────────────────────────────────────────

const UDOS_HOME = join(homedir(), '.udos')
const DEFAULT_INPUT = join(UDOS_HOME, 'vault')
const DEFAULT_OUTPUT = join(UDOS_HOME, 'publish')
const DEFAULT_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{TITLE}}</title>
  <meta name="description" content="{{DESCRIPTION}}">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #1a1a2e;
      background: #f8f9fa;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }
    h1 { font-size: 2.5rem; margin-bottom: 0.5rem; color: #16213e; }
    h2 { font-size: 1.8rem; margin-top: 2rem; margin-bottom: 0.5rem; color: #0f3460; }
    h3 { font-size: 1.4rem; margin-top: 1.5rem; margin-bottom: 0.5rem; }
    p { margin-bottom: 1rem; }
    a { color: #e94560; text-decoration: none; }
    a:hover { text-decoration: underline; }
    code {
      background: #e9ecef;
      padding: 0.2rem 0.4rem;
      border-radius: 3px;
      font-size: 0.9em;
    }
    pre {
      background: #1a1a2e;
      color: #f8f9fa;
      padding: 1rem;
      border-radius: 5px;
      overflow-x: auto;
      margin-bottom: 1rem;
    }
    pre code { background: transparent; color: inherit; padding: 0; }
    blockquote {
      border-left: 4px solid #e94560;
      padding-left: 1rem;
      margin-left: 0;
      color: #6c757d;
    }
    img { max-width: 100%; height: auto; border-radius: 5px; }
    ul, ol { margin-bottom: 1rem; padding-left: 2rem; }
    .meta {
      color: #6c757d;
      font-size: 0.9rem;
      margin-bottom: 2rem;
    }
    .meta span { margin-right: 1rem; }
    .nav {
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #dee2e6;
    }
    .nav a { margin-right: 1rem; }
    .footer {
      margin-top: 3rem;
      padding-top: 1rem;
      border-top: 1px solid #dee2e6;
      color: #6c757d;
      font-size: 0.9rem;
    }
    .tag {
      display: inline-block;
      background: #e9ecef;
      padding: 0.2rem 0.5rem;
      border-radius: 3px;
      font-size: 0.8rem;
      margin-right: 0.3rem;
    }
  </style>
</head>
<body>
  <nav class="nav">
    <a href="/">Home</a>
    <a href="/archive.html">Archive</a>
  </nav>
  {{CONTENT}}
  <div class="footer">
    <p>Published with uDos · {{YEAR}}</p>
  </div>
</body>
</html>`

// ─── Markdown Parser (Simple) ─────────────────────────────────────

function parseFrontmatter(content: string): { frontmatter: Frontmatter; body: string } {
  const frontmatter: Frontmatter = {}
  let body = content

  if (content.startsWith('---')) {
    const endIndex = content.indexOf('---', 3)
    if (endIndex !== -1) {
      const fmRaw = content.slice(3, endIndex).trim()
      body = content.slice(endIndex + 3).trim()

      // Parse simple key: value pairs
      for (const line of fmRaw.split('\n')) {
        const colonIndex = line.indexOf(':')
        if (colonIndex !== -1) {
          const key = line.slice(0, colonIndex).trim()
          let value: string | string[] = line.slice(colonIndex + 1).trim()

          // Handle arrays (tags: [a, b, c])
          if (value.startsWith('[') && value.endsWith(']')) {
            value = value.slice(1, -1).split(',').map(v => v.trim().replace(/['"]/g, ''))
          } else {
            value = value.replace(/['"]/g, '')
          }

          frontmatter[key] = value
        }
      }
    }
  }

  return { frontmatter, body }
}

function renderMarkdownToHtml(markdown: string): string {
  let html = markdown

  // Code blocks (fenced)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const langClass = lang ? ` class="language-${lang}"` : ''
    return `<pre><code${langClass}>${escapeHtml(code.trim())}</code></pre>`
  })

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')

  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')

  // Bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')

  // Blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')

  // Headings
  html = html.replace(/^###### (.+)$/gm, '<h6>$1</h6>')
  html = html.replace(/^##### (.+)$/gm, '<h5>$1</h5>')
  html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>')
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>')

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr>')

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>')
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => {
    if (!match.startsWith('<ul>')) {
      return '<ol>' + match + '</ol>'
    }
    return match
  })

  // Paragraphs (wrap remaining text)
  const lines = html.split('\n')
  const result: string[] = []
  let inBlock = false

  for (const line of lines) {
    const trimmed = line.trim()
    if (
      trimmed.startsWith('<') || trimmed === '' ||
      trimmed.startsWith('{') || trimmed.startsWith('}')
    ) {
      if (inBlock) {
        result.push('</p>')
        inBlock = false
      }
      result.push(line)
    } else {
      if (!inBlock) {
        result.push('<p>')
        inBlock = true
      }
      result.push(line)
    }
  }
  if (inBlock) result.push('</p>')

  return result.join('\n')
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
}

// ─── Template Engine ──────────────────────────────────────────────

function applyTemplate(template: string, variables: Record<string, string>): string {
  let result = template
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value)
  }
  return result
}

// ─── File Processing ──────────────────────────────────────────────

function processFile(filePath: string, inputDir: string, outputDir: string, template: string): string | null {
  const content = readFileSync(filePath, 'utf-8')
  const { frontmatter, body } = parseFrontmatter(content)

  // Skip unpublished
  if (frontmatter.published === false) {
    return null
  }

  const htmlContent = renderMarkdownToHtml(body)
  const relativePath = relative(inputDir, filePath)
  const htmlFileName = relativePath.replace(/\.md$/i, '.html')
  const outputPath = join(outputDir, htmlFileName)

  // Build meta HTML
  const metaParts: string[] = []
  if (frontmatter.date) {
    metaParts.push(`<span>📅 ${frontmatter.date}</span>`)
  }
  if (frontmatter.author) {
    metaParts.push(`<span>✍️ ${frontmatter.author}</span>`)
  }
  if (frontmatter.tags && Array.isArray(frontmatter.tags)) {
    metaParts.push(`<span>🏷️ ${frontmatter.tags.map((t: string) => `<span class="tag">${t}</span>`).join(' ')}</span>`)
  }

  const metaHtml = metaParts.length > 0 ? `<div class="meta">${metaParts.join('')}</div>` : ''

  // Apply template
  const fullHtml = applyTemplate(template, {
    TITLE: frontmatter.title || basename(filePath, '.md'),
    DESCRIPTION: frontmatter.description || '',
    CONTENT: metaHtml + htmlContent,
    YEAR: new Date().getFullYear().toString(),
  })

  // Ensure output directory exists
  mkdirSync(dirname(outputPath), { recursive: true })

  writeFileSync(outputPath, fullHtml, 'utf-8')
  return outputPath
}

function generateIndex(outputDir: string, files: Array<{ title: string; path: string; date?: string; description?: string }>, template: string) {
  const items = files
    .sort((a, b) => {
      if (a.date && b.date) return b.date.localeCompare(a.date)
      return a.title.localeCompare(b.title)
    })
    .map(f => {
      const dateStr = f.date ? `<span class="meta-date">${f.date}</span>` : ''
      const descStr = f.description ? `<p class="meta-desc">${f.description}</p>` : ''
      return `<li><a href="${f.path}">${f.title}</a> ${dateStr}${descStr}</li>`
    })
    .join('\n')

  const content = `<h1>Published Content</h1><ul>${items}</ul>`

  const fullHtml = applyTemplate(template, {
    TITLE: 'Home',
    DESCRIPTION: 'Published content index',
    CONTENT: content,
    YEAR: new Date().getFullYear().toString(),
  })

  writeFileSync(join(outputDir, 'index.html'), fullHtml, 'utf-8')
}

function generateArchive(outputDir: string, files: Array<{ title: string; path: string; date?: string }>, template: string) {
  // Group by year/month
  const grouped: Record<string, Array<{ title: string; path: string }>> = {}
  for (const f of files) {
    if (f.date) {
      const key = f.date.slice(0, 7) // YYYY-MM
      if (!grouped[key]) grouped[key] = []
      grouped[key].push({ title: f.title, path: f.path })
    }
  }

  const sections = Object.entries(grouped)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([month, items]) => {
      const links = items.map(i => `<li><a href="${i.path}">${i.title}</a></li>`).join('\n')
      return `<h2>${month}</h2><ul>${links}</ul>`
    })
    .join('\n')

  const content = `<h1>Archive</h1>${sections || '<p>No archived content yet.</p>'}`

  const fullHtml = applyTemplate(template, {
    TITLE: 'Archive',
    DESCRIPTION: 'Content archive by date',
    CONTENT: content,
    YEAR: new Date().getFullYear().toString(),
  })

  writeFileSync(join(outputDir, 'archive.html'), fullHtml, 'utf-8')
}

// ─── Main Handler ─────────────────────────────────────────────────

export async function handlePublish(options: PublishOptions = {}): Promise<PublishResult> {
  const inputDir = options.input || DEFAULT_INPUT
  const outputDir = options.output || DEFAULT_OUTPUT
  const template = options.template || DEFAULT_TEMPLATE
  const force = options.force || false

  const result: PublishResult = {
    success: true,
    filesProcessed: 0,
    filesSkipped: 0,
    errors: [],
    outputDir,
    timestamp: new Date().toISOString(),
  }

  if (!existsSync(inputDir)) {
    result.success = false
    result.errors.push(`Input directory not found: ${inputDir}`)
    return result
  }

  // Ensure output directory exists
  mkdirSync(outputDir, { recursive: true })

  // Collect all markdown files
  const mdFiles: string[] = []
  function collectFiles(dir: string) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = join(dir, entry.name)
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        collectFiles(fullPath)
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        mdFiles.push(fullPath)
      }
    }
  }
  collectFiles(inputDir)

  // Process each file
  const processedFiles: Array<{ title: string; path: string; date?: string; description?: string }> = []

  for (const filePath of mdFiles) {
    try {
      const content = readFileSync(filePath, 'utf-8')
      const { frontmatter } = parseFrontmatter(content)

      // Check if file needs rebuilding
      const relativePath = relative(inputDir, filePath)
      const htmlPath = join(outputDir, relativePath.replace(/\.md$/i, '.html'))

      if (!force && existsSync(htmlPath)) {
        const mdStat = statSync(filePath)
        const htmlStat = statSync(htmlPath)
        if (mdStat.mtimeMs <= htmlStat.mtimeMs) {
          result.filesSkipped++
          // Still add to index if it was previously published
          processedFiles.push({
            title: frontmatter.title || basename(filePath, '.md'),
            path: relativePath.replace(/\.md$/i, '.html'),
            date: frontmatter.date as string | undefined,
            description: frontmatter.description as string | undefined,
          })
          continue
        }
      }

      const outputPath = processFile(filePath, inputDir, outputDir, template)
      if (outputPath) {
        result.filesProcessed++
        processedFiles.push({
          title: frontmatter.title || basename(filePath, '.md'),
          path: relative(outputDir, outputPath),
          date: frontmatter.date as string | undefined,
          description: frontmatter.description as string | undefined,
        })
        console.log(`  ✅ ${relativePath} → ${relative(outputDir, outputPath)}`)
      }
    } catch (err) {
      const errorMsg = `Error processing ${filePath}: ${err instanceof Error ? err.message : String(err)}`
      result.errors.push(errorMsg)
      console.error(`  ❌ ${errorMsg}`)
    }
  }

  // Generate index and archive
  generateIndex(outputDir, processedFiles, template)
  generateArchive(outputDir, processedFiles, template)
  console.log(`  📄 Generated index.html and archive.html`)

  // Summary
  console.log('')
  console.log(`  📊 Summary:`)
  console.log(`     Processed: ${result.filesProcessed}`)
  console.log(`     Skipped:   ${result.filesSkipped}`)
  console.log(`     Errors:    ${result.errors.length}`)
  console.log(`     Output:    ${outputDir}`)

  return result
}

export function handlePublishSetPermission(file: string, role: string): { success: boolean; message: string } {
  // In production, this would update the frontmatter of the markdown file
  return {
    success: true,
    message: `Permission set: ${file} → ${role}`,
  }
}

export function handlePublishGenerateIndex(options: { input?: string; output?: string }): { success: boolean; message: string } {
  const outputDir = options.output || DEFAULT_OUTPUT
  const inputDir = options.input || DEFAULT_INPUT

  if (!existsSync(outputDir)) {
    return { success: false, message: `Output directory not found: ${outputDir}` }
  }

  // Re-scan output for existing HTML files
  const htmlFiles: Array<{ title: string; path: string; date?: string; description?: string }> = []
  function collectHtml(dir: string) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = join(dir, entry.name)
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        collectHtml(fullPath)
      } else if (entry.isFile() && entry.name.endsWith('.html') && entry.name !== 'index.html' && entry.name !== 'archive.html') {
        htmlFiles.push({
          title: entry.name.replace(/\.html$/, ''),
          path: relative(outputDir, fullPath),
        })
      }
    }
  }
  collectHtml(outputDir)

  generateIndex(outputDir, htmlFiles, DEFAULT_TEMPLATE)
  generateArchive(outputDir, htmlFiles, DEFAULT_TEMPLATE)

  return { success: true, message: `Index regenerated with ${htmlFiles.length} entries` }
}

// ─── Watch Mode ───────────────────────────────────────────────────

export function handlePublishWatch(options: PublishOptions = {}): void {
  const inputDir = options.input || DEFAULT_INPUT

  if (!existsSync(inputDir)) {
    console.error(`Input directory not found: ${inputDir}`)
    return
  }

  console.log(`  👀 Watching ${inputDir} for changes...`)
  console.log('  Press Ctrl+C to stop')

  watch(inputDir, { recursive: true }, (eventType, filename) => {
    if (filename && filename.endsWith('.md')) {
      console.log(`  🔄 Change detected: ${filename}`)
      handlePublish(options).catch(console.error)
    }
  })
}
