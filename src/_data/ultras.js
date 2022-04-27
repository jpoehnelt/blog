const glob = require("glob");
const path = require("path");
const protobuf = require("protobufjs");
const gzip = require("node-gzip");
const fs = require("fs");

module.exports = async () => {
  const directory = path.join(
    __dirname,
    "_raw",
    "ultrasignup"
  );

  return new Promise((resolve, reject) => {
    glob(path.join(directory, "*/*/distance-*.json"), (_, files) => {
      const ultras = Object.values(
        files.reduce((acc, file) => {
          const [slug, dt, filename] = file
            .replace(directory, "")
            .slice(1)
            .split("/");

          // const results = JSON.parse(fs.readFileSync(file, "utf8"));
          const distance = dt.replace(/^distance-/, "").split(".")[0];

          acc[slug] = acc[slug] || {
            slug,
            ...JSON.parse(
              fs.readFileSync(path.join(directory, slug, "metadata.json"))
            ),
          };
          // acc[slug][dt] = acc[slug][dt] || {};
          // acc[slug][dt][distance] = results;

          return acc;
        }, {})
      );

      resolve(ultras);
    });
  });
};
