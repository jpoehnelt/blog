const landCover = new google.maps.ImageMapType({
  getTileUrl: getTileUrl,
  name: "Land Cover",
  alt: "National Land Cover Database 2016",
  minZoom: 0,
  maxZoom: 19,
  opacity: 1.0map
});

landCover.setMap(map);