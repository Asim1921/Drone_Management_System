# VPS Deployment Guide - DMS (Drone Management System)

This guide will walk you through deploying the DMS application on your VPS at `72.60.211.71`.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [SSH Connection](#ssh-connection)
3. [Initial Server Setup](#initial-server-setup)
4. [Install Required Software](#install-required-software)
5. [Clone and Setup Project](#clone-and-setup-project)
6. [Configure Environment Variables](#configure-environment-variables)
7. [Build and Deploy](#build-and-deploy)
8. [Setup Process Manager (PM2)](#setup-process-manager-pm2)
9. [Configure Nginx Reverse Proxy](#configure-nginx-reverse-proxy)
10. [Setup Firewall](#setup-firewall)
11. [Access Your Application](#access-your-application)
12. [Troubleshooting](#troubleshooting)
13. [Maintenance Commands](#maintenance-commands)

---

## Prerequisites

Before starting, ensure you have:
- SSH access to your VPS (IP: `72.60.211.71`)
- Root or sudo access on the VPS
- Domain name (optional, you can use IP address)
- MongoDB connection string (local or cloud like MongoDB Atlas)

---

## SSH Connection

### Connect to your VPS:

```bash
ssh root@72.60.211.71
# or
ssh username@72.60.211.71
```

Replace `username` with your actual SSH username. You'll be prompted for your password or SSH key.

---

## Initial Server Setup

### 1. Update System Packages

```bash
# For Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# For CentOS/RHEL
sudo yum update -y
```

### 2. Create Application User (Optional but Recommended)

```bash
# Create a new user for running the application
sudo adduser dmsuser
sudo usermod -aG sudo dmsuser

# Switch to the new user
su - dmsuser
```

---

## Install Required Software

### 1. Install Node.js 18+ (Using NodeSource)

```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should show v18.x or higher
npm --version
```

### 2. Install MongoDB

#### Option A: Install MongoDB Locally

```bash
# Import MongoDB public GPG key
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update and install
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify MongoDB is running
sudo systemctl status mongod
```

#### Option B: Use MongoDB Atlas (Cloud - Recommended for Production)

If using MongoDB Atlas, you'll only need the connection string. Skip local MongoDB installation.

### 3. Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

### 4. Install Nginx

```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 5. Install Git

```bash
sudo apt install git -y
```

---

## Clone and Setup Project

### 1. Navigate to Application Directory

```bash
# Create application directory
sudo mkdir -p /var/www
cd /var/www

# Clone the repository
sudo git clone https://github.com/Asim1921/Drone_Management_System.git
# or if using SSH: git clone git@github.com:Asim1921/Drone_Management_System.git

# Change ownership (if created with sudo)
sudo chown -R $USER:$USER /var/www/Drone_Management_System
cd Drone_Management_System
```

### 2. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

## Configure Environment Variables

### 1. Backend Environment Variables

```bash
cd /var/www/Drone_Management_System/backend
nano .env
```

Add the following configuration:

```env
PORT=5050
MONGODB_URI=mongodb://localhost:27017/dms
# OR if using MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dms?retryWrites=true&w=majority

JWT_SECRET=your-very-secure-secret-key-change-this-in-production-min-32-chars
JWT_EXPIRES_IN=7d
NODE_ENV=production

# Email Configuration (for OTP verification)
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-app-specific-password

# Twilio SMS Configuration (for SMS OTP verification)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

**Important:** 
- Replace `your-very-secure-secret-key-change-this-in-production-min-32-chars` with a strong random string (at least 32 characters)
- For Gmail, use an App Password, not your regular password
- Save and exit: `Ctrl+X`, then `Y`, then `Enter`

### 2. Frontend Environment Variables

```bash
cd /var/www/Drone_Management_System/frontend
nano .env.local
```

Add the following configuration:

```env
NEXT_PUBLIC_API_URL=http://72.60.211.71:5050/api
# OR if using domain:
# NEXT_PUBLIC_API_URL=http://yourdomain.com/api

NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

**Note:** Replace `72.60.211.71` with your domain name if you have one configured.

---

## Build and Deploy

### 1. Build Backend

```bash
cd /var/www/Drone_Management_System/backend
npm run build
```

This will compile TypeScript to JavaScript in the `dist` folder.

### 2. Build Frontend

```bash
cd /var/www/Drone_Management_System/frontend
npm run build
```

This will create an optimized production build in the `.next` folder.

### 3. Seed Database (First Time Only)

```bash
cd /var/www/Drone_Management_System/backend
npm run seed
```

This will create initial users, vendors, operators, licenses, and flight records.

**Default Test Credentials:**
- Email: `admin@dms.gov.pk` | Password: `password123`
- Email: `caa.officer@dms.gov.pk` | Password: `password123`
- Email: `operator1@dms.gov.pk` | Password: `password123`
- Email: `vendor1@dms.gov.pk` | Password: `password123`

---

## Setup Process Manager (PM2)

PM2 will keep your Node.js applications running in the background and restart them automatically if they crash.

### 1. Start Backend with PM2

```bash
cd /var/www/Drone_Management_System/backend
pm2 start dist/server.js --name "dms-backend"
```

### 2. Start Frontend with PM2

```bash
cd /var/www/Drone_Management_System/frontend
pm2 start npm --name "dms-frontend" -- start
```

### 3. Save PM2 Configuration

```bash
pm2 save
pm2 startup
```

Follow the instructions provided by `pm2 startup` to enable PM2 on system boot.

### 4. Verify PM2 Status

```bash
pm2 status
pm2 logs
```

You should see both processes running. Press `Ctrl+C` to exit logs.

---

## Configure Nginx Reverse Proxy

Nginx will act as a reverse proxy, forwarding requests to your Node.js applications.

### 1. Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/dms
```

Add the following configuration:

```nginx
# Backend API - Port 5050
server {
    listen 80;
    server_name 72.60.211.71;  # Replace with your domain if you have one

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

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:5050;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Frontend - Port 3050
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

**Important:** Replace `72.60.211.71` with your domain name if you have one.

### 2. Enable the Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/dms /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## Setup Firewall

### 1. Configure UFW (Uncomplicated Firewall)

```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS (if you set up SSL)
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### 2. Configure Firewall for MongoDB (if running locally)

If MongoDB is only accessed locally, you don't need to open port 27017. If you need remote access:

```bash
# Only allow from specific IP (recommended)
sudo ufw allow from YOUR_IP_ADDRESS to any port 27017

# Or allow from anywhere (not recommended for production)
# sudo ufw allow 27017/tcp
```

---

## Access Your Application

### 1. Access via IP Address

Open your browser and navigate to:
```
http://72.60.211.71
```

### 2. Access via Domain (if configured)

If you have a domain pointing to your VPS IP:
```
http://yourdomain.com
```

### 3. Test Backend API

```
http://72.60.211.71/api/health
```

You should see: `{"status":"OK","message":"DMS API is running"}`

---

## Troubleshooting

### Backend Not Starting

1. **Check PM2 logs:**
   ```bash
   pm2 logs dms-backend
   ```

2. **Check if port 5050 is in use:**
   ```bash
   sudo netstat -tulpn | grep 5050
   ```

3. **Verify environment variables:**
   ```bash
   cd /var/www/Drone_Management_System/backend
   cat .env
   ```

4. **Check MongoDB connection:**
   ```bash
   sudo systemctl status mongod
   # Test connection
   mongosh
   ```

### Frontend Not Starting

1. **Check PM2 logs:**
   ```bash
   pm2 logs dms-frontend
   ```

2. **Check if port 3050 is in use:**
   ```bash
   sudo netstat -tulpn | grep 3050
   ```

3. **Verify environment variables:**
   ```bash
   cd /var/www/Drone_Management_System/frontend
   cat .env.local
   ```

### Nginx Issues

1. **Check Nginx error logs:**
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

2. **Test Nginx configuration:**
   ```bash
   sudo nginx -t
   ```

3. **Restart Nginx:**
   ```bash
   sudo systemctl restart nginx
   ```

### Database Connection Issues

1. **Check MongoDB status:**
   ```bash
   sudo systemctl status mongod
   ```

2. **Check MongoDB logs:**
   ```bash
   sudo tail -f /var/log/mongodb/mongod.log
   ```

3. **Verify connection string in .env file**

### Port Already in Use

If a port is already in use:

```bash
# Find process using the port
sudo lsof -i :5050
sudo lsof -i :3050

# Kill the process (replace PID with actual process ID)
sudo kill -9 PID
```

---

## Maintenance Commands

### PM2 Commands

```bash
# View all processes
pm2 list

# View logs
pm2 logs
pm2 logs dms-backend
pm2 logs dms-frontend

# Restart applications
pm2 restart dms-backend
pm2 restart dms-frontend
pm2 restart all

# Stop applications
pm2 stop dms-backend
pm2 stop dms-frontend

# Delete from PM2
pm2 delete dms-backend
pm2 delete dms-frontend

# Monitor resources
pm2 monit
```

### Update Application

```bash
cd /var/www/Drone_Management_System

# Pull latest changes
git pull origin main

# Rebuild backend
cd backend
npm install
npm run build
pm2 restart dms-backend

# Rebuild frontend
cd ../frontend
npm install
npm run build
pm2 restart dms-frontend
```

### View Application Logs

```bash
# PM2 logs
pm2 logs

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log
```

### System Resources

```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check CPU usage
top
# or
htop  # if installed
```

---

## Optional: Setup SSL/HTTPS with Let's Encrypt

For production, it's highly recommended to use HTTPS.

### 1. Install Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 2. Obtain SSL Certificate

```bash
sudo certbot --nginx -d yourdomain.com
```

Replace `yourdomain.com` with your actual domain name.

### 3. Auto-renewal

Certbot automatically sets up auto-renewal. Test it:

```bash
sudo certbot renew --dry-run
```

---

## Security Recommendations

1. **Change default passwords** - Update all default user passwords after first login
2. **Use strong JWT secret** - Generate a secure random string for JWT_SECRET
3. **Keep system updated** - Regularly run `sudo apt update && sudo apt upgrade`
4. **Use firewall** - Only open necessary ports
5. **Use MongoDB authentication** - Enable authentication for MongoDB
6. **Regular backups** - Set up automated backups for MongoDB
7. **Monitor logs** - Regularly check application and system logs
8. **Use environment variables** - Never commit `.env` files to version control

---

## Backup and Restore

### Backup MongoDB

```bash
# Create backup
mongodump --out /backup/mongodb/$(date +%Y%m%d)

# Restore from backup
mongorestore /backup/mongodb/20240101
```

### Backup Application Files

```bash
# Backup entire application
tar -czf /backup/dms-$(date +%Y%m%d).tar.gz /var/www/Drone_Management_System
```

---

## Support

If you encounter any issues:

1. Check the logs first (PM2, Nginx, MongoDB)
2. Verify all environment variables are set correctly
3. Ensure all services are running
4. Check firewall rules
5. Review this troubleshooting section

---

## Quick Reference

**Application URLs:**
- Frontend: `http://72.60.211.71`
- Backend API: `http://72.60.211.71/api`
- Health Check: `http://72.60.211.71/api/health`

**Important Directories:**
- Application: `/var/www/Drone_Management_System`
- Backend: `/var/www/Drone_Management_System/backend`
- Frontend: `/var/www/Drone_Management_System/frontend`
- Nginx Config: `/etc/nginx/sites-available/dms`
- Logs: PM2 logs via `pm2 logs`

**Default Ports:**
- Frontend: `3050`
- Backend: `5050`
- MongoDB: `27017` (local only)

---

**Deployment completed successfully!** 🚀

Your DMS application should now be accessible at `http://72.60.211.71`

