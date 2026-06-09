#!/bin/bash
set -e

IP="109.73.194.70"
PASS="pb+-L,7#EstXEk"
USER="root"

echo "Creating tarball..."
tar --exclude='node_modules' --exclude='.git' --exclude='.next' --exclude='backend/node_modules' --exclude='backend/dist' -czf deploy.tar.gz .

echo "Uploading to server..."
export SSHPASS="$PASS"
sshpass -e ssh -o StrictHostKeyChecking=no $USER@$IP "mkdir -p /opt/foryou-partners"
sshpass -e scp -o StrictHostKeyChecking=no deploy.tar.gz $USER@$IP:/opt/foryou-partners/
sshpass -e scp -o StrictHostKeyChecking=no .env.local $USER@$IP:/opt/foryou-partners/.env

echo "Extracting on server and running setup..."
sshpass -e ssh -o StrictHostKeyChecking=no $USER@$IP "cd /opt/foryou-partners && tar -xzf deploy.tar.gz && chmod +x remote_setup.sh && ./remote_setup.sh"

echo "Cleaning up..."
rm deploy.tar.gz

echo "Done!"
