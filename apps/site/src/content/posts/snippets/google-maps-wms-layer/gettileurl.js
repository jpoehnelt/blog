const getTileUrl = (coordinates, zoom) => {
  return (
    "https://www.mrlc.gov/geoserver/NLCD_Land_Cover/wms?" +
    "&REQUEST=GetMap&SERVICE=WMS&VERSION=1.1.1" +
    "&LAYERS=mrlc_display%3ANLCD_2016_Land_Cover_L48" +
    "&FORMAT=image%2Fpng" +
    "&SRS=EPSG:3857&WIDTH=256&HEIGHT=256" +
    "&BBOX=" +
    xyzToBounds(coordinates.x, coordinates.y, zoom).join(",")
  );
};
