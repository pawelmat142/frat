#!/bin/bash

# =====================================================
# JobHigh SSL Certificate Renewal Script
# Uses webroot method - NO downtime required
# Run as: sudo bash renew-ssl.sh
# =====================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

LOG_FILE="/var/log/certbot-renew.log"
CONTAINER="jobhigh_frontend"
WEBROOT="/var/www/certbot"

log() {
    echo -e "$1" | tee -a "$LOG_FILE"
}

log ""
log "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] === SSL Certificate Renewal ===${NC}"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    log "${RED}Please run with sudo${NC}"
    exit 1
fi

# Load domain from .env if present
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$SCRIPT_DIR/.env" ]; then
    DOMAIN_NAME=$(grep '^DOMAIN_NAME=' "$SCRIPT_DIR/.env" | cut -d '=' -f2 | tr -d '"' | tr -d "'")
fi

if [ -z "$DOMAIN_NAME" ]; then
    log "${RED}DOMAIN_NAME not found in .env${NC}"
    exit 1
fi

log "${YELLOW}Domain: $DOMAIN_NAME${NC}"

# Ensure webroot directory exists and is writable by certbot
mkdir -p "$WEBROOT"

# Switch renewal method to webroot if currently set to standalone
RENEWAL_CONF="/etc/letsencrypt/renewal/${DOMAIN_NAME}.conf"
if [ -f "$RENEWAL_CONF" ] && grep -q "authenticator = standalone" "$RENEWAL_CONF"; then
    log "${YELLOW}Switching renewal method from standalone to webroot...${NC}"
    sed -i "s/authenticator = standalone/authenticator = webroot/" "$RENEWAL_CONF"
    # Add webroot path if not present
    if ! grep -q "webroot_path" "$RENEWAL_CONF"; then
        sed -i "/\[renewalparams\]/a webroot_path = $WEBROOT" "$RENEWAL_CONF"
    fi
fi

# Check if frontend container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER}$"; then
    log "${RED}Container $CONTAINER is not running! Cannot use webroot method.${NC}"
    log "${YELLOW}Falling back to standalone (will briefly stop container on port 80)...${NC}"
    docker compose -f "$SCRIPT_DIR/docker-compose.yml" stop frontend || true
    certbot renew --standalone 2>&1 | tee -a "$LOG_FILE"
    docker compose -f "$SCRIPT_DIR/docker-compose.yml" start frontend
else
    # Webroot renewal — nginx stays up, certbot writes challenge to /var/www/certbot
    log "${YELLOW}Running certbot renew (webroot, no downtime)...${NC}"
    certbot renew \
        --webroot \
        --webroot-path "$WEBROOT" \
        --non-interactive \
        2>&1 | tee -a "$LOG_FILE"

    CERTBOT_EXIT=${PIPESTATUS[0]}

    if [ "$CERTBOT_EXIT" -eq 0 ]; then
        log "${GREEN}Certbot completed. Reloading nginx to apply new certificate...${NC}"
        docker exec "$CONTAINER" nginx -s reload 2>&1 | tee -a "$LOG_FILE"
        log "${GREEN}Done! Certificate renewed and nginx reloaded with zero downtime.${NC}"
    else
        log "${RED}Certbot failed with exit code $CERTBOT_EXIT${NC}"
        exit "$CERTBOT_EXIT"
    fi
fi

log "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] === Renewal finished ===${NC}"
