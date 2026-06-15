#!/bin/bash

# One-time setup: installs doctl, authenticates, and creates the DO App Platform app.
# Run this once per project. After that, just use push.sh to deploy.

set -e

APP_ID_FILE=".do/app-id"

echo "=== Digital Ocean App Platform Setup ==="
echo ""

# 1. Install doctl if missing
if ! command -v doctl &>/dev/null; then
  echo "Installing doctl via Homebrew..."
  brew install doctl
else
  echo "doctl already installed: $(doctl version --short 2>/dev/null || doctl version)"
fi

echo ""

# 2. Authenticate with DO
echo "Authenticating with Digital Ocean..."
echo "This will open a browser or prompt for your API token."
echo "Get your token at: https://cloud.digitalocean.com/account/api/tokens"
echo ""
doctl auth init

echo ""

# 3. Create the app on DO App Platform
if [ -f "$APP_ID_FILE" ]; then
  echo "App already set up. App ID: $(cat $APP_ID_FILE)"
  echo "To re-create, delete .do/app-id and run this script again."
else
  echo "Creating app on Digital Ocean App Platform..."
  APP_ID=$(doctl apps create --spec .do/app.yaml --format ID --no-header)
  echo "$APP_ID" > "$APP_ID_FILE"
  echo ""
  echo "App created! App ID: $APP_ID"
  echo ""
  echo "IMPORTANT: Go to Digital Ocean and connect your GitHub account:"
  echo "https://cloud.digitalocean.com/apps/$APP_ID/settings"
  echo ""
  echo "After connecting GitHub, every git push will auto-deploy."
fi

echo ""
echo "=== Setup complete ==="
echo "From now on, just run:  ./push.sh \"your message\""
echo "That's it — Digital Ocean will auto-deploy on every push."
