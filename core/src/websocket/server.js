/**
 * WebSocket Server
 * Real-time communication for uDos
 */

const WebSocket = require('ws');
const http = require('http');
const url = require('url');

class WebSocketServer {
  constructor(options = {}) {
    this.options = {
      port: options.port || 8081,
      path: options.path || '/ws',
      ...options
    };
    
    this.server = null;
    this.wss = null;
    this.clients = new Map(); // clientId -> { ws, userId, familyId }
    this.messageHandlers = new Map();
  }
  
  /**
   * Start WebSocket server
   * @param {http.Server} httpServer - Optional HTTP server to attach to
   */
  start(httpServer = null) {
    if (httpServer) {
      this.wss = new WebSocket.Server({ server: httpServer, path: this.options.path });
    } else {
      const server = http.createServer();
      this.wss = new WebSocket.Server({ server, path: this.options.path });
      server.listen(this.options.port);
    }
    
    this.wss.on('connection', (ws, req) => {
      this._handleConnection(ws, req);
    });
    
    console.log(`🔗 WebSocket server started on ${this.options.path}`);
    if (!httpServer) {
      console.log(`🌐 Listening on port ${this.options.port}`);
    }
  }
  
  /**
   * Handle new WebSocket connection
   * @param {WebSocket} ws - WebSocket connection
   * @param {http.IncomingMessage} req - HTTP request
   */
  _handleConnection(ws, req) {
    const clientId = this._generateClientId();
    const connectionInfo = {
      ws,
      userId: null,
      familyId: null,
      connectedAt: new Date(),
      ip: req.socket.remoteAddress
    };
    
    this.clients.set(clientId, connectionInfo);
    
    ws.on('message', (message) => {
      this._handleMessage(clientId, message);
    });
    
    ws.on('close', () => {
      this._handleDisconnect(clientId);
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
    
    // Send welcome message
    this._sendMessage(clientId, {
      type: 'welcome',
      clientId,
      timestamp: new Date().toISOString()
    });
  }
  
  /**
   * Handle incoming message
   * @param {string} clientId - Client ID
   * @param {string} message - Raw message
   */
  _handleMessage(clientId, message) {
    try {
      const data = JSON.parse(message);
      
      // Handle built-in messages
      switch (data.type) {
        case 'subscribe':
          this._handleSubscribe(clientId, data);
          return;
        case 'ping':
          this._handlePing(clientId, data);
          return;
      }
      
      // Handle custom message types
      if (this.messageHandlers.has(data.type)) {
        this.messageHandlers.get(data.type)(clientId, data);
      }
    } catch (error) {
      console.error('Message parsing error:', error);
      this._sendMessage(clientId, {
        type: 'error',
        error: 'Invalid message format',
        original: message
      });
    }
  }
  
  /**
   * Handle subscription
   * @param {string} clientId - Client ID
   * @param {Object} data - Subscription data
   */
  _handleSubscribe(clientId, data) {
    const client = this.clients.get(clientId);
    if (!client) return;
    
    if (data.userId) {
      client.userId = data.userId;
    }
    
    if (data.familyId) {
      client.familyId = data.familyId;
    }
    
    this._sendMessage(clientId, {
      type: 'subscribed',
      userId: client.userId,
      familyId: client.familyId
    });
  }
  
  /**
   * Handle ping message
   * @param {string} clientId - Client ID
   * @param {Object} data - Ping data
   */
  _handlePing(clientId, data) {
    this._sendMessage(clientId, {
      type: 'pong',
      timestamp: new Date().toISOString(),
      clientTime: data.timestamp
    });
  }
  
  /**
   * Handle client disconnect
   * @param {string} clientId - Client ID
   */
  _handleDisconnect(clientId) {
    this.clients.delete(clientId);
    console.log(`🔴 Client disconnected: ${clientId}`);
  }
  
  /**
   * Send message to client
   * @param {string} clientId - Client ID
   * @param {Object} message - Message object
   */
  _sendMessage(clientId, message) {
    const client = this.clients.get(clientId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  }
  
  /**
   * Broadcast message to all clients
   * @param {Object} message - Message object
   */
  broadcast(message) {
    this.clients.forEach((client, clientId) => {
      this._sendMessage(clientId, message);
    });
  }
  
  /**
   * Broadcast to family
   * @param {string} familyId - Family ID
   * @param {Object} message - Message object
   */
  broadcastToFamily(familyId, message) {
    this.clients.forEach((client, clientId) => {
      if (client.familyId === familyId) {
        this._sendMessage(clientId, message);
      }
    });
  }
  
  /**
   * Broadcast to user
   * @param {string} userId - User ID
   * @param {Object} message - Message object
   */
  broadcastToUser(userId, message) {
    this.clients.forEach((client, clientId) => {
      if (client.userId === userId) {
        this._sendMessage(clientId, message);
      }
    });
  }
  
  /**
   * Register message handler
   * @param {string} type - Message type
   * @param {Function} handler - Handler function
   */
  on(type, handler) {
    this.messageHandlers.set(type, handler);
  }
  
  /**
   * Get connected clients count
   * @returns {number} Client count
   */
  getClientCount() {
    return this.clients.size;
  }
  
  /**
   * Get client info
   * @param {string} clientId - Client ID
   * @returns {Object} Client info
   */
  getClientInfo(clientId) {
    const client = this.clients.get(clientId);
    if (!client) return null;
    
    return {
      clientId,
      userId: client.userId,
      familyId: client.familyId,
      connectedAt: client.connectedAt,
      ip: client.ip
    };
  }
  
  /**
   * Generate client ID
   * @returns {string} Client ID
   */
  _generateClientId() {
    return `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Get all connected clients
   * @returns {Array} Array of client info
   */
  getAllClients() {
    return Array.from(this.clients.values()).map(client => ({
      clientId: this._getClientId(client.ws),
      userId: client.userId,
      familyId: client.familyId,
      connectedAt: client.connectedAt,
      ip: client.ip
    }));
  }
  
  /**
   * Get client ID from WebSocket
   * @param {WebSocket} ws - WebSocket
   * @returns {string} Client ID
   */
  _getClientId(ws) {
    for (const [clientId, client] of this.clients) {
      if (client.ws === ws) {
        return clientId;
      }
    }
    return null;
  }
}

module.exports = WebSocketServer;