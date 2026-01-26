#!/bin/bash
set -e

# 1. Discover new races (optional, maybe run weekly, but running daily is fine if range is small)
# For now, let's assume we scan a small range or rely on manual discovery, 
# but per request, we should automate discovery.
# Let's verify existing ones and check next 10 IDs from max ID?
# For now, just run the ingest based on existing config.

CONFIG_FILE="data/races.json"
DIST_DIR="packages/data-automation/dist"

if  ! [ -f "$CONFIG_FILE" ]; then
    echo "Config file not found: $CONFIG_FILE"
    exit 1
fi

# Parse JSON and iterate using jq
# Requires jq to be installed in the runner
jq -c '.[]' "$CONFIG_FILE" | while read -r race; do
    ID=$(echo "$race" | jq -r '.id')
    SLUG=$(echo "$race" | jq -r '.slug')
    YEAR=$(echo "$race" | jq -r '.year')
    DATA_FILE=$(echo "$race" | jq -r '.dataFile')
    
    echo "Ingesting $SLUG ($YEAR) - ID: $ID"
    node "$DIST_DIR/ultrasignup-waitlist.js" --did "$ID" --output "$DATA_FILE"
    
    # Respect rate limits
    sleep 2
done
