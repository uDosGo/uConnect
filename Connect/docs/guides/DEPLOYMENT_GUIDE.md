# uDos Production Deployment Guide

This comprehensive guide covers all aspects of deploying uDos to production environments, including CI/CD setup, infrastructure requirements, and operational considerations.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Infrastructure Requirements](#infrastructure-requirements)
- [Deployment Architecture](#deployment-architecture)
- [CI/CD Pipeline Setup](#cicd-pipeline-setup)
- [Production Configuration](#production-configuration)
- [Deployment Process](#deployment-process)
- [Post-Deployment Checks](#post-deployment-checks)
- [Monitoring and Maintenance](#monitoring-and-maintenance)
- [Troubleshooting](#troubleshooting)
- [Rollback Procedures](#rollback-procedures)

## Prerequisites

### System Requirements

- **Node.js**: Version 24+ (LTS recommended)
- **npm**: Version 11+ 
- **Docker**: Version 29+ (for containerized deployments)
- **SQLite**: Version 3.51+ (included in most systems)
- **Python**: Version 3.9+ (for some ML components)
- **Git**: Version 2.50+

### Required Tools

```bash
# Install required tools on Ubuntu/Debian
sudo apt update
sudo apt install -y nodejs npm docker.io sqlite3 python3 git

# Install required tools on macOS
brew install node npm docker sqlite3 python git
```

### Network Requirements

- Outbound internet access for npm packages
- Port 3000 for main application (configurable)
- Port 8080 for webhook server (configurable)
- Port 6379 for Redis (if using caching)

## Infrastructure Requirements

### Minimum Server Specifications

| Component | Development | Production (Small) | Production (Large) |
|-----------|------------|-------------------|-------------------|
| CPU | 2 cores | 4 cores | 8+ cores |
| RAM | 4GB | 8GB | 16+ GB |
| Storage | 20GB | 50GB | 100+ GB |
| Network | 10Mbps | 100Mbps | 1Gbps+ |

### Recommended Cloud Providers

- **AWS**: EC2 (t3.large+), RDS (for production DB), S3 (for exports)
- **Google Cloud**: Compute Engine (e2-medium+), Cloud SQL, Cloud Storage
- **Azure**: Virtual Machines (Standard_D4s_v3+), Azure SQL, Blob Storage
- **DigitalOcean**: Droplets (8GB+), Managed Databases, Spaces

## Deployment Architecture

### Standard Deployment

```
┌───────────────────────────────────────────────────────┐
│                    Load Balancer                      │
└───────────────────────────────────────────────────────┘
                                │
┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐
│   uDos Core         │ │   uDos UI          │ │   Sonic-Express     │
│   (Node.js)         │ │   (Vue.js)         │ │   (CLI/Tools)      │
└─────────────────────┘ └─────────────────────┘ └─────────────────────┘
                                │
┌───────────────────────────────────────────────────────┐
│                    Shared Services                    │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐     │
│ │  SQLite    │ │  Redis      │ │  Webhook    │     │
│ │  (Primary) │ │  (Cache)    │ │  Server     │     │
│ └─────────────┘ └─────────────┘ └─────────────┘     │
└───────────────────────────────────────────────────────┘
```

### Containerized Deployment

```
┌───────────────────────────────────────────────────────┐
│                    Kubernetes Cluster                 │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐     │
│ │  uDos Core  │ │  uDos UI    │ │  Sonic-     │     │
│ │  Pod         │ │  Pod         │ │  Express    │     │
│ └─────────────┘ └─────────────┘ │  Pod         │     │
│ ┌─────────────┐ ┌─────────────┐ └─────────────┘     │
│ │  SQLite     │ │  Redis      │ ┌─────────────┐     │
│ │  Stateful  │ │  Stateful   │ │  Webhook    │     │
│ │  Set        │ │  Set        │ │  Deployment │     │
│ └─────────────┘ └─────────────┘ └─────────────┘     │
└───────────────────────────────────────────────────────┘
```

## CI/CD Pipeline Setup

### GitHub Actions Configuration

The CI/CD pipeline is configured in `.github/workflows/ci-cd.yml` with the following stages:

1. **Lint**: Code quality checks
2. **Test**: Unit and integration tests
3. **Safety**: Security and boundary checks
4. **Deploy**: Production deployment (main branch only)
5. **Documentation**: API docs generation
6. **Notify**: Deployment notifications

### Setting Up Secrets

Required GitHub secrets for CI/CD:

```bash
# Set these in GitHub repository settings > Secrets
UDOS_WEBHOOK_URL="https://your-webhook-url.com/api/webhooks"
UDOS_WEBHOOK_TOKEN="your-webhook-auth-token"
NPM_TOKEN="your-npm-token-for-private-packages"
DOCKER_HUB_USERNAME="your-docker-username"
DOCKER_HUB_TOKEN="your-docker-token"
```

### Customizing the Pipeline

Edit `.github/workflows/ci-cd.yml` to customize:

- **Branches**: Modify `on.push.branches` to trigger on different branches
- **Node Version**: Change `node-version` in setup steps
- **Deployment Targets**: Update deployment scripts for your infrastructure
- **Notifications**: Configure webhook URLs and tokens

## Production Configuration

### Environment Variables

Create `.env.production` file:

```env
# Core Configuration
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Database
DB_PATH=/var/lib/udos/udos.db
DB_BACKUP_PATH=/var/lib/udos/backups

# Cache
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# Webhooks
WEBHOOK_SECRET=your_webhook_secret
WEBHOOK_PORT=8080

# Email
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=your_email@domain.com
SMTP_PASSWORD=your_email_password
EMAIL_FROM="uDos <noreply@udos.com>"

# Security
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h
ADMIN_TOKEN=your_admin_token_here

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/udos/udos.log
LOG_MAX_SIZE=100m
LOG_MAX_FILES=10
```

### Configuration Files

Key configuration files to review:

- `vibecli/config.json` - Main CLI configuration
- `config/email.yaml` - Email service configuration
- `config/webhooks.yaml` - Webhook configuration
- `tools/sonic-express/config.example.json` - Sonic-Express configuration

## Deployment Process

### Manual Deployment

```bash
# 1. Checkout the latest code
git pull origin main

# 2. Install dependencies
npm install

# 3. Build the project
npm run build

# 4. Run database migrations
bash scripts/run-migrations.sh

# 5. Start services
npm run start:production

# 6. Verify deployment
bash scripts/verify-deployment.sh
```

### Using Sonic-Screwdriver CLI

```bash
# Install Sonic-Screwdriver
cd tools/sonic-express
npm install
npm link

# Deploy using CLI
sonic install --verbose
sonic start --background
sonic health --detailed
```

### Docker Deployment

```bash
# Build Docker images
docker build -t udos/core -f core/Dockerfile .
docker build -t udos/ui -f ui/Dockerfile .
docker build -t udos/sonic -f tools/sonic-express/Dockerfile .

# Run containers
docker-compose -f production/docker-compose.yml up -d

# Verify containers
docker ps
docker logs udos-core
```

## Post-Deployment Checks

### Health Check

```bash
# Check service health
curl -sSf http://localhost:3000/health

# Check database connectivity
sqlite3 /var/lib/udos/udos.db "SELECT COUNT(*) FROM families;"

# Check Redis connectivity (if used)
redis-cli ping
```

### Verification Script

```bash
# Run comprehensive verification
bash scripts/verify-deployment.sh

# Check specific components
node scripts/verify-components.js
```

### Smoke Testing

```bash
# Test core API endpoints
curl -sSf http://localhost:3000/api/v1/status
curl -sSf http://localhost:3000/api/v1/families

# Test UI
curl -sSf http://localhost:3000/ | grep -q "uDos"

# Test webhooks
curl -X POST -H "Content-Type: application/json" \
  -d '{"event":"test","data":{}}' \
  http://localhost:8080/webhook
```

## Monitoring and Maintenance

### Logging Setup

```bash
# View logs
 tail -f /var/log/udos/udos.log

# Rotate logs
logrotate -f /etc/logrotate.d/udos

# Monitor performance
 top -p $(pgrep -f "node.*udos")
```

### Backup Strategy

```bash
# Database backup
sqlite3 /var/lib/udos/udos.db ".backup /var/lib/udos/backups/udos-$(date +%Y-%m-%d).db"

# Full backup
 tar -czvf /backups/udos-full-$(date +%Y-%m-%d).tar.gz \
   /var/lib/udos \
   /etc/udos \
   /var/log/udos

# Automated backup (add to crontab)
0 2 * * * /usr/local/bin/udos-backup.sh
```

### Monitoring Tools

Recommended monitoring setup:

```yaml
# Prometheus configuration (prometheus.yml)
scrape_configs:
  - job_name: 'udos'
    static_configs:
      - targets: ['localhost:3000']

# Grafana dashboard for uDos metrics
# Import dashboard ID: 12345
```

## Troubleshooting

### Common Issues and Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| `ECONNREFUSED` | Database not running | Check SQLite/Redis services |
| `ENOENT` | Missing files | Run `npm install` and rebuild |
| `EACCES` | Permission issues | Run with proper user or `chmod` |
| `Module not found` | Missing dependencies | Delete `node_modules` and reinstall |
| `Port already in use` | Conflicting service | Change port or stop conflicting service |

### Debugging Commands

```bash
# Check running processes
ps aux | grep node

# Check open ports
lsof -i :3000

# Check environment variables
env | grep UDOS

# Test database connection
sqlite3 /var/lib/udos/udos.db "SELECT sqlite_version();"

# Check disk space
df -h /var/lib/udos
```

## Rollback Procedures

### Version Rollback

```bash
# Rollback to previous version
git checkout v1.0.0
npm install
npm run build
bash scripts/deploy-production.sh
```

### Database Rollback

```bash
# Restore from backup
sqlite3 /var/lib/udos/udos.db ".restore /var/lib/udos/backups/udos-2024-01-01.db"

# Rollback specific migration
sqlite3 /var/lib/udos/udos.db "DELETE FROM migrations WHERE filename='003_problematic_migration.sql'"
```

### Emergency Procedures

```bash
# Stop all services
bash scripts/stop-all.sh

# Restart with safe mode
NODE_ENV=production SAFE_MODE=true npm start

# Check system status
bash scripts/system-diagnostics.sh
```

## Production Checklist

- [ ] Infrastructure provisioned and configured
- [ ] All environment variables set in `.env.production`
- [ ] Database migrations applied
- [ ] CI/CD pipeline configured and tested
- [ ] Monitoring and alerting set up
- [ ] Backup strategy implemented and tested
- [ ] Security measures (firewall, HTTPS) configured
- [ ] Load testing completed
- [ ] Rollback procedures documented and tested
- [ ] Team trained on deployment procedures

## Support Resources

- **Documentation**: https://udos.docs.com
- **Community**: https://community.udos.com
- **Issue Tracker**: https://github.com/fredporter/uDos/issues
- **Support Email**: support@udos.com

## License

uDos is released under the MIT License. See LICENSE file for details.

---

*Last updated: 2026-04-19*
*Version: 1.0.0*