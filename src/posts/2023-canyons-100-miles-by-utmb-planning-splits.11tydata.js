const { add, format, formatDuration, intervalToDuration } = require("date-fns");

const start = new Date(2023, 4, 28, 9, 0, 0);

const zeroPad = (num) => String(num).padStart(2, "0");

const splits = [
  {
    location: "Start",
    distance: 0,
    gain: 0,
    target: { minutes: 0, cumulative: 0, duration: "" },
  },
  {
    location: "No Hands 1",
    distance: 3.4,
    gain: 265,
    target: { minutes: 33, cumulative: 0, duration: "", aid: 0 },
  },
  {
    location: "Cool 1",
    distance: 6.1,
    gain: 1299,
    target: { minutes: 38, cumulative: 0, duration: "", aid: 3 },
  },
  {
    location: "Coffer Dam",
    distance: 12.3,
    gain: 1304,
    target: { minutes: 74, cumulative: 0, duration: "", aid: 3 },
  },
  {
    location: "Cool 2",
    distance: 18.3,
    gain: 856,
    target: { minutes: 63, cumulative: 0, duration: "", aid: 10 },
  },
  {
    location: "Browns Bar 1",
    distance: 22.4,
    gain: 402,
    target: { minutes: 41, cumulative: 0, duration: "", aid: 5 },
  },
  {
    location: "ALT",
    distance: 27.8,
    gain: 1167,
    target: { minutes: 62, cumulative: 0, duration: "", aid: 5 },
  },
  {
    location: "Browns Bar 2",
    distance: 35.3,
    gain: 746,
    target: { minutes: 73, cumulative: 0, duration: "", aid: 5 },
  },
  {
    location: "No Hands 2",
    distance: 41.4,
    gain: 1154,
    target: { minutes: 67, cumulative: 0, duration: "", aid: 5 },
  },
  {
    location: "Mammoth Bar",
    distance: 45.4,
    gain: 953,
    target: { minutes: 48, cumulative: 0, duration: "", aid: 15 },
  },
  {
    location: "Drivers Flat",
    distance: 53.3,
    gain: 2188,
    target: { minutes: 111, cumulative: 0, duration: "", aid: 5 },
  },
  {
    location: "Cal 2",
    distance: 62.6,
    gain: 1873,
    target: { minutes: 118, cumulative: 0, duration: "", aid: 3 },
  },
  {
    location: "Forest Hill",
    distance: 70.9,
    gain: 2451,
    target: { minutes: 116, cumulative: 0, duration: "", aid: 10 },
  },
  {
    location: "Michigan Bluff",
    distance: 76.8,
    gain: 1520,
    target: { minutes: 79, cumulative: 0, duration: "", aid: 5 },
  },
  {
    location: "Deadwood 1",
    distance: 81.9,
    gain: 2257,
    target: { minutes: 104, cumulative: 0, duration: "", aid: 5 },
  },
  {
    location: "Devil's Thumb 1",
    distance: 85.3,
    gain: 436,
    target: { minutes: 39, cumulative: 0, duration: "", aid: 10 },
  },
  {
    location: "Devil's Thumb 2",
    distance: 88.4,
    gain: 1620,
    target: { minutes: 61, cumulative: 0, duration: "", aid: 5 },
  },
  {
    location: "Deadwood 2",
    distance: 90.34,
    gain: 275,
    target: { minutes: 23, cumulative: 0, duration: "", aid: 5 },
  },
  {
    location: "Mitchell Mine",
    distance: 95.55,
    gain: 1988,
    target: { minutes: 100, cumulative: 0, duration: "", aid: 10 },
  },
  {
    location: "Finish",
    distance: 100.3,
    gain: 2023,
    target: { minutes: 81, cumulative: 0, duration: "", aid: 0 },
  },
];

splits.forEach((split, i) => {
  if (i > 0) {
    ["target"].forEach((k) => {
      const checkpoint = split[k];
      const previous = splits[i - 1][k];
      checkpoint.distance = split.distance - splits[i - 1].distance;

      checkpoint.cumulative =
        checkpoint.minutes + (checkpoint.aid ?? 0) + (previous.cumulative ?? 0);

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
      checkpoint.time = format(segmentEnd, "p");

      checkpoint.distance = Math.round(checkpoint.distance * 10) / 10;
      split.gainPerMile = Math.round(split.gain / checkpoint.distance);
    });
  }
});

module.exports = {
  eleventyComputed: {
    splits: splits.slice(1),
  },
};
