# uDos AI Integration - Production

## Setup

### 1. Install Dependencies

```bash
pip install rapidfuzz scikit-learn joblib numpy scipy
```

### 2. Configure

Edit `config.json` to match your environment.

### 3. Run Tests

```bash
python3 test_deepseek_integration.py
```

### 4. Start Server

```bash
python3 -m udo.cli
```

## Deployment

### 1. Staging

```bash
# Test in staging
python3 test_deepseek_integration.py

# Start server
python3 -m udo.cli
```

### 2. Production

```bash
# Deploy to production
pm2 start udo.cli --name udos-ai

# Monitor
pm2 monit
```

## Configuration

Edit `config.json` to adjust:
- Port
- Log level
- Rate limits
- Cache settings

## Monitoring

Logs are written to:
- `combined.log` (all logs)
- `error.log` (errors only)

## Support

Check the main repository for:
- Full documentation
- Troubleshooting guide
- Issue tracker

---

**Status**: Ready for production
**Next Steps**: Deploy and monitor
