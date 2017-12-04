import * as d3 from 'd3';
import * as topojson from 'topojson';

var w = 1000;
var h = 800;
var margin = {	top: 20,	bottom: 20,	left: 20,	right: 20 };

var width = w - margin.left - margin.right;
var height = h - margin.top - margin.bottom;

var svg = d3.select("body").append("svg")
						.attr("width", w)
						.attr("height", h);

var path = d3.geoPath();


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
