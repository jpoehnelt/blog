---
title: WMS Layer on Google Maps
description: Instructions for adding a WMS Layer to Google Maps
pubDate: "2019-10-19"
tags:
  - code
  - google maps
  - wms
  - javascript
---

<script>
  import Snippet from "$lib/components/content/Snippet.svelte";
  import Image from '$lib/components/content/Image.svelte';
  import Note from '$lib/components/content/Note.svelte';
</script>

<Note>

The following code is now a package published to NPM at [**@googlemaps/ogc**](https://www.npmjs.com/package/@googlemaps/ogc).

</Note>

A [Web Map Service(WMS)](https://en.wikipedia.org/wiki/Web_Map_Service) is a 20 year old standard for serving georeferenced images over HTTP. Google Maps allows developers to add custom map types. Let’s see how we combine the two!

Before jumping into JavaScript, we need to explore some XML and learn more about the WMS standard and tiled map numbering.

## About the Web Map Service Standard

The WMS standard exposes many options such as coordinate reference systems(CRS), bounding box, and style selection. These parameters are specified in an XML document that can be queried by sending a [GetCapabilities](https://en.wikipedia.org/wiki/Web_Map_Service#Requests) request to the WMS. Below is a extract of the response for the [National Land Cover Database](https://www.mrlc.gov/data/nlcd-2016-land-cover-conus) server.

<Snippet src="./snippets/google-maps-wms-layer/example.js" />

These options become query parameters in our GetMap request to the WMS returning the following.

<Image src="NLCD_2016_Land_Cover_L48_20210604_3857.png" alt="NLCD 2016 Land Cover L48" />

<Snippet src="./snippets/google-maps-wms-layer/example-1.js" />

It is important to note that the coordinates for the `BBOX` parameter must be in the coordinate reference system specified by the spatial reference system(SRS). In the above request we are using [`EPSG:3857`](https://epsg.io/3857), also known as **web mercator**.

> **Web Mercator**, **Google Web Mercator**, **Spherical Mercator**, **WGS 84 Web Mercator**[\[1\]](https://en.wikipedia.org/wiki/Web_Mercator_projection#cite_note-1) or **WGS 84/Pseudo-Mercator** is a constiant of the [Mercator projection](https://en.wikipedia.org/wiki/Mercator_projection) and is the [de facto standard](https://en.wikipedia.org/wiki/De_facto_standard) for [Web](https://en.wikipedia.org/wiki/World_Wide_Web) mapping applications. It rose to prominence when [Google Maps](https://en.wikipedia.org/wiki/Google_Maps) adopted it in 2005. — [Wikipedia](https://en.wikipedia.org/wiki/Web_Mercator_projection)

## Google Maps `ImageMapType`

Now that we have a basic understanding how the HTTP request to retrieve imagery from a WMS, we can begin exploring the interface Google Maps exposes for its map types, specifically the `google.maps.ImageMapType` and `google.maps.ImageMapTypeOptions`.

<Image src="wms/image-map-type-options-interface.png" alt="Interface for google.maps.ImageMapType" />

Your `getTileUrl` is the option required to enable a WMS layer in Google Maps and how we create that tile URL must follow the WMS standard discussed above.

**There are two primary steps to creating the getTileUrl function:**

1.  Convert point into web mercator coordinates.
2.  Assemble the WMS URL.

## Tile(Point and Zoom) to Web Mercator Coordinates

Before diving into the simple math of calculating the web mercator coordinates, we need to understand a little more about tiled web maps and the parameters of the `getTileUrl` function we will write.

Most tiled web maps follow certain Google Maps conventions:

- Tiles are 256x256 pixels
- At the outer most zoom level, 0, the entire world can be rendered in a single map tile.
- Each zoom level doubles in both dimensions, so a single tile is replaced by 4 tiles when zooming in.

With the above conventions, we know that at zoom level 1, the world is divided into 4 tiles with the coordinates depicted below.

<Image src="wms/xyz_tile_coordinates.png" alt="XYZ Tile Map Pattern" />

We also know that the web mercator extent is a square and its bounds are `-PI * 6378137, PI * 6378137`. Given the above, we can convert from `x`, `y`, and `z` to coordinates using the following:

<Snippet src="./snippets/google-maps-wms-layer/xyztobounds.js" />

Calling `xyzToBounds(0, 0, 1)` returns `[-20037508.342789244, 0, 0, 20037508.342789244]` which is what we would expect for the upper left tile in the diagram above.

## Assemble the WMS URL

The next step is assembling the string for the WMS getMap URL with the function defined above.

<Snippet src="./snippets/google-maps-wms-layer/gettileurl.js" />

## Putting it All Together

Now that we have our `getTileUrl` function, we can construct our `ImageMapType`. Don’t forget that `maxZoom` is required! See reference table above or [here](https://developers.google.com/maps/documentation/javascript/reference).

<Snippet src="./snippets/google-maps-wms-layer/landcover.js" />

And add it to our map! See this [JSFiddle link](https://jsfiddle.net/jwpoehnelt/1ph0wen3) for an interactive example.

<Image src="wms/map.png" alt="NLCD 2016 Land Cover L48" />

## Notes

- XZY, TMS, WTMS will likely be optimized for many simultaneous requests and should be used over WMS when possible.
- TMS is very similar to XYZ except for the order of y.
- Not all WMS will support `EPSG:3857` but it is possible to do the calculation to `EPSG:4326` coordinates(latitude and longitude) which may be more commonly supported.
