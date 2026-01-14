#!/bin/bash
set -e

echo "=========================================="
echo "DMS Deployment Script"
echo "=========================================="

# Update system
echo "Updating system packages..."
apt update && apt upgrade -y

# Install Node.js 18
if ! command -v node &> /dev/null; then
    echo "Installing Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
else
    echo "Node.js already installed: $(node --version)"
fi

# Install PM2
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    npm install -g pm2
else
    echo "PM2 already installed"
fi

# Install Nginx
if ! command -v nginx &> /dev/null; then
    echo "Installing Nginx..."
    apt install nginx -y
    systemctl start nginx
    systemctl enable nginx
else
    echo "Nginx already installed"
fi

# Install Git
if ! command -v git &> /dev/null; then
    apt install git -y
fi

# Setup application
APP_DIR="/var/www/Drone_Management_System"
mkdir -p /var/www
cd /var/www

if [ -d "$APP_DIR" ]; then
    echo "Repository exists, pulling latest changes..."
    cd "$APP_DIR"
    git pull origin main
else
    echo "Cloning repository..."
    git clone https://github.com/Asim1921/Drone_Management_System.git
    cd "$APP_DIR"
fi

# Install dependencies
echo "Installing backend dependencies..."
cd "$APP_DIR/backend"
npm install

echo "Installing frontend dependencies..."
cd "$APP_DIR/frontend"
npm install

# Create .env files if they don't exist
if [ ! -f "$APP_DIR/backend/.env" ]; then
    echo "Creating backend .env file..."
    cat > "$APP_DIR/backend/.env" << 'EOF'
PORT=5050
MONGODB_URI=mongodb://localhost:27017/dms
JWT_SECRET=Akinator786SecretKeyChangeThisInProduction2024!
JWT_EXPIRES_IN=7d
NODE_ENV=production
EMAIL_USER=zahmedasim@gmail.com
EMAIL_APP_PASSWORD=ivfglysvxpgapurr
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=your_twilio_phone_number_here
EOF
fi

if [ ! -f "$APP_DIR/frontend/.env.local" ]; then
    echo "Creating frontend .env.local file..."
    cat > "$APP_DIR/frontend/.env.local" << 'EOF'
NEXT_PUBLIC_API_URL=http://72.60.211.71:5050/api
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
EOF
fi

# Build applications
echo "Building backend..."
cd "$APP_DIR/backend"
npm run build

echo "Building frontend..."
cd "$APP_DIR/frontend"
npm run build

# Stop existing PM2 processes
pm2 stop dms-backend 2>/dev/null || true
pm2 stop dms-frontend 2>/dev/null || true
pm2 delete dms-backend 2>/dev/null || true
pm2 delete dms-frontend 2>/dev/null || true

# Start with PM2
echo "Starting backend with PM2..."
cd "$APP_DIR/backend"
pm2 start dist/server.js --name "dms-backend"

echo "Starting frontend with PM2..."
cd "$APP_DIR/frontend"
pm2 start npm --name "dms-frontend" -- start

pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null || true

# Configure Nginx
echo "Configuring Nginx..."
cat > /etc/nginx/sites-available/dms << 'NGINX_EOF'
server {
    listen 80;
    server_name 72.60.211.71;
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
    location /health {
        proxy_pass http://localhost:5050;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
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
NGINX_EOF

ln -sf /etc/nginx/sites-available/dms /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# Setup firewall
echo "Configuring firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo "=========================================="
echo "Deployment completed successfully!"
echo "=========================================="
echo ""
echo "Application URLs:"
echo "  Frontend: http://72.60.211.71"
echo "  Backend API: http://72.60.211.71/api"
echo "  Health Check: http://72.60.211.71/api/health"
echo ""
echo "PM2 Commands:"
echo "  View status: pm2 status"
echo "  View logs: pm2 logs"
echo "  Restart: pm2 restart all"


