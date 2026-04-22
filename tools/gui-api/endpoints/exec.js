const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');

const execAsync = promisify(exec);

// Get the path to udo.mjs
const UDO_PATH = path.join(__dirname, '..', '..', '..', 'core', 'bin', 'udo.mjs');

router.post('/', async (req, res) => {
  try {
    const { command } = req.body;
    
    if (!command) {
      return res.status(400).json({ success: false, error: 'Command required' });
    }
    
    console.log(`Executing: ${command}`);
    
    // Use node to execute udo.mjs
    const fullCommand = `node ${UDO_PATH} ${command}`;
    const { stdout, stderr } = await execAsync(fullCommand);
    
    if (stderr) {
      return res.json({ success: false, output: stdout, error: stderr });
    }
    
    res.json({ success: true, output: stdout });
  } catch (error) {
    console.error('Command execution failed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
