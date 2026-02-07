# 🚀 Production Deployment Guide

This guide covers deploying the Raktadan Blood Donation Platform to production environments.

## 📋 Prerequisites

- Node.js 18+
- MySQL 8.0+
- Redis (optional, for caching)
- Domain name with SSL certificate
- Cloud hosting account (AWS, DigitalOcean, Vercel, etc.)

## 🔧 Environment Setup

### 1. Server Preparation

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MySQL
sudo apt install mysql-server -y
sudo mysql_secure_installation

# Install Redis (optional)
sudo apt install redis-server -y

# Install Nginx
sudo apt install nginx -y

# Install PM2 for process management
sudo npm install -g pm2
```

### 2. Database Setup

```sql
-- Create database and user
CREATE DATABASE raktadan CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'raktadan'@'localhost' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON raktadan.* TO 'raktadan'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Application Setup

```bash
# Clone repository
git clone <your-repository-url>
cd raktadan-backend

# Install dependencies
npm install --production

# Copy environment file
cp .env.example .env

# Edit environment variables
nano .env
```

### 4. Environment Configuration

Edit `.env` file with production values:

```env
# Database
DATABASE_URL="mysql://raktadan:strong_password@localhost:3306/raktadan"

# JWT (generate a strong secret)
JWT_SECRET="your-super-strong-secret-key-change-this"
JWT_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV="production"

# Email (configure SMTP)
SMTP_HOST="smtp.your-domain.com"
SMTP_PORT=587
SMTP_USER="noreply@your-domain.com"
SMTP_PASS="your-email-password"

# CORS (your domain)
CORS_ORIGIN="https://your-domain.com"

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL="warn"
LOG_FILE="/var/log/raktadan/app.log"
```

### 5. Database Migration

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed sample data (optional)
npm run seed:all
```

### 6. PM2 Configuration

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'raktadan-api',
    script: 'src/app.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/raktadan/error.log',
    out_file: '/var/log/raktadan/out.log',
    log_file: '/var/log/raktadan/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max_old_space_size=1024'
  }]
};
```

### 7. Start Application

```bash
# Create log directory
sudo mkdir -p /var/log/raktadan
sudo chown $USER:$USER /var/log/raktadan

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp /home/$USER
```

## 🌐 Nginx Configuration

Create `/etc/nginx/sites-available/raktadan`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    location /api/health {
        proxy_pass http://localhost:3000/api/health;
        access_log off;
    }

    # Serve static files directly
    location /public/ {
        alias /path/to/raktadan-backend/public/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/raktadan /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔒 SSL Certificate Setup

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Set up auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔥 Firewall Configuration

```bash
# Configure UFW firewall
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## 📊 Monitoring Setup

### PM2 Monitoring

```bash
# Monitor application
pm2 monit

# View logs
pm2 logs

# View metrics
pm2 show raktadan-api
```

### Log Rotation

Create `/etc/logrotate.d/raktadan`:

```
/var/log/raktadan/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
    postrotate
        pm2 reloadLogs
    endscript
}
```

## 🚀 Docker Deployment (Alternative)

### Using Docker Compose

```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f app

# Scale application
docker-compose up -d --scale app=3
```

### Production Dockerfile

```bash
# Build image
docker build -t raktadan-backend .

# Run container
docker run -d \
  --name raktadan-api \
  -p 3000:3000 \
  --env-file .env \
  --restart unless-stopped \
  raktadan-backend
```

## 📱 CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci --production
      
    - name: Run tests
      run: npm test
      
    - name: Build application
      run: npm run build
      
    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /path/to/app
          git pull origin main
          npm ci --production
          npx prisma migrate deploy
          pm2 reload raktadan-api
```

## 🔍 Health Checks

### Application Health

```bash
# Check application status
curl https://your-domain.com/api/health

# Expected response
{"status":"healthy","timestamp":"2026-02-07T12:00:00.000Z","uptime":"2 days, 3 hours"}
```

### Database Health

```bash
# Check MySQL status
sudo systemctl status mysql

# Check Redis status
sudo systemctl status redis
```

### Service Health

```bash
# Check PM2 status
pm2 status

# Check Nginx status
sudo systemctl status nginx
```

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   ```bash
   # Check MySQL status
   sudo systemctl status mysql
   
   # Check connection string
   mysql -u raktadan -p raktadan
   ```

2. **Memory Issues**
   ```bash
   # Check memory usage
   free -h
   
   # Restart PM2 processes
   pm2 restart raktadan-api
   ```

3. **SSL Certificate Issues**
   ```bash
   # Check certificate status
   sudo certbot certificates
   
   # Renew certificate
   sudo certbot renew
   ```

### Log Analysis

```bash
# Application logs
pm2 logs raktadan-api --lines 100

# Nginx logs
sudo tail -f /var/log/nginx/error.log

# System logs
sudo journalctl -u nginx -f
```

## 📈 Performance Optimization

### Database Optimization

```sql
-- Add indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_blood_requests_status ON blood_requests(status);
CREATE INDEX idx_donors_blood_group ON donors(blood_group);
```

### Application Optimization

```javascript
// Enable compression in app.js
const compression = require('compression');
app.use(compression());

// Set up caching
app.use('/public', express.static('public', {
  maxAge: '1y',
  etag: true
}));
```

## 🔄 Backup Strategy

### Database Backup

```bash
# Create backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u raktadan -p raktadan > /backups/raktadan_$DATE.sql
find /backups -name "*.sql" -mtime +7 -delete
```

### Application Backup

```bash
# Backup application files
tar -czf /backups/app_$(date +%Y%m%d).tar.gz /path/to/raktadan-backend
```

## 📞 Support

For deployment support:
- 📧 Email: support@raktadan.com
- 📖 Documentation: [Wiki](https://github.com/your-username/raktadan-backend/wiki)
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/raktadan-backend/issues)

---

**🎉 Your Raktadan Blood Donation Platform is now production-ready!**
