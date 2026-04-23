const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const VAULT_PATH = process.env.VAULT_PATH || path.join(process.env.HOME || '', 'vault');

router.get('/list', async (req, res) => {
  try {
    if (!fs.existsSync(VAULT_PATH)) {
      return res.json([]);
    }
    
    const items = fs.readdirSync(VAULT_PATH).map(item => {
      const itemPath = path.join(VAULT_PATH, item);
      const stats = fs.statSync(itemPath);
      
      return {
        name: item,
        type: stats.isDirectory() ? 'directory' : 'file',
        size: stats.size,
        modified: stats.mtime.toISOString()
      };
    });
    
    res.json(items);
  } catch (error) {
    console.error('Failed to list vault:', error);
    res.status(500).json({ error: 'Failed to list vault contents' });
  }
});

router.post('/create', async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, error: 'Name required' });
    }
    
    const dirPath = path.join(VAULT_PATH, name);
    
    if (fs.existsSync(dirPath)) {
      return res.status(400).json({ success: false, error: 'Directory already exists' });
    }
    
    fs.mkdirSync(dirPath);
    res.json({ success: true, path: dirPath });
  } catch (error) {
    console.error('Failed to create directory:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
