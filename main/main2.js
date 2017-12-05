import * as d3 from 'd3';
import * as topojson from 'topojson';

const w = 1000;
const h = 800;
const margin = {	top: 20,	bottom: 20,	left: 20,	right: 20 };

const width = w - margin.left - margin.right;
const height = h - margin.top - margin.bottom;

//Not used
const projection =  d3.geoAlbersUsa()
										.translate([width/2, height/2])
										.scale([1000]);

const path = d3.geoPath()
							.projection(projection);
//
// //This is the main map element
const svg = d3.select("svg");
							// .call(d3.zoom().on("zoom", function () {
						  //   svg.attr("transform", d3.event.transform);
						 	// 	}));

// //This is the tooltip element
const tooltip = d3.select("map")
								.append("div")
								.classed("tooltip", true);

	tooltip.append("div")
	    .attr("class", "average-salary");
	tooltip.append("div")
	    .attr("class", "median-salary");
	tooltip.append("div")
			.attr("class", "total-employee");

//Mouse on and off ineractions
function handleMouseOn(d, i) {}

function handleMouseOut(d, i) {}
//Reading CSV file::
d3.csv("./data/state_wage_data2.csv", function(data){
	let averageSalarybyState = {};
	let medianSalarybyState = {};
	let totalEmployeebyState = {};
	data.forEach( function(d){
		averageSalarybyState[d.STATE] = Number(d.A_MEAN);
		medianSalarybyState[d.STATE] = Number(d.A_MEDIAN);
		totalEmployeebyState[d.STATE] = Number(d.TOT_EMP);
	});
	console.log(medianSalarybyState);
	console.log(averageSalarybyState);
});

// Template from https://bl.ocks.org/mbostock/4090848
// d3.json("https://d3js.org/us-10m.v1.json", function(error, us) {
d3.json("../data/us_states_map.json", function(error, us) {
  if (error) throw error;

  svg.append("g")
      .attr("class", "states")
	    .selectAll("path")
	    .data(topojson.feature(us, us.objects.states).features)
	    .enter()
				.append("path")
		    .attr("d", path);

  svg.append("path")
      .attr("class", "state-borders")
      .attr("d", path(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; })));
});
