<template>
  <div class="admin-dashboard">
    <header class="dashboard-header">
      <h1>uDos Admin Dashboard</h1>
      <div class="user-info">
        <span class="user-name">{{ userName }}</span>
        <span class="user-role">{{ userRole }}</span>
      </div>
    </header>
    
    <div class="dashboard-content">
      <div class="stats-grid">
        <div class="stat-card">
          <h3>Total Families</h3>
          <div class="stat-value">{{ stats.families }}</div>
          <div class="stat-change">+{{ stats.familyChange }} this week</div>
        </div>
        
        <div class="stat-card">
          <h3>Active Users</h3>
          <div class="stat-value">{{ stats.activeUsers }}</div>
          <div class="stat-change">+{{ stats.userChange }} today</div>
        </div>
        
        <div class="stat-card">
          <h3>Cache Hit Rate</h3>
          <div class="stat-value">{{ stats.cacheHitRate }}%</div>
          <div class="stat-change">{{ stats.cacheChange > 0 ? '+' : '' }}{{ stats.cacheChange }}%</div>
        </div>
        
        <div class="stat-card">
          <h3>WebSocket Clients</h3>
          <div class="stat-value">{{ stats.wsClients }}</div>
          <div class="stat-change">{{ stats.wsChange > 0 ? '+' : '' }}{{ stats.wsChange }} active</div>
        </div>
      </div>
      
      <div class="dashboard-section">
        <h2>Recent Activity</h2>
        <div class="activity-list">
          <div v-for="activity in recentActivity" :key="activity.id" class="activity-item">
            <div class="activity-icon">📋</div>
            <div class="activity-content">
              <div class="activity-header">
                <span class="activity-type">{{ activity.type }}</span>
                <span class="activity-time">{{ formatTime(activity.timestamp) }}</span>
              </div>
              <div class="activity-description">
                {{ activity.description }}
              </div>
              <div class="activity-meta">
                <span class="activity-user">{{ activity.user }}</span>
                <span class="activity-family" v-if="activity.family">Family: {{ activity.family }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="dashboard-section">
        <h2>System Health</h2>
        <div class="health-monitor">
          <div class="health-item">
            <span class="health-label">Database:</span>
            <span class="health-status" :class="health.database">{{ health.database }}</span>
          </div>
          <div class="health-item">
            <span class="health-label">Redis:</span>
            <span class="health-status" :class="health.redis">{{ health.redis }}</span>
          </div>
          <div class="health-item">
            <span class="health-label">WebSocket:</span>
            <span class="health-status" :class="health.websocket">{{ health.websocket }}</span>
          </div>
          <div class="health-item">
            <span class="health-label">API:</span>
            <span class="health-status" :class="health.api">{{ health.api }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminDashboard',
  
  data() {
    return {
      userName: 'Administrator',
      userRole: 'Super Admin',
      stats: {
        families: 42,
        familyChange: 5,
        activeUsers: 128,
        userChange: 8,
        cacheHitRate: 87,
        cacheChange: 2,
        wsClients: 35,
        wsChange: 3
      },
      recentActivity: [
        {
          id: 'act1',
          type: 'Family Created',
          description: 'New family "Acme Inc" was created',
          user: 'alice',
          family: 'Acme Inc',
          timestamp: new Date(Date.now() - 10000)
        },
        {
          id: 'act2',
          type: 'User Joined',
          description: 'bob joined the Development team',
          user: 'bob',
          family: 'Development',
          timestamp: new Date(Date.now() - 30000)
        },
        {
          id: 'act3',
          type: 'Cache Cleared',
          description: 'Manual cache clear performed by administrator',
          user: 'admin',
          timestamp: new Date(Date.now() - 60000)
        },
        {
          id: 'act4',
          type: 'API Rate Limit',
          description: 'Rate limit triggered for IP 192.168.1.100',
          user: 'system',
          timestamp: new Date(Date.now() - 120000)
        }
      ],
      health: {
        database: 'healthy',
        redis: 'healthy',
        websocket: 'healthy',
        api: 'healthy'
      }
    };
  },
  
  methods: {
    formatTime(timestamp) {
      const now = new Date();
      const diff = now - timestamp;
      
      if (diff < 60000) {
        return `${Math.floor(diff / 1000)} seconds ago`;
      } else if (diff < 3600000) {
        return `${Math.floor(diff / 60000)} minutes ago`;
      } else if (diff < 86400000) {
        return `${Math.floor(diff / 3600000)} hours ago`;
      } else {
        return timestamp.toLocaleDateString();
      }
    }
  }
};
</script>

<style scoped>
.admin-dashboard {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.dashboard-header h1 {
  color: #2c3e50;
  margin: 0;
  font-size: 24px;
}

.user-info {
  display: flex;
  gap: 10px;
  align-items: center;
}

.user-name {
  font-weight: bold;
}

.user-role {
  background-color: #f0f0f0;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #f0f0f0;
}

.stat-card h3 {
  color: #666;
  font-size: 14px;
  margin-top: 0;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 5px;
}

.stat-change {
  font-size: 12px;
  color: #4CAF50;
}

.dashboard-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.dashboard-section h2 {
  color: #2c3e50;
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 18px;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.activity-item {
  display: flex;
  gap: 15px;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 6px;
  border-left: 3px solid #42b983;
}

.activity-icon {
  font-size: 20px;
}

.activity-content {
  flex: 1;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.activity-type {
  font-weight: bold;
  color: #2c3e50;
}

.activity-time {
  color: #999;
  font-size: 12px;
}

.activity-description {
  color: #555;
  margin-bottom: 5px;
}

.activity-meta {
  display: flex;
  gap: 15px;
  font-size: 12px;
  color: #666;
}

.health-monitor {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.health-item {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 6px;
}

.health-label {
  color: #666;
  font-weight: 500;
}

.health-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.health-status.healthy {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.health-status.warning {
  background-color: #fff3e0;
  color: #ef6c00;
}

.health-status.error {
  background-color: #ffebee;
  color: #c62828;
}
</style>