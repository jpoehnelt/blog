import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { PUBLIC_GOOGLE_MAPS_API_KEY } from "$env/static/public";

let initialized = false;

export function initGoogleMaps() {
  if (initialized) {
    return;
  }

  setOptions({
    key: PUBLIC_GOOGLE_MAPS_API_KEY,
    v: "beta",
  });

  initialized = true;
}

export { importLibrary };
