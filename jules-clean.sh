#!/bin/bash

# Configuration
API_BASE="https://jules.googleapis.com/v1alpha"
DAYS_OLD=5

# Calculate threshold timestamp in UTC (ISO 8601)
THRESHOLD_DATE=$(date -u -d "$DAYS_OLD days ago" +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || \
                 date -u -v-"$DAYS_OLD"d +"%Y-%m-%dT%H:%M:%SZ")

if [ -z "$JULES_API_KEY" ]; then
    echo "Error: JULES_API_KEY environment variable is not set."
    exit 1
fi

echo "Searching for sessions created before $THRESHOLD_DATE..."

# 1. List sessions
# 2. Filter by createTime using jq
# 3. Extract the 'name' (resource path) for deletion
SESSIONS_TO_DELETE=$(curl -s -H "x-goog-api-key: $JULES_API_KEY" "$API_BASE/sessions?pageSize=100" | \
    jq -r --arg date "$THRESHOLD_DATE" '.sessions[] | select(.createTime < $date) | .name')

if [ -z "$SESSIONS_TO_DELETE" ]; then
    echo "No sessions older than $DAYS_OLD days found."
    exit 0
fi

# Iterate and delete
for SESSION_NAME in $SESSIONS_TO_DELETE; do
    echo "Deleting $SESSION_NAME..."
    
    # The API expects: DELETE /v1alpha/{session_name} 
    # where session_name is "sessions/12345"
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE \
        -H "x-goog-api-key: $JULES_API_KEY" \
        "$API_BASE/$SESSION_NAME")

    if [ "$RESPONSE" == "200" ] || [ "$RESPONSE" == "204" ]; then
        echo "Successfully deleted $SESSION_NAME."
    else
        echo "Failed to delete $SESSION_NAME (HTTP $RESPONSE)."
    fi
done

echo "Done."