import * as d3 from 'd3';
import * as topojson from 'topojson';

const w = 1000;
const h = 800;
const margin = {	top: 20,	bottom: 20,	left: 20,	right: 20 };

const width = w - margin.left - margin.right;
const height = h - margin.top - margin.bottom;

const projection =  d3.geoAlbersUsa()
						.translate([width/2, height/2])
						.scale([1000]);

const path = d3.geoPath()
				.projection(projection);
//
// //This is the main map element
const svg = d3.select(".map-container")
				.append("svg")
				.attr("height", height)
				.attr("width", width);
				// .call(d3.zoom().on("zoom", function () {
				//   svg.attr("transform", d3.event.transform);
				// 	}));

// //This is the tooltip element
var tooltip = d3.select(".map-container").append("div")
                .attr("class", "tooltip")
				.style("opacity", 0);
				
	tooltip.append("div")
	    .attr("class", "average-salary");
	tooltip.append("div")
	    .attr("class", "median-salary");
	tooltip.append("div")
			.attr("class", "total-employee");

//Reading CSV file
let averageSalarybyState = {};
let medianSalarybyState = {};
let totalEmployeebyState = {};

d3.csv("./data/state_wage_data2.csv", function(data){
	data.forEach( function(d){
		averageSalarybyState[d.STATE] = Number(d.A_MEAN);
		medianSalarybyState[d.STATE] = Number(d.A_MEDIAN);
		totalEmployeebyState[d.STATE] = Number(d.TOT_EMP);
	});
});

var max = d3.max(d3.entries(averageSalarybyState), function(d) {
    return d3.max(d3.entries(d.value), function(e) {
        return d3.max(e.value);
    });
});

console.log(max);

// Template from https://bl.ocks.org/mbostock/4090848
// d3.json("https://d3js.org/us-10m.v1.json", function(error, us) {
d3.json("data/us_states_map.json", function(error, us) {
  if (error) throw error;

	  svg.append("g")
	      .attr("class", "states")
	    .selectAll("path")
	    .data(topojson.feature(us, us.objects.states).features)
	    .enter()
				.append("path")
	      .attr("d", path)
				.on("mouseover", function(d, i){
					d3.select(this).style("fill", "yellow");
					console.log(tooltip);

					tooltip.transition().duration(250)
               .style("opacity", 1);
					d3.select(".average-salary").html("d3 selected element");
					tooltip.select(".average-salary").html("lalalalallalala");
					//tooltip.style("display", "inline-block");
					tooltip.style("display", "inline");
				})
				.on("mousemove", function(d, i){
					let xPos = d3.mouse(this)[0] - 15;
					let yPos = d3.mouse(this)[1] - 55;
					// console.log("move", xPos, yPos);
					// tooltip.attr("transform", "translate(" + xPos + "," + yPos + ")");
					// tooltip.select("text").text("hello");
					return tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");
				})
				.on("mouseout", function(d, i){
					d3.select(this)
	          .transition()
	          .duration(250)
	          .ease(d3.easeLinear)
	          .style("opacity", 0.75);
						d3.select(this).style("fill", "black");
	        	tooltip.transition().duration(250)
	               .style("opacity", 0);
				});

	  svg.append("path")
	      .attr("class", "state-borders")
	      .attr("d", path(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; })));
});
