#!/usr/bin/env bash

# Exit on unexpected failures
set -eo pipefail

# ANSI color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m' # No Color

# Helper function for high-resolution timing
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

echo -e "\n${BOLD}${CYAN}================================================================${NC}"
echo -e "${BOLD}${CYAN}          ..::: Purity Framework :::.. Test Runner              ${NC}"
echo -e "${BOLD}${CYAN}================================================================${NC}\n"

# Step 1: Discover test suites
echo -e "${BOLD}${YELLOW}[1/3] Scanning project for test suites (*.spec.ts, *.test.ts)...${NC}"
DISCOVERY_START=$(get_time_ms)

# Find all test files
mapfile -t ALL_TEST_FILES < <(find src -type f \( -name "*.spec.ts" -o -name "*.test.ts" \) | sort)
TEST_COUNT=${#ALL_TEST_FILES[@]}

if [ "$TEST_COUNT" -eq 0 ]; then
    echo -e "${RED}❌ No test files found in src/!${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Found ${BOLD}${TEST_COUNT}${NC}${GREEN} test suite file(s):${NC}"
for file in "${ALL_TEST_FILES[@]}"; do
    FILE_DIR=$(dirname "$file")
    FILE_NAME=$(basename "$file")
    echo -e "   ${DIM}•${NC} ${CYAN}${FILE_DIR}/${NC}${BOLD}${FILE_NAME}${NC}"
done

DISCOVERY_END=$(get_time_ms)
DISCOVERY_DURATION=$((DISCOVERY_END - DISCOVERY_START))
echo -e "   ${DIM}(Discovery took $(format_duration $DISCOVERY_DURATION))${NC}"

# Step 2: Environment verification
echo -e "\n${BOLD}${YELLOW}[2/3] Environment & Dependency Check...${NC}"
NODE_VER=$(node -v 2>/dev/null || echo "Unknown")
VITEST_VER=$(npx vitest --version 2>/dev/null || echo "Installed")

echo -e "   ${DIM}•${NC} Node.js:  ${BOLD}${NODE_VER}${NC}"
echo -e "   ${DIM}•${NC} Vitest:   ${BOLD}v${VITEST_VER}${NC}"
echo -e "   ${DIM}•${NC} DOM Env:  ${BOLD}happy-dom (Custom Elements v1)${NC}"

# Step 3: Run Vitest with verbose output
echo -e "\n${BOLD}${YELLOW}[3/3] Executing Test Suites with Detailed Telemetry...${NC}"
echo -e "${DIM}────────────────────────────────────────────────────────────────${NC}\n"

TEST_START=$(get_time_ms)
TEST_EXIT_CODE=0

# Run vitest in verbose mode, passing any extra command line flags
if [ $# -gt 0 ]; then
    npx vitest run --reporter=verbose "$@" || TEST_EXIT_CODE=$?
else
    npx vitest run --reporter=verbose || TEST_EXIT_CODE=$?
fi

TEST_END=$(get_time_ms)
TEST_DURATION=$((TEST_END - TEST_START))

TOTAL_END=$(get_time_ms)
TOTAL_DURATION=$((TOTAL_END - TOTAL_START))

# Step 4: Summary output
echo -e "\n${DIM}────────────────────────────────────────────────────────────────${NC}"
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo -e "${BOLD}${GREEN}================================================================${NC}"
    echo -e "${BOLD}${GREEN}            ✓ All Test Suites Passed Successfully!              ${NC}"
    echo -e "${BOLD}${GREEN}================================================================${NC}"
else
    echo -e "${BOLD}${RED}================================================================${NC}"
    echo -e "${BOLD}${RED}            ❌ Some Tests Failed. See Output Above.             ${NC}"
    echo -e "${BOLD}${RED}================================================================${NC}"
fi

echo -e "${BOLD}${CYAN}📊 Test Execution Report:${NC}"
echo -e "   • Total Test Suites:  ${BOLD}${TEST_COUNT} files${NC}"
echo -e "   • Test Execution:     ${BOLD}$(format_duration $TEST_DURATION)${NC}"
echo -e "   • Exit Status Code:   ${BOLD}${TEST_EXIT_CODE}${NC}"
echo -e "   ────────────────────────────────────────────────"
echo -e "   ⏱️  ${BOLD}${YELLOW}Total Run Time:     $(format_duration $TOTAL_DURATION)${NC}"
echo -e "${BOLD}${CYAN}================================================================${NC}\n"

exit $TEST_EXIT_CODE
