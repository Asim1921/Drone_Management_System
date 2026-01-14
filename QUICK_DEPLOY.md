# Quick Deployment Guide - Step by Step

## Step 1: SSH into Your Server

In your terminal, run:
```bash
ssh root@72.60.211.71
```
When prompted, enter password: `Akinator786`

---

## Step 2: Run the Deployment Script

Once connected, run these commands one by one:

### 2.1 Update System
```bash
apt update && apt upgrade -y
```

### 2.2 Install Node.js 18
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs
node --version  # Verify installation
```

### 2.3 Install PM2
```bash
npm install -g pm2
```

### 2.4 Install Nginx
```bash
apt install nginx -y
systemctl start nginx
systemctl enable nginx
```

### 2.5 Install Git (if not installed)
```bash
apt install git -y
```

### 2.6 Clone Repository
```bash
mkdir -p /var/www
cd /var/www
git clone https://github.com/Asim1921/Drone_Management_System.git
cd Drone_Management_System
```

### 2.7 Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2.8 Create Backend .env File
```bash
cd /var/www/Drone_Management_System/backend
nano .env
```

Paste this content (press `Ctrl+X`, then `Y`, then `Enter` to save):
```env
PORT=5050
MONGODB_URI=mongodb://localhost:27017/dms
JWT_SECRET=Akinator786SecretKeyChangeThisInProduction2024!
JWT_EXPIRES_IN=7d
NODE_ENV=production

# Email Configuration
EMAIL_USER=zahmedasim@gmail.com
EMAIL_APP_PASSWORD=ivfglysvxpgapurr

# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=your_twilio_phone_number_here
```

### 2.9 Create Frontend .env.local File
```bash
cd /var/www/Drone_Management_System/frontend
nano .env.local
```

Paste this content:
```env
NEXT_PUBLIC_API_URL=http://72.60.211.71:5050/api
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 2.10 Build Applications
```bash
# Build backend
cd /var/www/Drone_Management_System/backend
npm run build

# Build frontend
cd /var/www/Drone_Management_System/frontend
npm run build
```

### 2.11 Start with PM2
```bash
# Start backend
cd /var/www/Drone_Management_System/backend
pm2 start dist/server.js --name "dms-backend"

# Start frontend
cd /var/www/Drone_Management_System/frontend
pm2 start npm --name "dms-frontend" -- start

# Save PM2 configuration
pm2 save
pm2 startup
# Copy and run the command that PM2 provides
```

### 2.12 Configure Nginx
```bash
nano /etc/nginx/sites-available/dms
```

Paste this configuration:
```nginx
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
```

Enable the site:
```bash
ln -s /etc/nginx/sites-available/dms /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

### 2.13 Setup Firewall
```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
```

### 2.14 Seed Database (Optional - First Time Only)
```bash
cd /var/www/Drone_Management_System/backend
npm run seed
```

---

## Step 3: Verify Deployment

### Check PM2 Status
```bash
pm2 status
pm2 logs
```

### Test URLs
Open in your browser:
- Frontend: http://72.60.211.71
- Backend API: http://72.60.211.71/api/health

---

## Troubleshooting

### If backend doesn't start:
```bash
pm2 logs dms-backend
cd /var/www/Drone_Management_System/backend
cat .env  # Check environment variables
```

### If frontend doesn't start:
```bash
pm2 logs dms-frontend
cd /var/www/Drone_Management_System/frontend
cat .env.local  # Check environment variables
```

### Restart services:
```bash
pm2 restart all
```

### Check Nginx:
```bash
systemctl status nginx
nginx -t
tail -f /var/log/nginx/error.log
```

---

## Default Login Credentials (After Seeding)

- Email: `admin@dms.gov.pk` | Password: `password123`
- Email: `caa.officer@dms.gov.pk` | Password: `password123`
- Email: `operator1@dms.gov.pk` | Password: `password123`

