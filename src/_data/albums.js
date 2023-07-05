const EleventyFetch = require("@11ty/eleventy-fetch");

module.exports = async function () {
  const url = `https://ws.audioscrobbler.com/2.0/?method=user.gettopalbums&user=jpoehnelt&api_key=${process.env.LAST_FM_API_KEY}&limit=32&format=json&period=21day`;
  const res = EleventyFetch(url, {
    duration: "1h",
    type: "json",
  }).catch();
  const albums = await res;
  return albums["topalbums"].album;
};
