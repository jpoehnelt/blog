const EleventyFetch = require("@11ty/eleventy-fetch");

module.exports = async function() {
  let url = "https://api.github.com/search/repositories?q=user:jpoehnelt&sort=stars&per_page=100";

  return EleventyFetch(url, {
    duration: "1d",
    type: "json"
  });
};
