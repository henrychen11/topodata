import * as d3 from 'd3';
import * as topojson from 'topojson';

const w = 1000;
const h = 600;
const margin = {	top: 10,	bottom: 10,	left: 10,	right: 10 };

const width = w - margin.left - margin.right;
const height = h - margin.top - margin.bottom;

const projection =  d3.geoAlbersUsa()
						.translate([width/2, height/2])
						.scale([1200]);

const path = d3.geoPath()
				.projection(projection);

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
			.attr("class", "state-name");
	tooltip.append("div")
			.attr("class", "state-abbr");
	tooltip.append("div")
	    .attr("class", "average-salary");
	tooltip.append("div")
	    .attr("class", "median-salary");
	tooltip.append("div")
			.attr("class", "total-employee");

d3.queue()
	.defer(d3.json, "data/us_states_map.json")
	.defer(d3.csv, "data/state_wage_data2.csv")
	.await(ready);

// Template from https://bl.ocks.org/mbostock/4090848
const colorScale = d3.scaleThreshold()
.domain([10000, 20000, 30000, 40000, 50000, 60000, 70000, 80000, 90000])
.range(['#ffffe0','#e1ebc3','#c4d7a7','#a7c38c','#8ab070','#6e9d56','#51893c','#317722','#006400']);

function ready(error, us, data) {
  if (error) throw error;
		let averageSalarybyState = {};
		let medianSalarybyState = {};
		let totalEmployeebyState = {};
		data.forEach( function(d) {
			averageSalarybyState[d.STATE] = Number(d.A_MEAN);
			medianSalarybyState[d.STATE] = Number(d.A_MEDIAN);
			totalEmployeebyState[d.STATE] = Number(d.TOT_EMP);
		});

	  svg.append("g")
	      .attr("class", "states")
			.selectAll("path")
			.data(topojson.feature(us, us.objects.states).features)
			.enter()
				.append("path")
				.attr("d", path)
				.style("fill", function(d){
					return colorScale(averageSalarybyState[d.properties.NAME])
				})
				.on("mouseover", function(d, i){
					d3.select(this).style("fill", "yellow").transition().duration(300).style("cursor", "pointer").style("display", "block")
					//Tooltip transitions
					tooltip.transition().duration(350).style("opacity", 1);
					tooltip.select(".state-name").html(d.properties.NAME);
					tooltip.select(".state-abbr").html(d.properties.STUSPS);
					tooltip.select(".average-salary").html("Avg. salary: " + averageSalarybyState[d.properties.NAME]);
					tooltip.select(".median-salary").html("Median Salary: " + medianSalarybyState[d.properties.NAME]);
					tooltip.select(".total-employee").html("Total Population: " + totalEmployeebyState[d.properties.NAME]);
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
						.style("opacity", 1)
						.style("fill", function(d){
							return colorScale(averageSalarybyState[d.properties.NAME])
						});
					tooltip.transition().duration(350).style("opacity", 0);
					});

	  svg.append("path")
	      .attr("class", "state-borders")
		  .attr("d", path(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; })));

					
		  var color = d3.scaleOrdinal(d3.schemeCategory20b);

		  var legendRectSize = 18;
		  var legendSpacing = 4;

		  const sideBar = d3.select('.map-container')
							.append('div')
							.attr("class", "side-bar")

		const legend = svg.append("g")
							.attr("class", "legend")
							.attr("transform", "translate(" + (width - 100) + "," + 20 + ")")
							.selectAll("g")
							.data(["10000", "20000", "30000", "40000", "50000", "60000", "70000", "80000", "90000"])
							.enter().append("g")
							
		legend.append("text")
				.attr("y", function(d, i){
					return i * 30 + 5;
				})
				.attr("x", 5 )
				.text(function(d) {
					return d;
				})
									
};

//Adding the legend
	// var legend = d3.select(".map-container")
	// 				.append("div")
	// 				.attr("class", "legend")



	// .data([10000, 20000, 30000, 40000, 50000, 60000, 70000, 80000, 90000])
	// .enter()

