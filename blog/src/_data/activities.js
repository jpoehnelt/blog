const existing = require("./strava.json");
const fs = require("fs");
const path = require("path");

module.exports = async () => {
  const directoryPath = path.join(__dirname, "strava");
  const files = fs
    .readdirSync(directoryPath)
    .filter((file) => file.endsWith(".json"));

  const detailedActivities = Object.fromEntries(
    await Promise.all(
      files.map(async (file) => {
        const activity = JSON.parse(
          await fs.promises.readFile(path.join(directoryPath, file), "utf-8"),
        );
        return [activity.id, activity];
      }),
    ),
  );

  const merged = {
    ...existing,
    ...detailedActivities,
  };

  const activities = Object.values(merged);

  const sorted = activities.sort((a, b) => {
    return new Date(b.start_date) - new Date(a.start_date);
  });

  return {
    all: activities,
    runs: sorted.filter((a) => a.type === "Run")
  };
};
