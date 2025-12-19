---
title: Google Maps React Wrapper
description: A wrapper for loading Google Maps JavaScript in React
pubDate: "2021-09-17"
tags:
  - code
  - google maps
  - javascript
  - react
---

The package [@googlemaps/react-wrapper](https://www.npmjs.com/package/@googlemaps/react-wrapper) is a wrapper component that helps load the Google Maps JavaScript API. Below is a short snippet demonstrating usage.

```js
import { Wrapper, Status } from "@googlemaps/react-wrapper";

const render = (status: Status): ReactElement => {
  if (status === Status.LOADING) return <Spinner />;
  if (status === Status.FAILURE) return <ErrorComponent />;
  return null;
};

const MyApp = () => (
  <Wrapper apiKey={"YOUR_API_KEY"} render={render}>
    <MyMapComponent />
  </Wrapper>
);
```

Recently I livecoded its usage and created `google.maps.Map` and `google.maps.Marker` components.

<iframe width="560" height="315" src="https://www.youtube.com/embed/Xwcud1Qnnsw" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

If you have any questions about its usage, please feel free to open an issue on [GitHub](https://github.com/googlemaps/react-wrapper/issues).
