#!/bin/bash

# StartupET VPS Deployment Script
# This script automates the deployment process

set -e

echo "🚀 Starting StartupET VPS Deployment..."

# Configuration
APP_DIR="/var/www/startupet"
APP_NAME="startupet"
NODE_VERSION="18"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    log_error "Please run as root (use sudo)"
    exit 1
fi

# Update system
log_info "Updating system packages..."
apt update && apt upgrade -y

# Install Node.js
log_info "Installing Node.js ${NODE_VERSION}..."
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
apt-get install -y nodejs

# Install PM2
log_info "Installing PM2..."
npm install -g pm2

# Install Nginx
log_info "Installing Nginx..."
apt install nginx -y

# Install PostgreSQL
log_info "Installing PostgreSQL..."
apt install postgresql postgresql-contrib -y

# Install Certbot for SSL
log_info "Installing Certbot..."
apt install certbot python3-certbot-nginx -y

# Create application directory
log_info "Creating application directory..."
mkdir -p $APP_DIR
chown -R $SUDO_USER:$SUDO_USER $APP_DIR

# Clone repository (if not exists)
if [ ! -d "$APP_DIR/.git" ]; then
    log_info "Cloning repository..."
    sudo -u $SUDO_USER git clone https://github.com/Yesunewh/Startup-Des.git $APP_DIR
fi

# Navigate to app directory
cd $APP_DIR

# Install dependencies
log_info "Installing dependencies..."
sudo -u $SUDO_USER npm install

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    log_warn ".env.production not found. Please create it with your production values."
    log_info "Copying .env.example to .env.production..."
    sudo -u $SUDO_USER cp .env.example .env.production
    log_warn "Please edit .env.production with your production configuration"
fi

# Generate Prisma client
log_info "Generating Prisma client..."
sudo -u $SUDO_USER npx prisma generate

# Build application
log_info "Building application..."
sudo -u $SUDO_USER npm run build

# Setup database
log_info "Setting up database..."
read -p "Enter database password: " db_password
read -p "Enter database name (default: startup_et_prod): " db_name
db_name=${db_name:-startup_et_prod}

# Create database and user
sudo -u postgres psql << EOF
CREATE USER startupet_user WITH PASSWORD '$db_password';
CREATE DATABASE $db_name OWNER startupet_user;
GRANT ALL PRIVILEGES ON DATABASE $db_name TO startupet_user;
\q
EOF

# Update DATABASE_URL in .env.production
log_info "Updating database URL in .env.production..."
sudo -u $SUDO_USER sed -i "s|DATABASE_URL=.*|DATABASE_URL=\"postgresql://startupet_user:$db_password@localhost:5432/$db_name\"|" .env.production

# Run database migrations
log_info "Running database migrations..."
sudo -u $SUDO_USER NODE_ENV=production npx prisma db push

# Start application with PM2
log_info "Starting application with PM2..."
sudo -u $SUDO_USER NODE_ENV=production pm2 start npm --name "$APP_NAME" -- start
sudo -u $SUDO_USER pm2 save
sudo -u $SUDO_USER pm2 startup

# Setup Nginx
log_info "Setting up Nginx configuration..."
read -p "Enter your domain name: " domain_name

cat > /etc/nginx/sites-available/$APP_NAME << EOF
server {
    listen 80;
    server_name $domain_name www.$domain_name;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable Nginx site
ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# Setup SSL
log_info "Setting up SSL certificate..."
certbot --nginx -d $domain_name -d www.$domain_name --non-interactive --agree-tos --email admin@$domain_name

# Setup log rotation
log_info "Setting up log rotation..."
cat > /etc/logrotate.d/$APP_NAME << EOF
/var/log/$APP_NAME/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 $SUDO_USER $SUDO_USER
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

# Create monitoring script
log_info "Creating monitoring script..."
cat > /usr/local/bin/monitor-$APP_NAME << EOF
#!/bin/bash
# Monitor script for $APP_NAME

if ! pm2 describe $APP_NAME > /dev/null 2>&1; then
    echo "\$(date): $APP_NAME is not running, restarting..."
    cd $APP_DIR
    sudo -u $SUDO_USER NODE_ENV=production pm2 start npm --name "$APP_NAME" -- start
fi
EOF

chmod +x /usr/local/bin/monitor-$APP_NAME

# Add monitoring to crontab
(crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/monitor-$APP_NAME") | crontab -

log_info "Deployment completed successfully! 🎉"
echo ""
echo "📋 Next Steps:"
echo "1. Edit $APP_DIR/.env.production with your configuration"
echo "2. Restart the application: pm2 restart $APP_NAME"
echo "3. Check logs: pm2 logs $APP_NAME"
echo "4. Visit https://$domain_name"
echo ""
echo "🔧 Useful Commands:"
echo "- View logs: pm2 logs $APP_NAME"
echo "- Restart app: pm2 restart $APP_NAME"
echo "- Stop app: pm2 stop $APP_NAME"
echo "- View status: pm2 status"
echo "- Database access: sudo -u postgres psql"
