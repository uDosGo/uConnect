// tools/localhost-library/server.ts
// Localhost Library Web Server - Phase 8B

import express from 'express';
import path from 'path';
import fs from 'fs';
import cookieParser from 'cookie-parser';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import { UserDatabase } from './db.js';

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration interface
interface ServerConfig {
  port: number;
  staticDir: string;
  templatesDir: string;
  baseUrl: string;
  jwtSecret: string;
  sessionSecret: string;
  dbPath: string;
}

// Default configuration
const DEFAULT_CONFIG: ServerConfig = {
  port: 8080,
  staticDir: '/srv/udos/www',
  templatesDir: path.join(__dirname, 'templates'),
  baseUrl: 'http://localhost:8080',
  jwtSecret: 'udos-default-secret-change-me',
  sessionSecret: 'udos-session-secret-change-me',
  dbPath: path.join(__dirname, 'users.db')
};

// Load configuration from environment variables
function loadConfig(): ServerConfig {
  const config: ServerConfig = { ...DEFAULT_CONFIG };

  if (process.env.PORT) {
    config.port = parseInt(process.env.PORT);
  }
  if (process.env.STATIC_DIR) {
    config.staticDir = process.env.STATIC_DIR;
  }
  if (process.env.BASE_URL) {
    config.baseUrl = process.env.BASE_URL;
  }
  if (process.env.JWT_SECRET) {
    config.jwtSecret = process.env.JWT_SECRET;
  }
  if (process.env.SESSION_SECRET) {
    config.sessionSecret = process.env.SESSION_SECRET;
  }
  if (process.env.DB_PATH) {
    config.dbPath = process.env.DB_PATH;
  }

  return config;
}

