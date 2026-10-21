#!/bin/bash

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}HealthGene Deployment Validator${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Track results
PASSED=0
FAILED=0
WARNINGS=0

# Function to check status
check_status() {
  if [ $1 -eq 0 ]; then
    echo -e "${GREEN}✅ PASS${NC}: $2"
    ((PASSED++))
  else
    echo -e "${RED}❌ FAIL${NC}: $2"
    ((FAILED++))
  fi
}

warn() {
  echo -e "${YELLOW}⚠️  WARN${NC}: $1"
  ((WARNINGS++))
}

# Step 1: Check repository structure
echo -e "${BLUE}1. Checking Repository Structure${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

[ -f ".github/workflows/deploy.yml" ] && check_status 0 "GitHub Actions workflow file exists" || check_status 1 "GitHub Actions workflow file missing"
[ -f "firebase.json" ] && check_status 0 "firebase.json exists" || check_status 1 "firebase.json missing"
[ -f "firestore.rules" ] && check_status 0 "firestore.rules exists" || check_status 1 "firestore.rules missing"
[ -f ".env.example" ] && check_status 0 ".env.example exists" || check_status 1 ".env.example missing"
[ -f "package.json" ] && check_status 0 "package.json exists" || check_status 1 "package.json missing"

echo ""

# Step 2: Check .gitignore configuration
echo -e "${BLUE}2. Checking .gitignore Configuration${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f ".gitignore" ]; then
  if grep -q "\.env\.local" ".gitignore"; then
    check_status 0 ".env.local is in .gitignore"
  else
    check_status 1 ".env.local is NOT in .gitignore (security risk!)"
  fi
  
  if grep -q "node_modules" ".gitignore"; then
    check_status 0 "node_modules is in .gitignore"
  else
    check_status 1 "node_modules is NOT in .gitignore"
  fi
else
  check_status 1 ".gitignore file not found"
fi

echo ""

# Step 3: Check .env.local configuration
echo -e "${BLUE}3. Checking Local Environment Configuration${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f ".env.local" ]; then
  echo "✓ .env.local exists (for local development only)"
  
  # Check for required Firebase variables
  required_vars=(
    "VITE_FIREBASE_API_KEY"
    "VITE_FIREBASE_AUTH_DOMAIN"
    "VITE_FIREBASE_PROJECT_ID"
    "VITE_FIREBASE_STORAGE_BUCKET"
    "VITE_FIREBASE_MESSAGING_SENDER_ID"
    "VITE_FIREBASE_APP_ID"
    "VITE_FIREBASE_MEASUREMENT_ID"
  )
  
  for var in "${required_vars[@]}"; do
    if grep -q "^$var=" ".env.local"; then
      value=$(grep "^$var=" ".env.local" | cut -d'=' -f2)
      if [ -z "$value" ] || [ "$value" = "your_*_here" ]; then
        warn "$var is empty or has placeholder value"
      else
        check_status 0 "$var is configured"
      fi
    else
      warn "$var is missing from .env.local"
    fi
  done
else
  warn ".env.local not found (needed for local development, but not for CI/CD)"
fi

echo ""

# Step 4: Check project files aren't committed secrets
echo -e "${BLUE}4. Checking for Accidental Secret Commits${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Search for common secret patterns in committed files
if git rev-parse --git-dir > /dev/null 2>&1; then
  # Check for API keys in source files
  if git grep -i "api.key\|firebase.*key\|private.*key" -- ':/*.js' ':/*.jsx' ':/*.ts' ':/*.tsx' 2>/dev/null | grep -v "node_modules" > /dev/null; then
    check_status 1 "Potential secrets found in source files!"
  else
    check_status 0 "No obvious API keys in source files"
  fi
  
  # Check for .env.local in git history
  if git log --all --full-history -- .env.local 2>/dev/null | grep -q "commit"; then
    check_status 1 ".env.local found in git history (remove with: git filter-branch)"
  else
    check_status 0 ".env.local not in git history"
  fi
else
  warn "Not a git repository - skipping git checks"
fi

echo ""

# Step 5: Check build configuration
echo -e "${BLUE}5. Checking Build Configuration${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "vite.config.js" ] || [ -f "vite.config.ts" ]; then
  check_status 0 "Vite configuration file exists"
else
  check_status 1 "Vite configuration file not found"
fi

if grep -q '"build"' "package.json" 2>/dev/null; then
  check_status 0 "Build script defined in package.json"
else
  check_status 1 "Build script not found in package.json"
fi

if grep -q '"lint"' "package.json" 2>/dev/null; then
  check_status 0 "Lint script defined in package.json"
else
  warn "Lint script not found in package.json"
fi

echo ""

# Step 6: Check Firebase configuration
echo -e "${BLUE}6. Checking Firebase Configuration${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if grep -q '"hosting"' "firebase.json" 2>/dev/null; then
  check_status 0 "Firebase Hosting configuration found"
else
  check_status 1 "Firebase Hosting configuration missing"
fi

if grep -q '"firestore"' "firebase.json" 2>/dev/null; then
  check_status 0 "Firestore configuration found"
else
  check_status 1 "Firestore configuration missing"
fi

if grep -q '"rewrites"' "firebase.json" 2>/dev/null; then
  check_status 0 "SPA routing rewrites configured"
else
  check_status 1 "SPA routing rewrites not configured"
fi

# Check firestore.rules syntax
if [ -f "firestore.rules" ]; then
  if ! grep -q "firestore.query" "firestore.rules" 2>/dev/null; then
    check_status 0 "firestore.rules doesn't contain invalid firestore.query()"
  else
    check_status 1 "firestore.rules contains invalid firestore.query() function"
  fi
fi

echo ""

# Step 7: Check dependencies
echo -e "${BLUE}7. Checking Dependencies${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "package-lock.json" ]; then
  check_status 0 "package-lock.json exists"
else
  warn "package-lock.json not found (recommended for reproducible builds)"
fi

if [ -d "node_modules" ]; then
  check_status 0 "node_modules directory exists"
else
  warn "node_modules not installed - run: npm ci"
fi

echo ""

# Step 8: Test build
echo -e "${BLUE}8. Testing Build Process${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -d "node_modules" ]; then
  echo "Building application (this may take a moment)..."
  npm run build > /tmp/build.log 2>&1
  if [ $? -eq 0 ]; then
    check_status 0 "Build succeeds"
    if [ -d "dist" ]; then
      build_size=$(du -sh dist/ | cut -f1)
      echo "  Build output size: $build_size"
      if [ -d "dist/assets" ]; then
        check_status 0 "Build artifacts generated"
      fi
    fi
  else
    check_status 1 "Build failed"
    echo "  Last 10 lines of build log:"
    tail -10 /tmp/build.log | sed 's/^/    /'
  fi
else
  warn "node_modules not installed - skipping build test (run: npm ci)"
fi

echo ""

# Step 9: Check GitHub Actions workflow
echo -e "${BLUE}9. Checking GitHub Actions Workflow${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f ".github/workflows/deploy.yml" ]; then
  # Check for required secrets in workflow
  required_secrets=(
    "FIREBASE_API_KEY"
    "FIREBASE_AUTH_DOMAIN"
    "FIREBASE_PROJECT_ID"
    "FIREBASE_STORAGE_BUCKET"
    "FIREBASE_MESSAGING_SENDER_ID"
    "FIREBASE_APP_ID"
    "FIREBASE_MEASUREMENT_ID"
    "FIREBASE_CI_TOKEN"
  )
  
  for secret in "${required_secrets[@]}"; do
    if grep -q "secrets\.$secret" ".github/workflows/deploy.yml"; then
      check_status 0 "Workflow uses $secret"
    else
      check_status 1 "Workflow missing reference to $secret"
    fi
  done
else
  check_status 1 "Workflow file not found"
fi

echo ""

# Step 10: Summary
echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Validation Summary${NC}"
echo -e "${BLUE}================================${NC}"

total=$((PASSED + FAILED + WARNINGS))
echo ""
echo -e "Total Checks: $total"
echo -e "${GREEN}Passed: $PASSED${NC}"
if [ $FAILED -gt 0 ]; then
  echo -e "${RED}Failed: $FAILED${NC}"
else
  echo -e "${GREEN}Failed: $FAILED${NC}"
fi
if [ $WARNINGS -gt 0 ]; then
  echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
fi

echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ All critical checks passed!${NC}"
  echo ""
  echo "Next steps:"
  echo "  1. Add GitHub Secrets: https://github.com/Phalgunab/HealthGene/settings/secrets/actions"
  echo "  2. Verify secrets: FIREBASE_API_KEY, FIREBASE_AUTH_DOMAIN, etc."
  echo "  3. Push to main branch to trigger deployment"
  echo "  4. Monitor: https://github.com/Phalgunab/HealthGene/actions"
  echo "  5. Visit live app: https://YOUR-PROJECT.web.app"
  exit 0
else
  echo -e "${RED}❌ Some checks failed. Please fix the issues above.${NC}"
  echo ""
  echo "Common fixes:"
  echo "  - Run: npm ci"
  echo "  - Check .env.local has real Firebase credentials"
  echo "  - Verify .gitignore includes .env.local"
  echo "  - Run: npm run build to test build process"
  exit 1
fi
