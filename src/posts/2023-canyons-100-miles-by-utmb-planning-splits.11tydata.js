const { add, format, formatDuration, intervalToDuration } = require("date-fns");

const start = new Date(2023, 4, 28, 9, 0, 0);

const zeroPad = (num) => String(num).padStart(2, "0");

const splits = [
  {
    location: "Start",
    distance: 0,
    gain: 0,
    loss: 0,
    target: { minutes: 0, cumulative: 0, duration: "" },
  },
  {
    location: "No Hands 1",
    distance: 3.5,
    gain: 265,
    loss: 897,
    target: { minutes: 35, cumulative: 0, duration: "", aid: 0 },
  },
  {
    location: "Cool 1",
    distance: 6.5,
    gain: 1156,
    loss: 220,
    target: { minutes: 45, cumulative: 0, duration: "", aid: 3 },
  },  
  {
    location: "Cool 2",
    distance: 14.3,
    gain: 1207,
    loss: 1207,
    target: { minutes: 87, cumulative: 0, duration: "", aid: 10 },
  },
  {
    location: "Browns Bar 1",
    distance: 18.5,
    gain: 261,
    loss: 1022,
    target: { minutes: 47, cumulative: 0, duration: "", aid: 5 },
  },
  {
    location: "ALT",
    distance:23.9,
    gain: 947,
    loss: 261,
    target: { minutes: 69, cumulative: 0, duration: "", aid: 5 },
  },
  {
    location: "No Hands 2",
    distance: 36.4,
    gain: 1010,
    loss: 1185,
    target: { minutes: 138, cumulative: 0, duration: "", aid: 5 },
  },
  {
    location: "Mammoth Bar",
    distance: 40.4,
    gain: 864,
    loss: 826,
    target: { minutes: 56, cumulative: 0, duration: "", aid: 5 },
  },
  {
    location: "Drivers Flat",
    distance: 48.3,
    gain: 2188,
    loss: 989,
    target: { minutes: 114, cumulative: 0, duration: "", aid: 15 },
  },
  {
    location: "Cal 2",
    distance: 57.6,
    gain: 1728,
    loss: 1725,
    target: { minutes: 115, cumulative: 0, duration: "", aid: 3 },
  },
  {
    location: "Forest Hill",
    distance: 65.9,
    gain: 2320,
    loss: 735,
    target: { minutes: 145, cumulative: 0, duration: "", aid: 10 },
  },
  {
    location: "Cal 2",
    distance: 74.2,
    gain: 730,
    loss: 2315,
    target: { minutes: 101, cumulative: 0, duration: "", aid: 3 },
  },
  {
    location: "Drivers Flat",
    distance: 83.5,
    gain: 1725,
    loss: 1727,
    target: { minutes: 110, cumulative: 0, duration: "", aid: 15 },
  },
  {
    location: "Clementine",
    distance: 91.9,
    gain: 1012,
    loss: 1205,
    target: { minutes: 80, cumulative: 0, duration: "", aid: 5 },
  },{
    location: "No Hands 3",
    distance: 95.6,
    gain: 240,
    loss: 1069,
    target: { minutes: 35, cumulative: 0, duration: "", aid: 3 },
  },
  {
    location: "Finish",
    distance: 99.1,
    gain: 991,
    loss: 212,
    target: { minutes: 56, cumulative: 0, duration: "", aid: 0 },
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