// Ensure directory exists
function ensureDirectory(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Create Express application
async function createServer() {
  const config = loadConfig();
  
  console.log(chalk.cyan('🌐 Starting Localhost Library Web Server...'));
  console.log(chalk.blue(`📁 Static content: ${config.staticDir}`));
  console.log(chalk.blue(`🌐 Base URL: ${config.baseUrl}`));
  console.log(chalk.blue(`🔑 Port: ${config.port}`));

  // Initialize database
  const userDb = new UserDatabase(config.dbPath, config.jwtSecret);
  await userDb.initialize();

  const app = express();

  // Initialize Hivemind Manager
  const hivemindManager = new (await import('./hivemind.js')).HivemindManager(config);

  // Initialize Contact Manager
  const contactManager = new (await import('./contacts.js')).ContactManager(config, config.dbPath);
  await contactManager.initialize();
  await contactManager.seedDemoContacts();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser(config.sessionSecret));

  // Static file serving
  ensureDirectory(config.staticDir);
  app.use(express.static(config.staticDir, {
    maxAge: '1h',
    etag: true
  }));

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  });

  // Authentication routes
  app.post('/api/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
      }

      // Verify user credentials
      const isValid = await userDb.verifyPassword(username, password);
      
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Get user details
      const user = await userDb.findUserByLogin(username);
      
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      // Update last seen
      await userDb.updateLastSeen(user.id!);

      // Generate JWT token
      const token = userDb.generateToken(user);
      
      // Create session
      const sessionId = userDb.generateSessionId();
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      
      await userDb.createSession({
        session_id: sessionId,
        user_id: user.id!,
        expires: expires,
        ip: req.ip as string
      });
      
      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          username: user.user_login,
          role: user.role,
          email: user.user_email
        }
      });
    } catch (error: unknown) {
      console.error(chalk.red('❌ Login error:'), error instanceof Error ? error.message : String(error));
      res.status(500).json({ error: 'Authentication failed' });
    }
  });

  // User registration (admin only for now)
  app.post('/api/users', async (req, res) => {
    try {
      // TODO: Add admin check
      const { username, password, email, role = 'viewer' } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
      }

      // Check if user exists
      const existingUser = await userDb.findUserByLogin(username);
      if (existingUser) {
        return res.status(409).json({ error: 'Username already exists' });
      }

      // Create user
      const user = await userDb.createUser({
        user_login: username,
        user_pass: password,
        user_email: email,
        display_name: username,
        role: role as any
      });

      res.status(201).json({
        success: true,
        user: {
          id: user.id,
          username: user.user_login,
          role: user.role
        }
      });
    } catch (error: unknown) {
      console.error(chalk.red('❌ User creation error:'), error instanceof Error ? error.message : String(error));
      res.status(500).json({ error: 'User creation failed' });
    }
  });

  // JWT authentication middleware
  const authenticateJWT = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      const user = userDb.verifyToken(token);
      
      if (user) {
        req.user = user;
        return next();
      }
    }
    
    return res.status(401).json({ error: 'Unauthorized' });
  };

  // Role-based access control middleware
  const requireRole = (requiredRole: string | string[]) => {
    return async (req: any, res: any, next: any) => {
      // First authenticate
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const token = authHeader.split(' ')[1];
      const user = userDb.verifyToken(token);
      
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Check role
      const userWithRole = await userDb.findUserById(user.userId);
      
      if (!userWithRole) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Convert to array for easier checking
      const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      
      if (!requiredRoles.includes(userWithRole.role)) {
        return res.status(403).json({ 
          error: 'Forbidden',
          message: `Requires one of: ${requiredRoles.join(', ')}`
        });
      }

      // Attach full user data to request
      req.user = userWithRole;
      return next();
    };
  };

  // Get current user (requires authentication)
  app.get('/api/user', authenticateJWT, (req: any, res) => {
    res.json({ 
      user: req.user,
      authenticated: true
    });
  });

  // Admin-only route example
  app.get('/api/admin', requireRole('admin'), (req: any, res) => {
    res.json({
      message: 'Admin dashboard',
      user: req.user
    });
  });

  // Editor or admin route example
  app.get('/api/editor', requireRole(['editor', 'admin']), (req: any, res) => {
    res.json({
      message: 'Editor dashboard',
      user: req.user
    });
  });

  // Content Management API - Admin only
  app.get('/api/content', requireRole('admin'), async (req: any, res) => {
    try {
      // In a real implementation, this would query the content from the vault
      // For now, return a placeholder response
      res.json({
        success: true,
        content: [],
        message: 'Content management API placeholder'
      });
    } catch (error: unknown) {
      console.error(chalk.red('❌ Content API error:'), error instanceof Error ? error.message : String(error));
      res.status(500).json({ error: 'Content API failed' });
    }
  });

  // Get specific content item
  app.get('/api/content/:id', requireRole(['editor', 'admin']), async (req: any, res) => {
    try {
      const contentId = req.params.id;
      
      // Placeholder - in real implementation, this would fetch from vault
      res.json({
        success: true,
        content: {
          id: contentId,
          title: 'Sample Content',
          status: 'published',
          created_at: new Date().toISOString()
        }
      });
    } catch (error: unknown) {
      console.error(chalk.red('❌ Content fetch error:'), error instanceof Error ? error.message : String(error));
      res.status(500).json({ error: 'Failed to fetch content' });
    }
  });

  // Create new content (placeholder)
  app.post('/api/content', requireRole(['editor', 'admin']), async (req: any, res) => {
    try {
      const { title, content, status = 'draft' } = req.body;
      
      if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
      }

      // Placeholder - in real implementation, this would save to vault
      const newContentId = Math.random().toString(36).substring(2, 10);
      
      res.status(201).json({
        success: true,
        content: {
          id: newContentId,
          title,
          content,
          status,
          created_at: new Date().toISOString(),
          created_by: req.user.id
        }
      });
    } catch (error: unknown) {
      console.error(chalk.red('❌ Content creation error:'), error instanceof Error ? error.message : String(error));
      res.status(500).json({ error: 'Content creation failed' });
    }
  });

  // Update content (placeholder)
  app.put('/api/content/:id', requireRole(['editor', 'admin']), async (req: any, res) => {
    try {
      const contentId = req.params.id;
      const updates = req.body;
      
      // Placeholder - in real implementation, this would update vault content
      res.json({
        success: true,
        content: {
          id: contentId,
          ...updates,
          updated_at: new Date().toISOString()
        }
      });
    } catch (error: unknown) {
      console.error(chalk.red('❌ Content update error:'), error instanceof Error ? error.message : String(error));
      res.status(500).json({ error: 'Content update failed' });
    }
  });

  // Delete content (admin only)
  app.delete('/api/content/:id', requireRole('admin'), async (req: any, res) => {
    try {
      const contentId = req.params.id;
      
      // Placeholder - in real implementation, this would delete from vault
      res.json({
        success: true,
        message: `Content ${contentId} deleted`
      });
    } catch (error: unknown) {
      console.error(chalk.red('❌ Content deletion error:'), error instanceof Error ? error.message : String(error));
      res.status(500).json({ error: 'Content deletion failed' });
    }
  });

  // Basic API routes
  app.get('/api/status', (req, res) => {
    res.json({
      server: 'localhost-library',
      version: '1.0.0',
      features: ['static_serving', 'health_check', 'authentication', 'hivemind', 'contacts']
    });
  });

  // Hivemind API endpoints
  app.get('/api/hivemind/status', async (req, res) => {
    try {
      const status = hivemindManager.getStatus();
      res.json({
        success: true,
        ...status
      });
    } catch (error: unknown) {
      console.error(chalk.red('❌ Hivemind status error:'), error instanceof Error ? error.message : String(error));
      res.status(500).json({ error: 'Failed to get Hivemind status' });
    }
  });

  app.get('/api/hivemind/rankings', async (req, res) => {
    try {
      const rankings = hivemindManager.getProviderRankings();
      res.json({
        success: true,
        rankings
      });
    } catch (error: unknown) {
      console.error(chalk.red('❌ Hivemind rankings error:'), error instanceof Error ? error.message : String(error));
      res.status(500).json({ error: 'Failed to get Hivemind rankings' });
    }
  });

  app.get('/api/hivemind/metrics', async (req, res) => {
    try {
      const metrics = hivemindManager.getMetrics();
      res.json({
        success: true,
        metrics
      });
    } catch (error: unknown) {
      console.error(chalk.red('❌ Hivemind metrics error:'), error instanceof Error ? error.message : String(error));
      res.status(500).json({ error: 'Failed to get Hivemind metrics' });
    }
  });

  app.post('/api/hivemind/query', requireRole(['editor', 'admin']), async (req: any, res) => {
    try {
      const { provider, prompt } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      let selectedProvider = provider;
      if (!selectedProvider) {
        selectedProvider = await hivemindManager.autoSelectProvider();
      }

      const result = await hivemindManager.queryProvider(selectedProvider, prompt);
      
      res.json({
        success: true,
        result
      });
    } catch (error: unknown) {
      console.error(chalk.red('❌ Hivemind query error:'), error instanceof Error ? error.message : String(error));
      res.status(500).json({ error: 'Hivemind query failed' });
    }
  });

  // Contact API endpoints
  app.get('/api/contacts', requireRole(['editor', 'admin']), async (req: any, res) => {
    try {
      const contacts = await contactManager.getAllContacts();
      res.json({
        success: true,
        contacts
      });
    } catch (error: unknown) {
      console.error(chalk.red('❌ Contacts list error:'), error instanceof Error ? error.message : String(error));
      res.status(500).json({ error: 'Failed to get contacts' });
    }
  });

  app.get('/api/contacts/:id', requireRole(['editor', 'admin']), async (req: any, res) => {
    try {
      const contact = await contactManager.getContact(req.params.id);
      if (!contact) {
        return res.status(404).json({ error: 'Contact not found' });
      }
      res.json({
        success: true,
        contact
      });
    } catch (error: unknown) {
      console.error(chalk.red('❌ Contact fetch error:'), error instanceof Error ? error.message : String(error));
      res.status(500).json({ error: 'Failed to get contact' });
    }
  });

  app.post('/api/contacts', requireRole(['editor', 'admin']), async (req: any, res) => {
    try {
      const { name, email, phone, type, tags, notes } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }

      const contact = await contactManager.createContact({
        name,
        email,
        phone,
        type: type || 'other',
        tags: tags || [],
        notes
      });

      res.status(201).json({
        success: true,
        contact
      });
    } catch (error: unknown) {
      console.error(chalk.red('❌ Contact creation error:'), error instanceof Error ? error.message : String(error));
      res.status(500).json({ error: 'Failed to create contact' });
    }
  });

  app.put('/api/contacts/:id', requireRole(['editor', 'admin']), async (req: any, res) => {
    try {
      const updates = req.body;
      const contact = await contactManager.updateContact(req.params.id, updates);
      
      if (!contact) {
        return res.status(404).json({ error: 'Contact not found' });
      }

      res.json({
        success: true,
        contact
      });
    } catch (error: unknown) {
      console.error(chalk.red('❌ Contact update error:'), error instanceof Error ? error.message : String(error));
      res.status(500).json({ error: 'Failed to update contact' });
    }
  });

  app.delete('/api/contacts/:id', requireRole(['editor', 'admin']), async (req: any, res) => {
    try {
      const success = await contactManager.deleteContact(req.params.id);
      
      if (!success) {
        return res.status(404).json({ error: 'Contact not found' });
      }

      res.json({
        success: true,
        message: 'Contact deleted'
      });
    } catch (error: unknown) {
      console.error(chalk.red('❌ Contact deletion error:'), error instanceof Error ? error.message : String(error));
      res.status(500).json({ error: 'Failed to delete contact' });
    }
  });

  app.get('/api/contacts/search', requireRole(['editor', 'admin']), async (req: any, res) => {
    try {
      const query = req.query.q as string;
      
      if (!query) {
        return res.status(400).json({ error: 'Search query required' });
      }

      const contacts = await contactManager.searchContacts(query);
      res.json({
        success: true,
        contacts
      });
    } catch (error: unknown) {
      console.error(chalk.red('❌ Contact search error:'), error instanceof Error ? error.message : String(error));
      res.status(500).json({ error: 'Failed to search contacts' });
    }
  });

  app.post('/api/contacts/sync', requireRole(['editor', 'admin']), async (req: any, res) => {
    try {
      const result = await contactManager.syncContacts();
      res.json({
        success: true,
        result
      });
    } catch (error: unknown) {
      console.error(chalk.red('❌ Contact sync error:'), error instanceof Error ? error.message : String(error));
      res.status(500).json({ error: 'Failed to sync contacts' });
    }
  });

  app.get('/api/contacts/stats', requireRole(['editor', 'admin']), async (req: any, res) => {
    try {
      const stats = contactManager.getStats();
      res.json({
        success: true,
        stats
      });
    } catch (error: unknown) {
      console.error(chalk.red('❌ Contact stats error:'), error instanceof Error ? error.message : String(error));
      res.status(500).json({ error: 'Failed to get contact stats' });
    }
  });

  app.get('/api/contacts/recent', requireRole(['editor', 'admin']), async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const contacts = await contactManager.getRecentContacts(limit);
      res.json({
        success: true,
        contacts
      });
    } catch (error: unknown) {
      console.error(chalk.red('❌ Recent contacts error:'), error instanceof Error ? error.message : String(error));
      res.status(500).json({ error: 'Failed to get recent contacts' });
    }
  });

  app.get('/api/contacts/frequent', requireRole(['editor', 'admin']), async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const contacts = await contactManager.getFrequentContacts(limit);
      res.json({
        success: true,
        contacts
      });
    } catch (error: unknown) {
      console.error(chalk.red('❌ Frequent contacts error:'), error instanceof Error ? error.message : String(error));
      res.status(500).json({ error: 'Failed to get frequent contacts' });
    }
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).sendFile(path.join(config.staticDir, '404.html'));
  });

  // Error handler
  app.use((err: any, req: any, res: any, next: any) => {
    console.error(chalk.red('❌ Server error:'), err.message);
    res.status(500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
  });

  // Start server
  const server = app.listen(config.port, () => {
    console.log(chalk.green(`✅ Server running on ${config.baseUrl}`));
    console.log(chalk.green(`📂 Serving static files from ${config.staticDir}`));
    console.log(chalk.green(`💾 Database: ${userDb.getDbPath()}`));
    console.log(chalk.cyan('\nAvailable endpoints:'));
    console.log(chalk.dim(`  • GET  /health - Health check`));
    console.log(chalk.dim(`  • GET  /api/status - Server status`));
    console.log(chalk.dim(`  • POST /api/login - User login (returns JWT)`));
    console.log(chalk.dim(`  • POST /api/users - Create user`));
    console.log(chalk.dim(`  • GET  /api/user - Current user (JWT required)`));
    console.log(chalk.dim(`  • GET  /api/admin - Admin dashboard (admin only)`));
    console.log(chalk.dim(`  • GET  /api/editor - Editor dashboard (editor/admin)`));
    console.log(chalk.dim(`  • GET  /api/content - List all content (admin)`));
    console.log(chalk.dim(`  • GET  /api/content/:id - Get content (editor/admin)`));
    console.log(chalk.dim(`  • POST /api/content - Create content (editor/admin)`));
    console.log(chalk.dim(`  • PUT  /api/content/:id - Update content (editor/admin)`));
    console.log(chalk.dim(`  • DELETE /api/content/:id - Delete content (admin)`));
    console.log(chalk.dim(`  • GET  /api/hivemind/status - Hivemind status`));
    console.log(chalk.dim(`  • GET  /api/hivemind/rankings - Provider rankings`));
    console.log(chalk.dim(`  • GET  /api/hivemind/metrics - Hivemind metrics`));
    console.log(chalk.dim(`  • POST /api/hivemind/query - Query Hivemind (editor/admin)`));
    console.log(chalk.dim(`  • GET  /api/contacts - List all contacts (editor/admin)`));
    console.log(chalk.dim(`  • GET  /api/contacts/:id - Get contact (editor/admin)`));
    console.log(chalk.dim(`  • POST /api/contacts - Create contact (editor/admin)`));
    console.log(chalk.dim(`  • PUT  /api/contacts/:id - Update contact (editor/admin)`));
    console.log(chalk.dim(`  • DELETE /api/contacts/:id - Delete contact (editor/admin)`));
    console.log(chalk.dim(`  • GET  /api/contacts/search - Search contacts (editor/admin)`));
    console.log(chalk.dim(`  • POST /api/contacts/sync - Sync contacts (editor/admin)`));
    console.log(chalk.dim(`  • GET  /api/contacts/stats - Contact statistics (editor/admin)`));
    console.log(chalk.dim(`  • GET  /api/contacts/recent - Recent contacts (editor/admin)`));
    console.log(chalk.dim(`  • GET  /api/contacts/frequent - Frequent contacts (editor/admin)`));
    console.log(chalk.dim(`  • GET  /admin - Admin dashboard (HTML)`));
    console.log(chalk.dim(`  • GET  /admin/api/users - List users (admin)`));
    console.log(chalk.dim(`  • GET  /admin/api/status - System status (admin)`));
    console.log(chalk.dim(`  • GET  /admin/api/hivemind - Hivemind admin status`));
    console.log(chalk.dim(`  • GET  /admin/api/hivemind/rankings - Hivemind rankings`));
    console.log(chalk.dim(`  • GET  /admin/api/hivemind/metrics - Hivemind admin metrics`));
    console.log(chalk.dim(`  • GET  /* - Static file serving`));
  });

  // Setup admin dashboard routes
  // Import and call the setup function
  try {
    const { setupAdminRoutes } = await import('./admin.js');
    setupAdminRoutes(app, userDb, config, hivemindManager);
  } catch (error) {
    console.error(chalk.yellow('⚠️  Admin dashboard setup failed:'), error);
  }

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log(chalk.yellow('\n🛑 Shutting down server...'));
    server.close(() => {
      console.log(chalk.yellow('✅ Server stopped'));
      process.exit(0);
    });
  });

  return app;
}

// Export server creation function
export { createServer, loadConfig };

// Start server if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createServer().catch(err => {
    console.error(chalk.red('❌ Failed to start server:'), err);
    process.exit(1);
  });
}