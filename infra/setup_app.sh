#!/bin/bash
# setup_app.sh: EC2 user-data script for FastAPI app and PostgreSQL
set -e

# Update and install base dependencies
export DEBIAN_FRONTEND=noninteractive

# Wait for apt locks to be released (in case of concurrent apt processes)
while fuser /var/lib/dpkg/lock-frontend >/dev/null 2>&1; do
    echo "Waiting for apt lock..."
    sleep 5
done
sudo apt-get update -y
sudo apt-get install -y software-properties-common git postgresql postgresql-contrib nginx curl

# Add deadsnakes PPA and install Python 3.11
echo "Adding deadsnakes PPA for Python 3.11..."
sudo add-apt-repository -y ppa:deadsnakes/ppa
sudo apt-get update -y
sudo apt-get install -y python3.11 python3.11-venv python3.11-dev python3.11-distutils

# Verify Python 3.11 installation
python3.11 --version || { echo "Python 3.11 installation failed"; exit 1; }

echo "Initial setup: provisioning system and dependencies."
sudo useradd -m appuser || true
sudo -u appuser git clone https://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@github.com/pankajkv11/LegalDoji_E-Notary_Cursor_App.git /home/appuser/app || true
cd /home/appuser/app/backend
# If .env still does not exist (local/dev/first boot), create a default one
cat <<EOF >/home/appuser/app/backend/.env
database_url=postgresql+asyncpg://${rds_username}:${rds_password}@${rds_endpoint}:5432/${rds_db_name}
database_url_sync=postgresql://${rds_username}:${rds_password}@${rds_endpoint}:5432/${rds_db_name}
EOF
sudo -u appuser python3.11 -m venv venv
sudo -u appuser venv/bin/pip install --upgrade pip
sudo -u appuser venv/bin/pip install -r requirements.txt


# Run Alembic migrations
sudo -u appuser venv/bin/alembic upgrade head

# Setup systemd service with all env vars
cat <<SERVICE | sudo tee /etc/systemd/system/legal-backend.service
[Unit]
Description=FastAPI News API
After=network.target postgresql.service

[Service]
User=appuser
WorkingDirectory=/home/appuser/app/backend
ExecStart=/home/appuser/app/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always
EnvironmentFile=/home/appuser/app/backend/.env

[Install]
WantedBy=multi-user.target
SERVICE

sudo systemctl daemon-reload
sudo systemctl enable legal-backend
sudo systemctl start legal-backend



# Install Node.js for Next.js frontend
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Build and run Next.js frontend from ui folder
cd /home/appuser/app
sudo chown -R appuser:appuser ./
sudo -u appuser tee .env.local <<EOF
NEXT_PUBLIC_API_URL="https://api.shivdarshan.space/graphql"
EOF
sudo -u appuser npm install
# sudo -u appuser npm run build
# Install pm2 globally and run Next.js with pm2
sudo npm install -g pm2
sudo -u appuser pm2 start npm --name legal-frontend -- run start
sudo -u appuser pm2 save
sudo pm2 startup systemd -u appuser --hp /home/appuser
cd /home/appuser/app

# Configure Nginx for both FastAPI and Next.js
sudo rm -f /etc/nginx/sites-enabled/default

cat <<'NGINX' | sudo tee /etc/nginx/sites-available/legal-backend
server {
    server_name api.shivdarshan.space;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    server_name shivdarshan.space;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX

sudo ln -sf /etc/nginx/sites-available/legal-backend /etc/nginx/sites-enabled/legal-backend

sudo nginx -t
sudo systemctl restart nginx


# Install Certbot and obtain SSL certificates for both domains
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx --non-interactive --agree-tos --redirect --email pankajkv40.ps@gmail.com -d api.shivdarshan.space -d shivdarshan.space || true
sudo systemctl reload nginx


# Setup automatic SSL renewal every 3 months (90 days)
echo "0 0 1 */3 * root certbot renew --quiet && systemctl reload nginx" | sudo tee /etc/cron.d/certbot-renew

