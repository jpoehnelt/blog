
import fs from 'fs';
import path from 'path';
import glob from 'fast-glob';
import polyline from '@mapbox/polyline';

// Configuration
// process.cwd() is likely the package root (packages/data-automation) when run via pnpm script
// But we want to target root/data/strava
// We'll assume the script is running from packages/data-automation
// So ../../data/strava is the path
const INPUT_DIR = path.resolve(process.cwd(), '../../data/strava');
const OUTPUT_FILE = path.resolve(process.cwd(), '../../data/merged-routes.geojson');
// Using 2e4 (0.00005) -> ~5.5m might be better for "slide" effect.
const GRID_SCALE = 20000;

// Types
type Point = [number, number]; // [lat, lon]
type Segment = { p1: Point; p2: Point };

async function main() {
  console.log(`Searching for Strava activities in ${INPUT_DIR}...`);
  // Ensure the glob pattern works with absolute paths
  const files = await glob('*.json', { cwd: INPUT_DIR, absolute: true });
  console.log(`Found ${files.length} files.`);

  const bins = new Map<string, { sumLat: number; sumLon: number; count: number }>();
  const originalPolylines: Point[][] = [];

  // Pass 1: Read all files, decode polylines, populate bins
  console.log('Reading and decoding files...');
  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      const json = JSON.parse(content);
      const encodedPolyline = json.map?.polyline || json.map?.summary_polyline;

      if (encodedPolyline) {
        const points = polyline.decode(encodedPolyline);
        if (points.length > 0) {
          originalPolylines.push(points);

          // Binning
          for (const [lat, lon] of points) {
            const key = getBinKey(lat, lon);
            if (!bins.has(key)) {
              bins.set(key, { sumLat: 0, sumLon: 0, count: 0 });
            }
            const bin = bins.get(key)!;
            bin.sumLat += lat;
            bin.sumLon += lon;
            bin.count += 1;
          }
        }
      }
    } catch (e) {
      console.warn(`Failed to process ${file}:`, e);
    }
  }

  console.log(`Created ${bins.size} grid bins from ${originalPolylines.length} polylines.`);

  // Pass 2: Calculate centroids for bins
  const binCentroids = new Map<string, Point>();
  for (const [key, bin] of bins) {
    binCentroids.set(key, [bin.sumLat / bin.count, bin.sumLon / bin.count]);
  }

  // Pass 3: Reconstruct segments using centroids
  console.log('Reconstructing and merging routes...');
  const uniqueSegments = new Set<string>();
  const mergedSegments: Segment[] = [];

  for (const points of originalPolylines) {
    let lastCentroid: Point | null = null;
    let lastKey: string | null = null;

    for (const [lat, lon] of points) {
      const key = getBinKey(lat, lon);
      const centroid = binCentroids.get(key)!;

      if (lastCentroid && lastKey !== key) {
        // Create segment
        const p1 = lastCentroid;
        const p2 = centroid;

        // Normalize segment key for deduplication (undirected graph)
        // Store as string "lat1,lon1|lat2,lon2" where p1 < p2
        const s1 = `${p1[0].toFixed(6)},${p1[1].toFixed(6)}`;
        const s2 = `${p2[0].toFixed(6)},${p2[1].toFixed(6)}`;

        let segmentKey = `${s1}|${s2}`;
        if (s1 > s2) {
            segmentKey = `${s2}|${s1}`;
        }

        if (!uniqueSegments.has(segmentKey)) {
            uniqueSegments.add(segmentKey);
            mergedSegments.push({ p1, p2 });
        }
      }

      lastCentroid = centroid;
      lastKey = key;
    }
  }

  console.log(`Generated ${mergedSegments.length} unique segments.`);

  // Convert to GeoJSON
  const geojson = {
    type: 'FeatureCollection',
    features: mergedSegments.map(seg => ({
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [
          [seg.p1[1], seg.p1[0]], // GeoJSON is [lon, lat]
          [seg.p2[1], seg.p2[0]]
        ]
      }
    }))
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(geojson)); // Minified
  console.log(`Saved merged routes to ${OUTPUT_FILE}`);
}

function getBinKey(lat: number, lon: number): string {
  // Round to grid
  const latIdx = Math.round(lat * GRID_SCALE);
  const lonIdx = Math.round(lon * GRID_SCALE);
  return `${latIdx}_${lonIdx}`;
}

main().catch(console.error);
