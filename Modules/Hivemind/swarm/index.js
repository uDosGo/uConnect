// Handoff Manager for Hivemind Swarm
// Part of uDosGo Connect Module

class HandoffManager {
  constructor() {
    this.vaultPath = process.env.FREDPORTER_VAULT || '~/Vault';
    this.handoffPath = `${this.vaultPath}/handoff`;
    this.gitSync = true;
    this.cloudGateway = null;
    this.agentId = process.env.HOSTNAME || 'unknown-agent';
  }
  
  async init() {
    // Load peer list
    this.peers = await this.loadPeers();
    
    // Start file watcher on handoff directory
    this.watchHandoff();
    
    // Connect to cloud gateway if available
    if (process.env.UDOS_CLOUD_ENABLED === 'true') {
      this.connectCloudGateway();
    }
  }
  
  async loadPeers() {
    const fs = require('fs').promises;
    try {
      const data = await fs.readFile(`${this.handoffPath}/swarm/peers.json`, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading peers:', error);
      return { agents: [] };
    }
  }
  
  async sendHandoff(toAgent, context, state) {
    const fs = require('fs').promises;
    const crypto = require('crypto');
    
    const handoff = {
      id: crypto.randomUUID(),
      from: this.agentId,
      to: toAgent,
      timestamp: new Date().toISOString(),
      context: context,
      state: state,
      status: 'pending'
    };
    
    // Save to local handoff directory
    await fs.writeFile(
      `${this.handoffPath}/shared/outbound/${handoff.id}.json`,
      JSON.stringify(handoff, null, 2)
    );
    
    // Git sync (will push to other agents)
    await this.gitCommitAndPush(`Handoff to ${toAgent}`);
    
    // If cloud gateway available, push instantly
    if (this.cloudGateway) {
      await this.cloudGateway.send(handoff);
    }
    
    return handoff.id;
  }
  
  async gitCommitAndPush(message) {
    const { exec } = require('child_process');
    
    return new Promise((resolve, reject) => {
      exec(`cd ${this.vaultPath} && git add . && git commit -m "${message}" && git push`, (error, stdout, stderr) => {
        if (error) {
          console.error('Git sync error:', error);
          reject(error);
        } else {
          console.log('Git sync successful:', stdout);
          resolve();
        }
      });
    });
  }
  
  async watchHandoff() {
    const chokidar = require('chokidar');
    
    chokidar.watch(`${this.handoffPath}/shared/inbound/`).on('add', async (path) => {
      const fs = require('fs').promises;
      const handoff = JSON.parse(await fs.readFile(path, 'utf8'));
      console.log(`📨 Received handoff from ${handoff.from}`);
      
      // Notify agent
      this.emit('handoff-received', handoff);
      
      // Auto-acknowledge
      await this.acknowledgeHandoff(handoff.id);
    });
  }
  
  async acknowledgeHandoff(handoffId) {
    const fs = require('fs').promises;
    
    // Move from inbound to acknowledged
    await fs.rename(
      `${this.handoffPath}/shared/inbound/${handoffId}.json`,
      `${this.handoffPath}/shared/acknowledged/${handoffId}.json`
    );
    
    // Update status
    const handoff = JSON.parse(await fs.readFile(
      `${this.handoffPath}/shared/acknowledged/${handoffId}.json`, 'utf8'
    ));
    handoff.status = 'acknowledged';
    handoff.acknowledged_at = new Date().toISOString();
    
    await fs.writeFile(
      `${this.handoffPath}/shared/acknowledged/${handoffId}.json`,
      JSON.stringify(handoff, null, 2)
    );
    
    await this.gitCommitAndPush(`Acknowledged handoff ${handoffId}`);
  }
  
  async connectCloudGateway() {
    const WebSocket = require('ws');
    
    this.cloudGateway = new WebSocket('wss://handoff.udo.place/v1');
    
    this.cloudGateway.on('open', () => {
      console.log('Connected to cloud handoff gateway');
      this.cloudGateway.send(JSON.stringify({
        type: 'register',
        agent: this.agentId
      }));
    });
    
    this.cloudGateway.on('message', (data) => {
      const handoff = JSON.parse(data);
      this.processCloudHandoff(handoff);
    });
  }
  
  processCloudHandoff(handoff) {
    console.log('Processing cloud handoff:', handoff);
    // Implement handoff processing logic
  }
}

module.exports = HandoffManager;