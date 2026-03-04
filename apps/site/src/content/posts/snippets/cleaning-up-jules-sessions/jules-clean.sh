#!/bin/bash

# Configuration
API_BASE="https://jules.googleapis.com/v1alpha"
DAYS_OLD=5

# Calculate threshold timestamp in UTC (ISO 8601)
THRESHOLD_DATE=$(date -u -d "$DAYS_OLD days ago" +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || \
                 date -u -v-"$DAYS_OLD"d +"%Y-%m-%dT%H:%M:%SZ")

# Use [[ ]] for tests throughout; redirect error messages to stderr.
if [[ -z "$JULES_API_KEY" ]]; then
    echo "Error: JULES_API_KEY environment variable is not set." >&2
    exit 1
fi

echo "Searching for sessions created before $THRESHOLD_DATE..."

NEXT_PAGE_TOKEN=""
DELETED=0
FAILED=0

# Fetch all pages and process (delete) sessions inline — avoids accumulating
# an unbounded list in memory before starting deletes.
while : ; do
    URL="$API_BASE/sessions?pageSize=100"
    if [[ -n "$NEXT_PAGE_TOKEN" ]]; then
        URL="$URL&pageToken=$NEXT_PAGE_TOKEN"
    fi

    RESPONSE_JSON=$(curl -s -H "x-goog-api-key: $JULES_API_KEY" "$URL")

    # Process sessions from this page immediately instead of accumulating them.
    while IFS= read -r SESSION_NAME; do
        [[ -z "$SESSION_NAME" ]] && continue

        echo "Deleting $SESSION_NAME..."

        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE \
            -H "x-goog-api-key: $JULES_API_KEY" \
            "$API_BASE/$SESSION_NAME")

        if [[ "$HTTP_CODE" == "200" || "$HTTP_CODE" == "204" ]]; then
            echo "Successfully deleted $SESSION_NAME."
            ((DELETED++))
        else
            echo "Failed to delete $SESSION_NAME (HTTP $HTTP_CODE)." >&2
            ((FAILED++))
        fi
    done < <(echo "$RESPONSE_JSON" | jq -r --arg date "$THRESHOLD_DATE" \
        '.sessions[]? | select(.createTime < $date) | .name')

    # Check for next page token
    NEXT_PAGE_TOKEN=$(echo "$RESPONSE_JSON" | jq -r '.nextPageToken // empty')

    [[ -z "$NEXT_PAGE_TOKEN" ]] && break
done

echo "Done. Deleted: $DELETED, Failed: $FAILED."
