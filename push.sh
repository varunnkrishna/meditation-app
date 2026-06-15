#!/bin/bash

set -e

REMOTE_URL="https://github.com/varunnkrishna/meditation-app.git"
BRANCH="main"

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

# Commit with a message (use argument or default)
COMMIT_MSG="${1:-update}"
git commit -m "$COMMIT_MSG" 2>/dev/null || echo "Nothing new to commit."

# Push to remote
git branch -M "$BRANCH"
git push -u origin "$BRANCH"

echo ""
echo "Pushed to $REMOTE_URL ($BRANCH)"
