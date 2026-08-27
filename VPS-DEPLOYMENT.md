# StartupET VPS Deployment Guide

## Quick Start

### Prerequisites
- Ubuntu 20.04/22.04 LTS VPS (2GB RAM minimum)
- Domain name pointed to your VPS IP
- SSH access to your VPS

### One-Click Deployment
```bash
# Download and run the deployment script
wget https://raw.githubusercontent.com/Yesunewh/Startup-Des/main/deploy-vps.sh
chmod +x deploy-vps.sh
sudo ./deploy-vps.sh
```

## Manual Deployment Steps

### 1. Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y
```

### 2. Database Setup
```bash
# Create database user and database
sudo -u postgres psql
CREATE USER startupet_user WITH PASSWORD 'your_secure_password';
CREATE DATABASE startup_et_prod OWNER startupet_user;
GRANT ALL PRIVILEGES ON DATABASE startup_et_prod TO startupet_user;
\q
```

### 3. Application Deployment
```bash
# Clone repository
git clone https://github.com/Yesunewh/Startup-Des.git /var/www/startupet
cd /var/www/startupet

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Set up environment variables
cp .env.example .env.production
# Edit .env.production with your values
```

### 4. Environment Configuration
Create `.env.production`:
```env
NODE_ENV=production
DATABASE_URL="postgresql://startupet_user:your_secure_password@localhost:5432/startup_et_prod"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your_32_character_secret"
```

### 5. Build and Deploy
```bash
# Build application
npm run build

# Start with PM2
NODE_ENV=production pm2 start npm --name "startupet" -- start
pm2 save
pm2 startup
```

### 6. Nginx Configuration
Create `/etc/nginx/sites-available/startupet`:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
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
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/startupet /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 7. SSL Certificate
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 8. Database Migration
```bash
# Run migrations
NODE_ENV=production npx prisma db push

# Seed database (optional)
NODE_ENV=production npm run db:seed
```

## Production Environment Variables

### Required Variables
```env
NODE_ENV=production
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your_32_character_secret"
```

### Optional Variables
```env
# Email configuration (for notifications)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"

# File upload configuration
UPLOAD_DIR="/var/www/startupet/uploads"
MAX_FILE_SIZE=10485760

# Redis (for session storage, if using)
REDIS_URL="redis://localhost:6379"
```

## Monitoring and Maintenance

### PM2 Commands
```bash
# View application status
pm2 status

# View logs
pm2 logs startupet

# Restart application
pm2 restart startupet

# Stop application
pm2 stop startupet

# Monitor resources
pm2 monit
```

### Database Management
```bash
# Access database
sudo -u postgres psql -d startup_et_prod

# Backup database
pg_dump -U startupet_user startup_et_prod > backup.sql

# Restore database
psql -U startupet_user startup_et_prod < backup.sql

# Run migrations
NODE_ENV=production npx prisma db push
```

### Log Management
```bash
# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Rotate logs (setup in deployment script)
sudo logrotate -f /etc/logrotate.d/startupet
```

## Security Considerations

### Firewall Setup
```bash
# Enable UFW firewall
sudo ufw enable

# Allow SSH, HTTP, HTTPS
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'

# Allow PostgreSQL (only if needed locally)
sudo ufw allow from 127.0.0.1 to any port 5432
```

### Database Security
- Use strong database passwords
- Restrict database access to localhost
- Regular database backups
- Monitor database connections

### Application Security
- Keep dependencies updated
- Use HTTPS (SSL certificate)
- Implement rate limiting
- Regular security audits

## Troubleshooting

### Common Issues

1. **Application won't start**
   ```bash
   # Check logs
   pm2 logs startupet
   
   # Check environment variables
   cat .env.production
   
   # Verify database connection
   npx prisma db pull
   ```

2. **Database connection failed**
   ```bash
   # Test database connection
   psql -U startupet_user -d startup_et_prod -h localhost
   
   # Check PostgreSQL status
   sudo systemctl status postgresql
   ```

3. **Nginx configuration error**
   ```bash
   # Test Nginx configuration
   sudo nginx -t
   
   # Check Nginx logs
   sudo tail -f /var/log/nginx/error.log
   ```

4. **SSL certificate issues**
   ```bash
   # Check certificate status
   sudo certbot certificates
   
   # Renew certificate
   sudo certbot renew
   ```

## Performance Optimization

### Application Optimization
- Enable Next.js production optimizations
- Implement caching strategies
- Use CDN for static assets
- Optimize database queries

### Server Optimization
- Configure swap space
- Optimize PostgreSQL settings
- Enable gzip compression in Nginx
- Monitor server resources

## Backup Strategy

### Automated Backups
```bash
# Create backup script
cat > /usr/local/bin/backup-startupet << EOF
#!/bin/bash
DATE=\$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/startupet"

# Create backup directory
mkdir -p \$BACKUP_DIR

# Backup database
pg_dump -U startupet_user startup_et_prod > \$BACKUP_DIR/db_\$DATE.sql

# Backup application files
tar -czf \$BACKUP_DIR/app_\$DATE.tar.gz /var/www/startupet

# Remove old backups (keep last 7 days)
find \$BACKUP_DIR -name "*.sql" -mtime +7 -delete
find \$BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
EOF

chmod +x /usr/local/bin/backup-startupet

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-startupet") | crontab -
```

## Scaling Considerations

### When to Scale
- High CPU usage (>80% consistently)
- Memory usage approaching limit
- Database performance issues
- Increasing traffic patterns

### Scaling Options
1. **Vertical Scaling**: Increase VPS resources
2. **Horizontal Scaling**: Load balancer + multiple instances
3. **Database Scaling**: Read replicas, sharding
4. **CDN**: Static asset distribution

## Support

For deployment issues:
1. Check application logs: `pm2 logs startupet`
2. Verify environment configuration
3. Test database connectivity
4. Check system resources: `htop`, `df -h`

## Deployment Checklist

- [ ] VPS server ready with Ubuntu LTS
- [ ] Domain name pointed to VPS IP
- [ ] SSL certificate configured
- [ ] Database created and configured
- [ ] Environment variables set
- [ ] Application built and tested
- [ ] Nginx configured and running
- [ ] PM2 process management setup
- [ ] Backup strategy implemented
- [ ] Monitoring and logging configured
- [ ] Security measures in place
