const ChartJsImage = require("chartjs-to-image");

const data = [
  {
    stats: { min: 1401, max: 1466, mean: 1424.6, median: 1422 },
    endpoint: "africa-south1",
  },
  {
    stats: { min: 243, max: 1179, mean: 802.2, median: 1179 },
    endpoint: "asia-east1",
  },
  {
    stats: { min: 258, max: 1325, mean: 867, median: 1325 },
    endpoint: "asia-east2",
  },
  {
    stats: { min: 225, max: 243, mean: 232, median: 229 },
    endpoint: "asia-northeast1",
  },
  {
    stats: { min: 1053, max: 1067, mean: 1057.2, median: 1054 },
    endpoint: "asia-northeast2",
  },
  {
    stats: { min: 1168, max: 1183, mean: 1172.8, median: 1171 },
    endpoint: "asia-northeast3",
  },
  {
    stats: { min: 340, max: 1723, mean: 894.8, median: 340 },
    endpoint: "asia-south1",
  },
  {
    stats: { min: 1813, max: 1864, mean: 1849.8, median: 1855 },
    endpoint: "asia-south2",
  },
  {
    stats: { min: 279, max: 1366, mean: 930.6, median: 1366 },
    endpoint: "asia-southeast1",
  },
  {
    stats: { min: 1436, max: 1440, mean: 1438.4, median: 1439 },
    endpoint: "asia-southeast2",
  },
  {
    stats: { min: 267, max: 1238, mean: 848.2, median: 1238 },
    endpoint: "australia-southeast1",
  },
  {
    stats: { min: 1305, max: 1332, mean: 1317.8, median: 1315 },
    endpoint: "australia-southeast2",
  },
  {
    stats: { min: 707, max: 725, mean: 712, median: 709 },
    endpoint: "europe-central2",
  },
  {
    stats: { min: 198, max: 779, mean: 645, median: 752 },
    endpoint: "europe-north1",
  },
  {
    stats: { min: 596, max: 651, mean: 620.6, median: 605 },
    endpoint: "europe-southwest1",
  },
  {
    stats: { min: 163, max: 200, mean: 172.6, median: 166 },
    endpoint: "europe-west1",
  },
  {
    stats: { min: 655, max: 671, mean: 661.8, median: 661 },
    endpoint: "europe-west10",
  },
  {
    stats: { min: 688, max: 714, mean: 702.8, median: 705 },
    endpoint: "europe-west12",
  },
  {
    stats: { min: 149, max: 581, mean: 325.6, median: 167 },
    endpoint: "europe-west2",
  },
  {
    stats: { min: 169, max: 655, mean: 556.2, median: 652 },
    endpoint: "europe-west3",
  },
  {
    stats: { min: 162, max: 647, mean: 451.8, median: 642 },
    endpoint: "europe-west4",
  },
  {
    stats: { min: 173, max: 692, mean: 582.6, median: 684 },
    endpoint: "europe-west6",
  },
  {
    stats: { min: 697, max: 712, mean: 704.4, median: 706 },
    endpoint: "europe-west8",
  },
  {
    stats: { min: 161, max: 604, mean: 514.6, median: 602 },
    endpoint: "europe-west9",
  },
  { stats: { min: 63, max: 128, mean: 92.6, median: 89 }, endpoint: "global" },
  {
    stats: { min: 304, max: 949, mean: 557, median: 305 },
    endpoint: "me-central1",
  },
  {
    stats: { min: 265, max: 1161, mean: 646.2, median: 356 },
    endpoint: "me-central2",
  },
  {
    stats: { min: 882, max: 905, mean: 897.2, median: 901 },
    endpoint: "me-west1",
  },
  {
    stats: { min: 87, max: 214, mean: 143.8, median: 214 },
    endpoint: "northamerica-northeast1",
  },
  {
    stats: { min: 103, max: 255, mean: 222.2, median: 254 },
    endpoint: "northamerica-northeast2",
  },
  {
    stats: { min: 178, max: 187, mean: 182.2, median: 182 },
    endpoint: "southamerica-east1",
  },
  {
    stats: { min: 862, max: 1051, mean: 902, median: 863 },
    endpoint: "southamerica-west1",
  },
  {
    stats: { min: 94, max: 101, mean: 97.4, median: 96 },
    endpoint: "us-central1",
  },
  { stats: { min: 61, max: 68, mean: 65.4, median: 66 }, endpoint: "us-east1" },
  { stats: { min: 70, max: 80, mean: 74.6, median: 75 }, endpoint: "us-east4" },
  {
    stats: { min: 181, max: 203, mean: 191.4, median: 192 },
    endpoint: "us-east5",
  },
  {
    stats: { min: 226, max: 230, mean: 227.8, median: 228 },
    endpoint: "us-south1",
  },
  {
    stats: { min: 129, max: 449, mean: 193.6, median: 130 },
    endpoint: "us-west1",
  },
  {
    stats: { min: 123, max: 429, mean: 362.6, median: 424 },
    endpoint: "us-west2",
  },
  {
    stats: { min: 366, max: 373, mean: 370.6, median: 372 },
    endpoint: "us-west3",
  },
  {
    stats: { min: 392, max: 419, mean: 400.8, median: 399 },
    endpoint: "us-west4",
  },
].sort((a, b) => a.stats.mean - b.stats.mean).slice(0,10);

module.exports = async function () {
  const labels = [];
  const datasets = [
    { label: "Min", data: [] },
    { label: "Median", data: [] },
    { label: "Mean", data: [] },
    { label: "Max", data: [] },
  ];

  for (const { stats, endpoint } of data) {
    labels.push(endpoint);
    datasets[0].data.push(stats.min);
    datasets[1].data.push(stats.median);
    datasets[2].data.push(stats.mean);
    datasets[3].data.push(stats.max);
  }

  const config = {
    title: "Latency in milliseconds per request",
    data: { labels, datasets },
    options: {
      scales: {
        yAxes: [
          {
            ticks: {
              callback: function (value) {
                return `${value} ms/req`;
              },
            },
          },
        ],
      },
    },
  };

  const chart = new ChartJsImage();
  chart.setWidth(700);
  chart.setHeight(300);
  chart.setDevicePixelRatio(2);

  chart.setConfig({
    type: "bar",
    ...config,
  });

  const url = await chart.getShortUrl();

  return { chart: url };
};
