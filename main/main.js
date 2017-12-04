import * as d3 from 'd3';
import * as topojson from 'topojson';

const w = 1000;
const h = 800;
const margin = {	top: 20,	bottom: 20,	left: 20,	right: 20 };

const width = w - margin.left - margin.right;
const height = h - margin.top - margin.bottom;

const svg = d3.select("display").append("svg")
						.attr("width", w)
						.attr("height", h);

const path = d3.geoPath();

d3.queue()
	.defer(d3.json, '../data/state.wage_data');


// Template from https://bl.ocks.org/mbostock/4090848
d3.json("https://d3js.org/us-10m.v1.json", function(error, us) {
  if (error) throw error;

  svg.append("g")
      .attr("class", "states")
    .selectAll("path")
    .data(topojson.feature(us, us.objects.states).features)
    .enter().append("path")
      .attr("d", path);

  svg.append("path")
      .attr("class", "state-borders")
      .attr("d", path(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; })));
});
