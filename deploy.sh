#!/bin/bash

# DMS Deployment Script for VPS
# Run this script on your VPS server

set -e  # Exit on error

echo "=========================================="
echo "DMS Deployment Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root${NC}"
    exit 1
fi

# Update system
echo -e "${YELLOW}Updating system packages...${NC}"
apt update && apt upgrade -y

# Install Node.js 18 if not installed
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Installing Node.js 18...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
else
    echo -e "${GREEN}Node.js already installed: $(node --version)${NC}"
fi

# Install PM2 if not installed
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}Installing PM2...${NC}"
    npm install -g pm2
else
    echo -e "${GREEN}PM2 already installed${NC}"
fi

# Install Nginx if not installed
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}Installing Nginx...${NC}"
    apt install nginx -y
    systemctl start nginx
    systemctl enable nginx
else
    echo -e "${GREEN}Nginx already installed${NC}"
fi

# Install Git if not installed
if ! command -v git &> /dev/null; then
    echo -e "${YELLOW}Installing Git...${NC}"
    apt install git -y
else
    echo -e "${GREEN}Git already installed${NC}"
fi

# Create application directory
APP_DIR="/var/www/Drone_Management_System"
echo -e "${YELLOW}Setting up application directory...${NC}"
mkdir -p /var/www
cd /var/www

# Clone or update repository
if [ -d "$APP_DIR" ]; then
    echo -e "${YELLOW}Repository exists, pulling latest changes...${NC}"
    cd "$APP_DIR"
    git pull origin main
else
    echo -e "${YELLOW}Cloning repository...${NC}"
    git clone https://github.com/Asim1921/Drone_Management_System.git
    cd "$APP_DIR"
fi

# Install backend dependencies
echo -e "${YELLOW}Installing backend dependencies...${NC}"
cd "$APP_DIR/backend"
npm install

# Install frontend dependencies
echo -e "${YELLOW}Installing frontend dependencies...${NC}"
cd "$APP_DIR/frontend"
npm install

# Check if .env files exist
echo -e "${YELLOW}Checking environment files...${NC}"
if [ ! -f "$APP_DIR/backend/.env" ]; then
    echo -e "${RED}Backend .env file not found!${NC}"
    echo -e "${YELLOW}Creating backend .env file...${NC}"
    cat > "$APP_DIR/backend/.env" << EOF
PORT=5050
MONGODB_URI=mongodb://localhost:27017/dms
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRES_IN=7d
NODE_ENV=production

# Email Configuration
EMAIL_USER=zahmedasim@gmail.com
EMAIL_APP_PASSWORD=ivfglysvxpgapurr

# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=your_twilio_phone_number_here
EOF
    echo -e "${GREEN}Backend .env created. Please update with your actual values!${NC}"
fi

if [ ! -f "$APP_DIR/frontend/.env.local" ]; then
    echo -e "${RED}Frontend .env.local file not found!${NC}"
    echo -e "${YELLOW}Creating frontend .env.local file...${NC}"
    cat > "$APP_DIR/frontend/.env.local" << EOF
NEXT_PUBLIC_API_URL=http://72.60.211.71:5050/api
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
EOF
    echo -e "${GREEN}Frontend .env.local created. Please update with your actual values!${NC}"
fi

# Build backend
echo -e "${YELLOW}Building backend...${NC}"
cd "$APP_DIR/backend"
npm run build

# Build frontend
echo -e "${YELLOW}Building frontend...${NC}"
cd "$APP_DIR/frontend"
npm run build

# Stop existing PM2 processes if running
echo -e "${YELLOW}Stopping existing PM2 processes...${NC}"
pm2 stop dms-backend 2>/dev/null || true
pm2 stop dms-frontend 2>/dev/null || true
pm2 delete dms-backend 2>/dev/null || true
pm2 delete dms-frontend 2>/dev/null || true

# Start backend with PM2
echo -e "${YELLOW}Starting backend with PM2...${NC}"
cd "$APP_DIR/backend"
pm2 start dist/server.js --name "dms-backend"

# Start frontend with PM2
echo -e "${YELLOW}Starting frontend with PM2...${NC}"
cd "$APP_DIR/frontend"
pm2 start npm --name "dms-frontend" -- start

# Save PM2 configuration
pm2 save
pm2 startup systemd -u root --hp /root

# Configure Nginx
echo -e "${YELLOW}Configuring Nginx...${NC}"
cat > /etc/nginx/sites-available/dms << 'NGINX_CONFIG'
server {
    listen 80;
    server_name 72.60.211.71;

    # Backend API
    location /api {
        proxy_pass http://localhost:5050;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:5050;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Frontend
    location / {
        proxy_pass http://localhost:3050;
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
NGINX_CONFIG

# Enable site
ln -sf /etc/nginx/sites-available/dms /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and reload Nginx
nginx -t && systemctl reload nginx

# Setup firewall
echo -e "${YELLOW}Configuring firewall...${NC}"
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo -e "${GREEN}=========================================="
echo -e "Deployment completed successfully!${NC}"
echo -e "${GREEN}=========================================="
echo ""
echo -e "Application URLs:"
echo -e "  Frontend: ${GREEN}http://72.60.211.71${NC}"
echo -e "  Backend API: ${GREEN}http://72.60.211.71/api${NC}"
echo -e "  Health Check: ${GREEN}http://72.60.211.71/api/health${NC}"
echo ""
echo -e "PM2 Commands:"
echo -e "  View status: ${YELLOW}pm2 status${NC}"
echo -e "  View logs: ${YELLOW}pm2 logs${NC}"
echo -e "  Restart: ${YELLOW}pm2 restart all${NC}"
echo ""
echo -e "${YELLOW}Note: Make sure to update .env files with your actual configuration!${NC}"

