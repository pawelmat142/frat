#!/bin/bash

# =====================================================
# JobHigh SSL Setup Script
# Run this script on VPS to set up SSL certificates
# =====================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  JobHigh SSL Setup Script${NC}"
echo -e "${GREEN}========================================${NC}"

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Please run this script with sudo${NC}"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${RED}.env file not found!${NC}"
    exit 1
fi

# Source .env file
export $(cat .env | grep -v '^#' | xargs)

# Check if DOMAIN_NAME is set
if [ -z "$DOMAIN_NAME" ]; then
    echo -e "${YELLOW}DOMAIN_NAME not found in .env${NC}"
    read -p "Enter your domain name (e.g., jobhigh.pl): " DOMAIN_NAME
    echo "DOMAIN_NAME=$DOMAIN_NAME" >> .env
fi

echo -e "${GREEN}Domain: $DOMAIN_NAME${NC}"

# Get email for Let's Encrypt
read -p "Enter your email for Let's Encrypt notifications: " EMAIL

# Create necessary directories
echo -e "${YELLOW}Creating directories...${NC}"
mkdir -p /var/www/certbot
mkdir -p /etc/letsencrypt

# Install certbot if not present
if ! command -v certbot &> /dev/null; then
    echo -e "${YELLOW}Installing certbot...${NC}"
    apt update
    apt install certbot -y
fi

# Open firewall ports
echo -e "${YELLOW}Opening firewall ports 80 and 443...${NC}"
ufw allow 80 || true
ufw allow 443 || true

# Stop existing containers
echo -e "${YELLOW}Stopping existing containers...${NC}"
docker-compose down || true
docker-compose -f docker-compose.ssl.yml down || true

# Generate certificate using standalone mode
echo -e "${YELLOW}Generating SSL certificate...${NC}"
certbot certonly \
    --standalone \
    -d $DOMAIN_NAME \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    --non-interactive

# Check if certificate was created
if [ ! -f "/etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem" ]; then
    echo -e "${RED}Certificate generation failed!${NC}"
    exit 1
fi

echo -e "${GREEN}Certificate generated successfully!${NC}"

# Build and start containers with SSL
echo -e "${YELLOW}Building and starting containers with SSL...${NC}"
docker-compose -f docker-compose.ssl.yml build --no-cache frontend
docker-compose -f docker-compose.ssl.yml up -d

# Wait for containers to start
echo -e "${YELLOW}Waiting for containers to start...${NC}"
sleep 10

# Check if containers are running
echo -e "${YELLOW}Checking container status...${NC}"
docker ps

# Test HTTPS
echo -e "${YELLOW}Testing HTTPS...${NC}"
curl -I https://$DOMAIN_NAME || echo -e "${RED}HTTPS test failed${NC}"

# Set up auto-renewal cron job
echo -e "${YELLOW}Setting up certificate auto-renewal...${NC}"
CRON_JOB="0 0 1 * * certbot renew --pre-hook 'docker-compose -f $(pwd)/docker-compose.ssl.yml stop frontend' --post-hook 'docker-compose -f $(pwd)/docker-compose.ssl.yml start frontend'"

# Add cron job if not exists
(crontab -l 2>/dev/null | grep -v "certbot renew"; echo "$CRON_JOB") | crontab -

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  SSL Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Your site should now be accessible at:"
echo -e "  ${GREEN}https://$DOMAIN_NAME${NC}"
echo ""
echo -e "Certificate auto-renewal is configured to run monthly."
echo ""
