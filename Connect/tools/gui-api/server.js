const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5175;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Import routes
const vaultRoutes = require('./endpoints/vault');
const execRoutes = require('./endpoints/exec');

// Use routes
app.use('/api/vault', vaultRoutes);
app.use('/api/exec', execRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`GUI API Server running on http://localhost:${PORT}`);
});
