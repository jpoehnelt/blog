#!/bin/bash
# Migration script: Reorganize data from year-first to slug-first structure
# From: data/races/2026/{slug}/ → To: data/races/{slug}/2026/

set -e

DATA_DIR="$(dirname "$0")/../data"
RACES_DIR="$DATA_DIR/races"

echo "Migrating race data to new series architecture..."

# Get all year directories (2024, 2025, 2026, etc.)
for YEAR_DIR in "$RACES_DIR"/20*/; do
  YEAR=$(basename "$YEAR_DIR")
  
  # Skip if not a year directory
  if ! [[ "$YEAR" =~ ^20[0-9]{2}$ ]]; then
    continue
  fi
  
  echo "Processing year: $YEAR"
  
  # Get all race slugs in this year
  for RACE_DIR in "$YEAR_DIR"*/; do
    SLUG=$(basename "$RACE_DIR")
    
    # Skip if already processed or is a series directory
    if [ ! -d "$RACE_DIR" ]; then
      continue
    fi
    
    # Create new structure: races/{slug}/{year}/
    NEW_DIR="$RACES_DIR/$SLUG/$YEAR"
    
    echo "  Moving $YEAR/$SLUG → $SLUG/$YEAR"
    
    # Create parent directory
    mkdir -p "$RACES_DIR/$SLUG"
    
    # Move the race data
    if [ -d "$NEW_DIR" ]; then
      # Merge if directory exists
      cp -r "$RACE_DIR"* "$NEW_DIR/" 2>/dev/null || true
      rm -rf "$RACE_DIR"
    else
      mv "$RACE_DIR" "$NEW_DIR"
    fi
  done
  
  # Remove empty year directory
  rmdir "$YEAR_DIR" 2>/dev/null || true
done

echo ""
echo "Migration complete! Now updating races.json dataFile paths..."

# Update dataFile paths in races.json using node
node -e "
const fs = require('fs');
const path = require('path');

const racesPath = path.join('$DATA_DIR', 'races.json');
const races = JSON.parse(fs.readFileSync(racesPath, 'utf-8'));

let updated = 0;
for (const race of races) {
  for (const event of race.events || []) {
    // Update entrants dataFile
    if (event.entrants?.dataFile) {
      const match = event.entrants.dataFile.match(/^races\/(\d{4})\/([^/]+)\/(.+)$/);
      if (match) {
        const [, year, slug, file] = match;
        event.entrants.dataFile = \`races/\${slug}/\${year}/\${file}\`;
        updated++;
      }
    }
    // Update waitlist dataFile
    if (event.waitlist?.dataFile) {
      const match = event.waitlist.dataFile.match(/^races\/(\d{4})\/([^/]+)\/(.+)$/);
      if (match) {
        const [, year, slug, file] = match;
        event.waitlist.dataFile = \`races/\${slug}/\${year}/\${file}\`;
        updated++;
      }
    }
  }
}

fs.writeFileSync(racesPath, JSON.stringify(races, null, 2));
console.log('Updated ' + updated + ' dataFile paths in races.json');
"

echo ""
echo "Done! Please verify the migration and commit the changes."
