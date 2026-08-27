#!/usr/bin/env bash

# Exit immediately if a command exits with a non-zero status
set -euo pipefail

# ANSI color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Helper functions for high-resolution timing
get_time_ms() {
    echo $(($(date +%s%N) / 1000000))
}

format_duration() {
    local ms=$1
    if [ "$ms" -ge 60000 ]; then
        local mins=$(($ms / 60000))
        local rem_sec=$(awk "BEGIN {printf \"%.1f\", ($ms%60000)/1000}")
        echo "${mins}m ${rem_sec}s"
    else
        local seconds=$(awk "BEGIN {printf \"%.2f\", $ms/1000}")
        echo "${seconds}s"
    fi
}

# Resolve root directory of the project
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

TOTAL_START=$(get_time_ms)

echo -e "\n${BOLD}${BLUE}====================================================${NC}"
echo -e "${BOLD}${BLUE}     ..::: Purity :::.. Build & Deployment Engine    ${NC}"
echo -e "${BOLD}${BLUE}====================================================${NC}\n"

# Step 1: Type-checking and Production Build
echo -e "${BOLD}${YELLOW}[1/3] Compiling TypeScript & Building Production Bundle...${NC}"
BUILD_START=$(get_time_ms)
if command -v bun >/dev/null 2>&1; then
    bun run build:prod
else
    npm run build:prod
fi
BUILD_END=$(get_time_ms)
BUILD_DURATION=$((BUILD_END - BUILD_START))
echo -e "${GREEN}✓ Production build completed in $(format_duration $BUILD_DURATION)${NC}"

# Step 2: Verification
echo -e "\n${BOLD}${YELLOW}[2/3] Verifying Production Distribution Directory...${NC}"
VERIFY_START=$(get_time_ms)
if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
    echo -e "${RED}❌ Build verification failed: dist/index.html not found!${NC}"
    exit 1
fi
DIST_SIZE=$(du -sh dist | awk '{print $1}')
VERIFY_END=$(get_time_ms)
VERIFY_DURATION=$((VERIFY_END - VERIFY_START))
echo -e "${GREEN}✓ Output verified in dist/ (Total size: ${DIST_SIZE}) in $(format_duration $VERIFY_DURATION)${NC}"

# Step 3: Deployment to Firebase
echo -e "\n${BOLD}${YELLOW}[3/3] Deploying to Firebase Hosting...${NC}"
DEPLOY_START=$(get_time_ms)
if [ $# -gt 0 ]; then
    # Pass user-specified flags (e.g. --only hosting, --project custom-id, etc.)
    firebase deploy "$@"
else
    firebase deploy --only hosting
fi
DEPLOY_END=$(get_time_ms)
DEPLOY_DURATION=$((DEPLOY_END - DEPLOY_START))
echo -e "${GREEN}✓ Deployment completed in $(format_duration $DEPLOY_DURATION)${NC}"

TOTAL_END=$(get_time_ms)
TOTAL_DURATION=$((TOTAL_END - TOTAL_START))

echo -e "\n${BOLD}${GREEN}====================================================${NC}"
echo -e "${BOLD}${GREEN}   ✓ Build and Deployment Completed Successfully!   ${NC}"
echo -e "${BOLD}${GREEN}====================================================${NC}"
echo -e "${BOLD}${CYAN}📊 Execution Summary:${NC}"
echo -e "   • Production Build:  ${BOLD}$(format_duration $BUILD_DURATION)${NC}"
echo -e "   • Verification:      ${BOLD}$(format_duration $VERIFY_DURATION)${NC}"
echo -e "   • Firebase Deploy:   ${BOLD}$(format_duration $DEPLOY_DURATION)${NC}"
echo -e "   ────────────────────────────────────────────────"
echo -e "   ⏱️  ${BOLD}${YELLOW}Total Time Elapsed: $(format_duration $TOTAL_DURATION)${NC}"
echo -e "${BOLD}${GREEN}====================================================${NC}\n"
