const EXTENT = [-Math.PI * 6378137, Math.PI * 6378137];

function xyzToBounds(x, y, z) {
  const tileSize = (EXTENT[1] * 2) / Math.pow(2, z);
  const minx = EXTENT[0] + x * tileSize;
  const maxx = EXTENT[0] + (x + 1) * tileSize;
  // remember y origin starts at top
  const miny = EXTENT[1] - (y + 1) * tileSize;
  const maxy = EXTENT[1] - y * tileSize;
  return [minx, miny, maxx, maxy];
}
