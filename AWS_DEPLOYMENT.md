# 🚀 AWS EC2 Deployment Guide for RSVP Hub

## Prerequisites

- ✅ AWS EC2 instance running Ubuntu
- ✅ EC2 instance accessible via SSH
- ✅ EC2 key pair file (.pem)
- ✅ Security group configured to allow HTTP (port 80) and HTTPS (port 443)
- ✅ EC2 instance has internet access

## 🔧 Step-by-Step Deployment

### 1. Prepare Your Local Environment

```bash
# Make sure you're in the project root
cd "rsvp site"

# Build the React application
cd client && npm run build && cd ..

# Make deployment script executable
chmod +x deploy.sh
```

### 2. Deploy to EC2

```bash
# Run the deployment script
./deploy.sh <EC2_PUBLIC_IP> <PATH_TO_KEY_FILE>

# Example:
./deploy.sh 18.123.45.67 ~/.ssh/my-key.pem
```

### 3. What the Deployment Script Does

- ✅ **Builds React app** for production
- ✅ **Installs Node.js 18.x** on EC2 (if not present)
- ✅ **Installs PM2** for process management
- ✅ **Uploads application files** to EC2
- ✅ **Installs dependencies** on EC2
- ✅ **Starts application** with PM2
- ✅ **Configures auto-restart** on server reboot

### 4. Post-Deployment Verification

```bash
# SSH into your EC2 instance
ssh -i <KEY_FILE> ubuntu@<EC2_IP>

# Check PM2 status
pm2 status

# View application logs
pm2 logs rsvp-hub

# Check if app is running
curl http://localhost:5000/api/health
```

### 5. Access Your Application

- **Local EC2**: `http://localhost:5000`
- **Public**: `http://<EC2_PUBLIC_IP>:5000`

## 🔒 Security Configuration

### Update Security Group
1. Go to AWS Console → EC2 → Security Groups
2. Select your EC2 instance's security group
3. Add inbound rule:
   - **Type**: Custom TCP
   - **Port**: 5000
   - **Source**: 0.0.0.0/0 (or restrict to your IP)

### Environment Variables
Create `.env` file on EC2 with production values:

```bash
# SSH into EC2 and create .env file
ssh -i <KEY_FILE> ubuntu@<EC2_IP>

# Edit environment file
nano /home/ubuntu/rsvp-hub/.env
```

```env
NODE_ENV=production
PORT=5000
JWT_SECRET=your-very-secure-jwt-secret-key
FRONTEND_URL=http://<EC2_PUBLIC_IP>:5000
```

## 🚀 Production Optimizations

### 1. Use Nginx as Reverse Proxy (Recommended)

```bash
# Install Nginx
sudo apt update
sudo apt install nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/rsvp-hub
```

```nginx
server {
    listen 80;
    server_name your-domain.com;  # or EC2 public IP

    location / {
        proxy_pass http://localhost:5000;
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

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/rsvp-hub /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Update security group to allow HTTP (port 80)
```

### 2. SSL Certificate with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 Monitoring and Maintenance

### PM2 Commands
```bash
# View status
pm2 status

# View logs
pm2 logs rsvp-hub

# Restart application
pm2 restart rsvp-hub

# Stop application
pm2 stop rsvp-hub

# Start application
pm2 start rsvp-hub

# Monitor resources
pm2 monit
```

### Application Updates
```bash
# Pull latest code
git pull origin main

# Rebuild and redeploy
./deploy.sh <EC2_IP> <KEY_FILE>
```

## 🚨 Troubleshooting

### Common Issues

1. **Port 5000 not accessible**
   - Check security group inbound rules
   - Verify PM2 is running: `pm2 status`

2. **Application not starting**
   - Check logs: `pm2 logs rsvp-hub`
   - Verify environment variables
   - Check Node.js version: `node --version`

3. **Database errors**
   - Verify database file permissions
   - Check if `rsvp-data` directory exists

4. **Git integration issues**
   - Verify Git is installed: `git --version`
   - Check directory permissions

### Log Locations
- **PM2 logs**: `pm2 logs rsvp-hub`
- **Nginx logs**: `/var/log/nginx/`
- **System logs**: `journalctl -u nginx`

## 🎯 Next Steps

1. **Domain Setup**: Point your domain to EC2 public IP
2. **SSL Certificate**: Install Let's Encrypt certificate
3. **Monitoring**: Set up CloudWatch or similar monitoring
4. **Backup**: Configure automated backups for database and files
5. **Scaling**: Consider using AWS Load Balancer for multiple instances

## 📞 Support

If you encounter issues:
1. Check PM2 logs: `pm2 logs rsvp-hub`
2. Verify security group settings
3. Check EC2 instance status in AWS Console
4. Review this deployment guide

---

**Happy Deploying! 🚀**
