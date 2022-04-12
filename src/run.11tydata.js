module.exports = {
  eleventyComputed: {
    stravaYearlyRunTotals: ({ activities }) => {
      activities = activities.filter(({ type }) => type === "Run");

      let grouped = Object.values(
        activities.reduce((acc, { start_date, distance }) => {
          const name = start_date.slice(0, 4);

          if (!acc[name]) {
            acc[name] = { name, value: distance };
          } else {
            acc[name].value += distance;
          }

          return acc;
        }, {})
      );

      //sort bars based on value
      grouped = grouped.sort(function (a, b) {
        return b - a;
      });

      return grouped;
    },
  },
};
