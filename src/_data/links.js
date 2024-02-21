const fs = require("fs");
const path = require("path");
const slugify = require("slugify");

module.exports = async () => {
  const directoryPath = path.join(__dirname, "links");
  const files = fs
    .readdirSync(directoryPath)
    .filter((file) => file.endsWith(".json"));

  const entries = await Promise.all(
    files.map(async (file) => {
      const data = JSON.parse(
        await fs.promises.readFile(path.join(directoryPath, file), "utf-8"),
      );

      const url = new URL(data.url);
      return {
        ...data,
        tags: [...new Set(["links", ...(data.tags ?? [])])],
        permalink: `/links/${slugify(url.hostname)}/${slugify(url.pathname)}/${data.id.slice(0, 8)}`,
      };
    }),
  );

  return entries.sort((a, b) => {
    return a.date - b.date;
  });
};
