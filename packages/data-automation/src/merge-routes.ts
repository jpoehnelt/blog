
import fs from 'fs';
import path from 'path';
import glob from 'fast-glob';
import polyline from '@mapbox/polyline';

// Configuration
const INPUT_DIR = path.resolve(process.cwd(), '../../data/strava');
const OUTPUT_FILE = path.resolve(process.cwd(), '../../data/merged-routes.geojson');
const GRID_SCALE = 20000; // ~5.5m resolution
const MIN_OVERLAP = 5; // Strict inequality (> 5) means min count 6? Or overlap > 5 implies count >= 6?
// User said "> 5". So count > 5.

// Colorado Bounding Box (approximate with buffer)
const CO_BBOX = {
    minLat: 36.99,
    maxLat: 41.01,
    minLon: -109.06,
    maxLon: -102.04
};

// Types
type Point = [number, number]; // [lat, lon]
type Segment = { p1: Point; p2: Point };

async function main() {
  console.log(`Searching for Strava activities in ${INPUT_DIR}...`);
  const files = await glob('*.json', { cwd: INPUT_DIR, absolute: true });
  console.log(`Found ${files.length} files.`);

  const bins = new Map<string, { sumLat: number; sumLon: number; count: number }>();
  const originalPolylines: Point[][] = [];

  // Pass 1: Read files, decode, filter to CO, populate bins
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

          // Binning (only inside CO)
          for (const [lat, lon] of points) {
            if (isInColorado(lat, lon)) {
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
      }
    } catch (e) {
      console.warn(`Failed to process ${file}:`, e);
    }
  }

  console.log(`Created ${bins.size} grid bins inside Colorado from ${originalPolylines.length} polylines.`);

  // Pass 2: Calculate centroids for bins
  const binCentroids = new Map<string, Point>();
  for (const [key, bin] of bins) {
    binCentroids.set(key, [bin.sumLat / bin.count, bin.sumLon / bin.count]);
  }

  // Pass 3: Reconstruct segments and count
  console.log('Reconstructing routes and counting overlaps...');
  const segmentCounts = new Map<string, number>();
  // Store segment geometry for reconstruction: key -> {p1, p2}
  // (We can reconstruct from key, but storing is easier)
  const segmentGeoms = new Map<string, Segment>();

  for (const points of originalPolylines) {
    let lastCentroid: Point | null = null;
    let lastKey: string | null = null;

    for (const [lat, lon] of points) {
      // Check if point was binned (is in CO)
      if (!isInColorado(lat, lon)) {
          lastCentroid = null;
          lastKey = null;
          continue;
      }

      const key = getBinKey(lat, lon);
      const centroid = binCentroids.get(key);

      // centroid should exist if isInColorado is true, but safety check
      if (!centroid) {
          lastCentroid = null;
          lastKey = null;
          continue;
      }

      if (lastCentroid && lastKey !== key) {
        const p1 = lastCentroid;
        const p2 = centroid;

        // Normalize segment key
        const s1 = `${p1[0].toFixed(6)},${p1[1].toFixed(6)}`;
        const s2 = `${p2[0].toFixed(6)},${p2[1].toFixed(6)}`;

        let segmentKey = `${s1}|${s2}`;
        if (s1 > s2) {
            segmentKey = `${s2}|${s1}`;
        }

        const count = segmentCounts.get(segmentKey) || 0;
        segmentCounts.set(segmentKey, count + 1);

        if (!segmentGeoms.has(segmentKey)) {
            segmentGeoms.set(segmentKey, { p1, p2 });
        }
      }

      lastCentroid = centroid;
      lastKey = key;
    }
  }

  // Filter segments
  const mergedSegments: Segment[] = [];
  let keptCount = 0;
  for (const [key, count] of segmentCounts) {
      if (count > MIN_OVERLAP) {
          mergedSegments.push(segmentGeoms.get(key)!);
          keptCount++;
      }
  }

  console.log(`Generated ${mergedSegments.length} unique segments with > ${MIN_OVERLAP} overlaps (from ${segmentCounts.size} total).`);

  // Convert to GeoJSON
  const geojson = {
    type: 'FeatureCollection',
    features: mergedSegments.map(seg => ({
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [
          [seg.p1[1], seg.p1[0]],
          [seg.p2[1], seg.p2[0]]
        ]
      }
    }))
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(geojson));
  console.log(`Saved merged routes to ${OUTPUT_FILE}`);
}

function isInColorado(lat: number, lon: number): boolean {
    return lat >= CO_BBOX.minLat && lat <= CO_BBOX.maxLat &&
           lon >= CO_BBOX.minLon && lon <= CO_BBOX.maxLon;
}

function getBinKey(lat: number, lon: number): string {
  const latIdx = Math.round(lat * GRID_SCALE);
  const lonIdx = Math.round(lon * GRID_SCALE);
  return `${latIdx}_${lonIdx}`;
}

main().catch(console.error);
