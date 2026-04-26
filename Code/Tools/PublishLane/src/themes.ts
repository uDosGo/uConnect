/**
 * Theme management for PublishLane
 */

import fs from 'fs-extra';
import path from 'path';

// Built-in themes
const BUILTIN_THEMES = {
  minima: {
    name: 'Minima',
    engine: 'liquid',
    path: 'templates/jekyll/minima'
  },
  modernist: {
    name: 'Modernist',
    engine: 'liquid',
    path: 'templates/jekyll/modernist'
  },
  darkmode: {
    name: 'Dark Mode',
    engine: 'liquid',
    path: 'templates/jekyll/darkmode'
  },
  print: {
    name: 'Print',
    engine: 'liquid',
    path: 'templates/jekyll/print'
  }
};

/**
 * Get theme by name
 */
export function getTheme(name: string): any {
  // Check built-in themes first
  if (BUILTIN_THEMES[name]) {
    return BUILTIN_THEMES[name];
  }
  
  // Check custom themes
  const customThemePath = path.join(process.cwd(), 'themes', name);
  if (fs.existsSync(customThemePath)) {
    return {
      name,
      engine: 'liquid',
      path: customThemePath
    };
  }
  
  throw new Error(`Theme '${name}' not found`);
}

/**
 * List available themes
 */
export async function listThemes(): Promise<any[]> {
  const themes = Object.values(BUILTIN_THEMES);
  
  // Add custom themes
  const customThemesDir = path.join(process.cwd(), 'themes');
  if (fs.existsSync(customThemesDir)) {
    const customThemes = await fs.readdir(customThemesDir);
    for (const theme of customThemes) {
      themes.push({
        name: theme,
        engine: 'liquid',
        path: path.join(customThemesDir, theme),
        custom: true
      });
    }
  }
  
  return themes;
}

/**
 * Apply theme to content
 */
export async function applyTheme(content: string, themeName: string, frontmatter: any): Promise<string> {
  const theme = getTheme(themeName);
  
  if (theme.engine === 'liquid') {
    // Simple liquid-style templating
    let result = content;
    
    // Apply frontmatter variables
    for (const [key, value] of Object.entries(frontmatter)) {
      const placeholder = `{{ ${key} }}`;
      result = result.replace(new RegExp(placeholder, 'g'), value);
    }
    
    return result;
  }
  
  return content;
}

/**
 * Get theme template
 */
export async function getThemeTemplate(themeName: string, templateName: string): Promise<string> {
  const theme = getTheme(themeName);
  const templatePath = path.join(theme.path, `${templateName}.html`);
  
  if (fs.existsSync(templatePath)) {
    return await fs.readFile(templatePath, 'utf-8');
  }
  
  throw new Error(`Template '${templateName}' not found in theme '${themeName}'`);
}
