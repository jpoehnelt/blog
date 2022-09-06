const { add, format, formatDuration, intervalToDuration } = require("date-fns");

const start = new Date(2022, 9, 10, 6, 0, 0);

const zeroPad = (num) => String(num).padStart(2, "0");

const splits = [
  {
    location: "Start",
    distance: 0,
    target: { minutes: 0, cumulative: 0, duration: "" },
    last: { minutes: 0, cumulative: 0, duration: "" },
    jeff: { minutes: 0, cumulative: 0, duration: "" },
  },
  {
    location: "See Canyon",
    distance: 11.1,
    target: { minutes: 118, cumulative: 0, duration: "" },
    last: { minutes: 142, cumulative: 0, duration: "" },
    jeff: { minutes: 108, cumulative: 0, duration: "" }, // 1:48
  },
  {
    location: "Horton Creek",
    distance: 22,
    target: { minutes: 128, cumulative: 0, duration: "" },
    last: { minutes: 147, cumulative: 0, duration: "" },
    jeff: { minutes: 117, cumulative: 0, duration: "" }, // 3:45
  },
  {
    location: "Fish Hatchery",
    distance: 32.5,
    target: { minutes: 140, cumulative: 0, duration: "" },
    last: { minutes: 152, cumulative: 0, duration: "" },
    jeff: { minutes: 134, cumulative: 0, duration: "" }, // 5:59
  },
  {
    location: "Myrtle",
    distance: 41.9,
    target: { minutes: 150, cumulative: 0, duration: "" },
    last: { minutes: 165, cumulative: 0, duration: "" },
    jeff: { minutes: 136, cumulative: 0, duration: "" }, // 8:15
  },
  {
    location: "Buck Springs",
    distance: 45.4,
    target: { minutes: 33, cumulative: 0, duration: "" },
    last: { minutes: 36, cumulative: 0, duration: "" }, // 17:46
    jeff: { minutes: 28, cumulative: 0, duration: "" }, // 8:43
  },
  {
    location: "Pinchot Cabin",
    distance: 53.2,
    target: { minutes: 113, cumulative: 0, duration: "" },
    last: { minutes: 140, cumulative: 0, duration: "" }, // 20:06
    jeff: { minutes: 104, cumulative: 0, duration: "" }, // 10:27
  },
  {
    location: "Washington Park",
    distance: 62.3,
    target: { minutes: 108, cumulative: 0, duration: "" },
    last: { minutes: 132, cumulative: 0, duration: "" }, // 22:18
    jeff: { minutes: 87, cumulative: 0, duration: "" }, // 11:54
  },
  {
    location: "Geronimo",
    distance: 71.6,
    target: { minutes: 140, cumulative: 0, duration: "" },
    last: { minutes: 175, cumulative: 0, duration: "" }, // 1:13
    jeff: { minutes: 126, cumulative: 0, duration: "" }, // 14:00
  },
  {
    location: "Donahue",
    distance: 80,
    target: { minutes: 176, cumulative: 0, duration: "" },
    last: { minutes: 210, cumulative: 0, duration: "" }, // 4:43
    jeff: { minutes: 133, cumulative: 0, duration: "" }, // 16:11
  },
  {
    location: "Pine Canyon",
    distance: 88.9,
    target: { minutes: 160, cumulative: 0, duration: "" },
    last: { minutes: 205, cumulative: 0, duration: "" }, // 8:07
    jeff: { minutes: 134, cumulative: 0, duration: "" }, // 18:25
  },
  {
    location: "Finish",
    distance: 100,
    target: { minutes: 170, cumulative: 0, duration: "" },
    last: { minutes: 246, cumulative: 0, duration: "" }, // 12:13
    jeff: { minutes: 146, cumulative: 0, duration: "" }, // 20:51
  },
];

splits.forEach((split, i) => {
  if (i > 0) {
    ["last", "target", "jeff"].forEach((k) => {
      const checkpoint = split[k];
      const previous = splits[i - 1][k];
      checkpoint.distance = split.distance - splits[i - 1].distance;

      checkpoint.cumulative = checkpoint.minutes + previous.cumulative ?? 0;

      const segmentStart = add(start, { minutes: previous.cumulative });
      const segmentEnd = add(start, { minutes: checkpoint.cumulative });

      checkpoint.duration = formatDuration(
        intervalToDuration({
          start: segmentStart,
          end: segmentEnd,
        }),
        {
          format: ["hours", "minutes"],
          zero: true,
          delimiter: ":",
          locale: {
            formatDistance: (_token, count) => zeroPad(count),
          },
        }
      );

      const pace = intervalToDuration({
        start: segmentStart,
        end: add(segmentStart, {
          seconds: (60 * checkpoint.minutes) / checkpoint.distance,
        }),
      });
      checkpoint.pace = formatDuration(pace, {
        format: ["minutes", "seconds"],
        zero: true,
        delimiter: ":",
        locale: {
          formatDistance: (_token, count) => zeroPad(count),
        },
      });
      checkpoint.time = format(segmentEnd, 'p');
    });
  }
});

module.exports = {
  eleventyComputed: {
    splits: splits.slice(1),
  },
};
