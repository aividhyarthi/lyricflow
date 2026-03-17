#!/usr/bin/env bash
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: ./scripts/publish-to-github.sh <github_repo_url> [commit_message]"
  echo "Example: ./scripts/publish-to-github.sh https://github.com/aividhyarthi/devloktelugu.git \"deploy prep\""
  exit 1
fi

REPO_URL="$1"
COMMIT_MSG="${2:-deploy: update lyricflow}"

BRANCH="main"

# Ensure git repo
if [ ! -d .git ]; then
  git init
fi

# Stage and commit if there are changes
if [ -n "$(git status --porcelain)" ]; then
  git add .
  git commit -m "$COMMIT_MSG"
fi

# Ensure branch is main
CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [ "$CURRENT_BRANCH" != "$BRANCH" ]; then
  git branch -M "$BRANCH"
fi

# Configure origin safely
if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "$REPO_URL"
else
  git remote add origin "$REPO_URL"
fi

# Push
set +e
git push -u origin "$BRANCH"
PUSH_STATUS=$?
set -e

if [ $PUSH_STATUS -ne 0 ]; then
  echo ""
  echo "Push failed. This is usually auth/network related."
  echo "Next step: run the same command on your own machine where GitHub login is available."
  exit $PUSH_STATUS
fi

echo ""
echo "✅ Done. Your repo is live on branch '$BRANCH'."
echo "Now in Railway: choose this repo + branch '$BRANCH'."
