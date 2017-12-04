import * as d3 from 'd3';
import * as topojson from 'topojson';

const w = 1000;
const h = 800;
const margin = {	top: 20,	bottom: 20,	left: 20,	right: 20 };

const width = w - margin.left - margin.right;
const height = h - margin.top - margin.bottom;



const projection =  d3.geoAlbersUsa()
										.translate([width/2, height/2])
										.scale([500]);

const path = d3.geoPath()
							.projection(projection);

//This is the main map element
const svg = d3.select("map")
	.append("svg")
	.attr("width", w)
	.attr("height", h);

//This is the tooltip element
const div = d3.select("map")
								.append("div")
								.classed("tooltip", true);

//Reading CSV file::
// d3.csv("./data/state_wage_data.csv", function(data){
// 	let averageSalarybyState = {};
// 	let temp1 = {};
// 	let temp2 = {};
// 	data.forEach( function(d){
// 			averageSalarybyState[d.STATE] = Number(d.TOT_EMP);
// 			averageSalarybyState[d.STATE] = Number(d.A_MEDIAN);
// 	});
// 	console.log(data[0]);
// 	console.log(averageSalarybyState);
// 	console.log(temp1);
// });

d3.csv("./data/state_wage_data2.csv", function(data){
	let averageSalarybyState = {};
	let temp1 = {};
	data.forEach( function(d){
		// console.log(d.STATE);
		averageSalarybyState[d.STATE] = Number(d.TOT_EMP);
		temp1[d.STATE] = d.TOT_EMP;
	});
	console.log(data);
	console.log(averageSalarybyState);
	console.log(temp1);
});


// d.OCC_TITLE = +d.OCC_TITLE;
// d.ST = +d.ST;
// d.STATE = +d.STATE;
// d.TOT_EMP = d.TOT_EMP;


// Template from https://bl.ocks.org/mbostock/4090848
// d3.json("https://d3js.org/us-10m.v1.json", function(error, us) {
//   if (error) throw error;
//
//   svg.append("g")
//       .attr("class", "states")
//     .selectAll("path")
//     .data(topojson.feature(us, us.objects.states).features)
//     .enter().append("path")
//       .attr("d", path);
//
//   svg.append("path")
//       .attr("class", "state-borders")
//       .attr("d", path(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; })));
// });
