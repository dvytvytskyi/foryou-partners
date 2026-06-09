#!/bin/bash
set -e

echo "Updating system..."
apt-get update

echo "Installing Nginx, Certbot..."
apt-get install -y nginx certbot python3-certbot-nginx

echo "Installing Docker..."
if ! command -v docker &> /dev/null
then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
fi

echo "Configuring Nginx..."
cp /opt/foryou-partners/nginx.conf /etc/nginx/sites-available/foryou-partners
ln -sf /etc/nginx/sites-available/foryou-partners /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
systemctl restart nginx

echo "Attempting to get SSL certificates (will skip if already exists or fails)..."
certbot --nginx -d partners.foryou-admin.ru -d www.partners.foryou-admin.ru --non-interactive --agree-tos -m admin@foryou-realestate.com || echo "Certbot failed, probably DNS not propagated yet or limits reached."

echo "Clearing Docker auth config in case of bad saved credentials..."
docker logout || true
rm -f /root/.docker/config.json

echo "Starting Docker containers..."
cd /opt/foryou-partners

# Apply migrations
docker compose -f docker-compose.prod.yml run --rm backend npx prisma migrate deploy

# Start everything
docker compose -f docker-compose.prod.yml up -d --build

echo "Deployment complete."
