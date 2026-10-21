#!/bin/bash

# HealthGene Deployment Verification Script
# Checks that everything is ready for GitHub Actions deployment

set -e

echo "🔍 HealthGene Deployment Verification"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check 1: Git status
echo "✓ Checking Git status..."
if [ -z "$(git status --porcelain)" ]; then
    echo "  ✅ Working directory is clean"
else
    echo "  ⚠️  Uncommitted changes:"
    git status --short
fi
echo ""

# Check 2: Node and npm
echo "✓ Checking Node.js and npm..."
NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)
echo "  Node.js: $NODE_VERSION"
echo "  npm: $NPM_VERSION"
echo ""

# Check 3: Dependencies
echo "✓ Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "  ✅ node_modules directory exists"
else
    echo "  ⚠️  Installing dependencies..."
    npm install
fi
echo ""

# Check 4: Build
echo "✓ Building application..."
npm run build > /dev/null 2>&1 && echo "  ✅ Build successful" || echo "  ❌ Build failed"
echo ""

# Check 5: Build artifacts
echo "✓ Checking build artifacts..."
if [ -d "dist" ]; then
    DIST_SIZE=$(du -sh dist | awk '{print $1}')
    FILE_COUNT=$(find dist -type f | wc -l)
    echo "  ✅ dist/ exists: $DIST_SIZE ($FILE_COUNT files)"
else
    echo "  ❌ dist/ directory not found"
fi
echo ""

# Check 6: GitHub Actions workflow
echo "✓ Checking GitHub Actions workflow..."
if [ -f ".github/workflows/deploy.yml" ]; then
    echo "  ✅ deploy.yml exists"
    
    # Check for key workflow sections
    if grep -q "Firebase Hosting" .github/workflows/deploy.yml; then
        echo "  ✅ Firebase Hosting deployment configured"
    fi
    
    if grep -q "secrets.FIREBASE_CI_TOKEN" .github/workflows/deploy.yml; then
        echo "  ✅ Firebase CI token referenced"
    fi
else
    echo "  ❌ deploy.yml not found"
fi
echo ""

# Check 7: Environment configuration
echo "✓ Checking environment configuration..."
if [ -f ".env.example" ] || [ -f ".env.local" ]; then
    echo "  ✅ Environment configuration exists"
else
    echo "  ⚠️  No .env files found (these should NOT be in git)"
fi
echo ""

# Check 8: README
echo "✓ Checking documentation..."
if [ -f "README.md" ]; then
    echo "  ✅ README.md exists"
fi

if [ -f "GITHUB_ACTIONS_SETUP.md" ]; then
    echo "  ✅ GITHUB_ACTIONS_SETUP.md exists"
fi
echo ""

# Check 9: Firebase configuration
echo "✓ Checking Firebase setup..."
if [ -f "firebase.json" ]; then
    echo "  ✅ firebase.json exists"
    
    if grep -q "hosting" firebase.json; then
        echo "  ✅ Hosting configuration found"
    fi
else
    echo "  ⚠️  firebase.json not found"
fi
echo ""

# Check 10: Latest commit
echo "✓ Checking Git history..."
LATEST_COMMIT=$(git log --oneline -1)
echo "  Latest commit: $LATEST_COMMIT"
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 DEPLOYMENT CHECKLIST"
echo ""
echo "Before pushing to main branch, verify:"
echo "  ✓ Working directory is clean (git status)"
echo "  ✓ Code is tested locally"
echo "  ✓ npm run build succeeds"
echo "  ✓ No console errors"
echo "  ✓ Commit message is descriptive"
echo ""
echo "GitHub secrets required in repository settings:"
echo "  ✓ FIREBASE_API_KEY"
echo "  ✓ FIREBASE_AUTH_DOMAIN"
echo "  ✓ FIREBASE_PROJECT_ID"
echo "  ✓ FIREBASE_STORAGE_BUCKET"
echo "  ✓ FIREBASE_MESSAGING_SENDER_ID"
echo "  ✓ FIREBASE_APP_ID"
echo "  ✓ FIREBASE_MEASUREMENT_ID"
echo "  ✓ FIREBASE_CI_TOKEN"
echo ""
echo "Deployment process:"
echo "  1. Push code to main branch"
echo "  2. GitHub Actions workflow triggers automatically"
echo "  3. Application builds and tests"
echo "  4. If successful, deploys to Firebase Hosting"
echo "  5. Check deployment at: https://myfamilyhealth-fe7b5.web.app"
echo ""
echo "Monitor deployment:"
echo "  👉 GitHub Actions: https://github.com/Phalgunab/HealthGene/actions"
echo "  👉 Firebase Console: https://console.firebase.google.com/project/myfamilyhealth-fe7b5"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Verification complete!"
