#!/bin/bash

# Push code to GitHub. Digital Ocean auto-deploys on every push.
# Usage: ./push.sh "your commit message"

set -e

REMOTE_URL="https://github.com/varunnkrishna/meditation-app.git"
BRANCH="main"
APP_ID_FILE=".do/app-id"

# Initialize git if not already done
if [ ! -d ".git" ]; then
  echo "Initializing git repository..."
  git init
  git remote add origin "$REMOTE_URL"
fi

# Ensure remote is set correctly
if ! git remote | grep -q "origin"; then
  git remote add origin "$REMOTE_URL"
else
  git remote set-url origin "$REMOTE_URL"
fi

# Stage all changes
git add .

# Commit with a message (use argument or default with timestamp)
COMMIT_MSG="${1:-update $(date '+%Y-%m-%d %H:%M')}"

if git diff --cached --quiet; then
  echo "Nothing new to commit."
else
  git commit -m "$COMMIT_MSG"
fi

# Push to GitHub
git branch -M "$BRANCH"
git push -u origin "$BRANCH"

echo ""
echo "Pushed to GitHub ($BRANCH)"

# Show DO deploy status if app is set up
if [ -f "$APP_ID_FILE" ] && command -v doctl &>/dev/null; then
  APP_ID=$(cat "$APP_ID_FILE")
  echo "Digital Ocean is deploying..."
  echo "Track live: https://cloud.digitalocean.com/apps/$APP_ID"
fi
