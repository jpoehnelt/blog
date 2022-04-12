const D3Node = require("d3-node");
const d3 = require("d3");
const prettier = require("prettier");

module.exports = function ({data, margin}) {

  //set up svg using margin conventions - we'll need plenty of room on the left for labels
  margin = margin ?? {
    right: 80,
    left: 80,
  };

  const width = 1000,
    height = data.length * 60;

  const d3n = new D3Node();
  const svg = d3n.createSVG();
  svg
    .attr("class", "bar-chart")
    .attr("viewBox", `0 0 ${width}, ${height}`)

  const x = d3
    .scaleLinear()
    .range([0, width - margin.left - margin.right])
    .domain([
      40,
      d3.max(data, function (d) {
        return d.value;
      }),
    ]);

  const y = d3
    .scaleBand()
    .domain(data.map((d) => d.name))
    .range([0, height])
    .paddingInner(0.1)
    .paddingOuter(0.1)
    .round(true);

  const bars = svg.selectAll(".bar").data(data).enter().append("g");

  bars
    .append("rect")
    .attr("class", "bar")
    .attr("y", function (d) {
      return y(d.name);
    })
    .attr("height", y.bandwidth())
    .attr("x", margin.left)
    .attr("width", function (d) {
      return x(d.value);
    });

  bars
    .append("text")
    .attr("class", "bar-label")
    .attr("y", function (d) {
      return y(d.name) + y.step() / 2 + 5;
    })
    .attr("x", function (d) {
      return 3;
    })
    .text(function (d) {
      return d.name;
    });

  bars
    .append("text")
    .attr("class", "bar-value")
    .attr("y", function (d) {
      return y(d.name) + y.step() / 2 + 5;
    })
    .attr("x", function (d) {
      return x(d.value) + 5 + margin.left;
    })
    .text(function (d) {
      return `${Math.round(d.value * 0.000621371).toLocaleString(
        "en-US"
      )}`;
    });

  return `<div>${prettier.format(d3n.svgString(), { parser: "html" })}</div>`;
};
