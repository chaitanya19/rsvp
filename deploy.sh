#!/bin/bash

# RSVP Hub AWS EC2 Deployment Script
# Usage: ./deploy.sh [EC2_IP] [KEY_FILE]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if required arguments are provided
if [ $# -lt 2 ]; then
    echo -e "${RED}Usage: $0 <EC2_IP> <KEY_FILE>${NC}"
    echo -e "${YELLOW}Example: $0 18.123.45.67 ~/.ssh/my-key.pem${NC}"
    exit 1
fi

EC2_IP=$1
KEY_FILE=$2
REMOTE_USER="ubuntu"
REMOTE_DIR="/home/ubuntu/rsvp-hub"

echo -e "${GREEN}🚀 Starting RSVP Hub deployment to AWS EC2...${NC}"
echo -e "${YELLOW}EC2 IP: ${EC2_IP}${NC}"
echo -e "${YELLOW}Key file: ${KEY_FILE}${NC}"

# Check if key file exists
if [ ! -f "$KEY_FILE" ]; then
    echo -e "${RED}❌ Key file not found: ${KEY_FILE}${NC}"
    exit 1
fi

# Set proper permissions for key file
chmod 400 "$KEY_FILE"

echo -e "${GREEN}✅ Building React application...${NC}"
cd client && npm run build && cd ..

echo -e "${GREEN}✅ Creating deployment package...${NC}"
# Create a temporary directory for deployment
DEPLOY_DIR="deploy-temp"
rm -rf "$DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR"

# Copy necessary files
cp -r server "$DEPLOY_DIR/"
cp -r client/build "$DEPLOY_DIR/client/"
cp package.json "$DEPLOY_DIR/"
cp package-lock.json "$DEPLOY_DIR/"
cp .env.example "$DEPLOY_DIR/.env" 2>/dev/null || echo "# Production environment variables" > "$DEPLOY_DIR/.env"

# Create production start script
cat > "$DEPLOY_DIR/start.sh" << 'EOF'
#!/bin/bash
export NODE_ENV=production
export PORT=5000
export FRONTEND_URL=http://localhost:3000

echo "🚀 Starting RSVP Hub in production mode..."
cd server
npm install --production
node start.js
EOF

chmod +x "$DEPLOY_DIR/start.sh"

echo -e "${GREEN}✅ Connecting to EC2 instance...${NC}"

# Test connection
ssh -i "$KEY_FILE" -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$REMOTE_USER@$EC2_IP" "echo 'Connection successful'"

echo -e "${GREEN}✅ Installing dependencies on EC2...${NC}"

# Install Node.js and npm if not already installed
ssh -i "$KEY_FILE" "$REMOTE_USER@$EC2_IP" << 'EOF'
    if ! command -v node &> /dev/null; then
        echo "Installing Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
    
    if ! command -v pm2 &> /dev/null; then
        echo "Installing PM2..."
        sudo npm install -g pm2
    fi
    
    echo "Node.js version: $(node --version)"
    echo "npm version: $(npm --version)"
    echo "PM2 version: $(pm2 --version)"
EOF

echo -e "${GREEN}✅ Creating remote directory...${NC}"
ssh -i "$KEY_FILE" "$REMOTE_USER@$EC2_IP" "mkdir -p $REMOTE_DIR"

echo -e "${GREEN}✅ Uploading application files...${NC}"
scp -i "$KEY_FILE" -r "$DEPLOY_DIR"/* "$REMOTE_USER@$EC2_IP:$REMOTE_DIR/"

echo -e "${GREEN}✅ Installing dependencies on EC2...${NC}"
ssh -i "$KEY_FILE" "$REMOTE_USER@$EC2_IP" "cd $REMOTE_DIR && npm install --production"

echo -e "${GREEN}✅ Setting up PM2 process...${NC}"
ssh -i "$KEY_FILE" "$REMOTE_USER@$EC2_IP" << EOF
    cd $REMOTE_DIR
    
    # Stop existing PM2 process if running
    pm2 stop rsvp-hub 2>/dev/null || true
    pm2 delete rsvp-hub 2>/dev/null || true
    
    # Start with PM2
    pm2 start start.sh --name "rsvp-hub" --interpreter bash
    
    # Save PM2 configuration
    pm2 save
    pm2 startup
    
    echo "PM2 status:"
    pm2 status
EOF

echo -e "${GREEN}✅ Cleaning up...${NC}"
rm -rf "$DEPLOY_DIR"

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${YELLOW}Your RSVP Hub is now running on: http://${EC2_IP}:5000${NC}"
echo -e "${YELLOW}To check status: ssh -i ${KEY_FILE} ${REMOTE_USER}@${EC2_IP} && pm2 status${NC}"
echo -e "${YELLOW}To view logs: ssh -i ${KEY_FILE} ${REMOTE_USER}@${EC2_IP} && pm2 logs rsvp-hub${NC}"
