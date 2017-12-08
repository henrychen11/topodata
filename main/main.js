import * as d3 from 'd3';
import * as topojson from 'topojson';

const w = 800;
const h = 500;
const margin = {	top: 0,	bottom: 0,	left: 10,	right: 10 };

const width = w - margin.left - margin.right;
const height = h - margin.top - margin.bottom;

const projection =  d3.geoAlbersUsa()
						.translate([width/2, height/2])
						.scale([1000]);

const path = d3.geoPath()
				.projection(projection);

// //This is the main map element
const svg = d3.select(".map-container")
				.append("svg")
				.attr("height", height)
				.attr("width", width);

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
	tooltip.append("div")
			.attr("class", "average-hour");
	tooltip.append("div")
			.attr("class", "median-hour");
	tooltip.append("div")
			.attr("class", "error");

const format = d3.format(",");

d3.queue()
	.defer(d3.json, "data/us_states_map.json")
	.defer(d3.csv, "data/data2016.csv")
	.await(ready);

	let states = [];
	let hoveredState;
	let averageSalarybyState = {};
	let medianSalarybyState = {};
	let totalEmployeebyState = {};
	let hourMean = {};
	let hourMedian = {};
	let meanRSE = {};
	let userSelect;

	function ready(error, us, data) {
	  if (error) throw error;
			data.forEach( function(d) {
				states.push(d.STATE);
				averageSalarybyState[d.STATE] = Number(d.A_MEAN);
				medianSalarybyState[d.STATE] = Number(d.A_MEDIAN);
				totalEmployeebyState[d.STATE] = Number(d.TOT_EMP);
				hourMean[d.STATE] = Number(d.H_MEAN);
				hourMedian[d.STATE] = Number(d.H_MEDIAN);
				meanRSE[d.STATE] = Number(d.MEAN_PRSE);
			});

		  svg.append("g")
		      .attr("class", "states")
				.selectAll("path")
				.data(topojson.feature(us, us.objects.states).features)
				.enter()
					.append("path")
					.attr("d", path)
					.style("fill", function(d){
						return colorScale(averageSalarybyState[d.properties.NAME]);
					})
					.on("mouseover", function(d, i){
						d3.select(this).style("fill", "yellow").transition().duration(300).style("cursor", "pointer").style("display", "block");
						//Updating Stats Box
						hoveredState = d.properties.NAME;
						updateStats(userSelect, hoveredState);
						//Tooltip transitions
						tooltip.transition().duration(350).style("opacity", 1);
						tooltip.select(".state-abbr").html(d.properties.NAME);
						tooltip.select(".average-salary").html("Avg. salary: $" + format(averageSalarybyState[d.properties.NAME]));
						tooltip.select(".median-salary").html("Median Salary: $" + format(medianSalarybyState[d.properties.NAME]));
						tooltip.select(".total-employee").html("Total Employee: " + format(totalEmployeebyState[d.properties.NAME]));
						tooltip.select(".average-hour").html("Avg. salary (h): $" + format(hourMean[d.properties.NAME]));
						tooltip.select(".median-hour").html("Median salary (h): $" + format(hourMedian[d.properties.NAME]));
						tooltip.select(".error").html("% Relative Standard Error: " + format(meanRSE[d.properties.NAME]));
					})
					.on("mousemove", function(d, i){
						return tooltip.style("top", (d3.event.pageY+20)+"px").style("left",(d3.event.pageX+15)+"px");
					})
					.on("mouseout", function(d, i){
						d3.select(this)
							.transition()
							.duration(300)
							.ease(d3.easeLinear)
							.style("opacity", 1)
							.style("fill", function(d){
								return colorScale(averageSalarybyState[d.properties.NAME]);
							});
						tooltip.transition().duration(300).style("opacity", 0);
						});

		  svg.append("path")
		      .attr("class", "state-borders")
			  .attr("d", path(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; })));
				const select = d3.select(".stats-container")
													.append("select")
													.attr("type", "select");

				const options = select
														.selectAll("option")
														.data(states)
														.enter()
															.append("option")
															.text(function(d) {return d;});

						select.on("change", function() {
							userSelect = d3.event.target.value;
							updateStats(userSelect, hoveredState);
						});
				d3.select(".stats-container").append("div").attr("class", "state-label");
				d3.select(".stats-container").append("div").attr("class", "custom-text").text("Hovered State")

				d3.select(".stats-container").append("div").attr("class", "avg-salary");
				d3.select(".stats-container").append("div").attr("class", "custom-text").text("Average Salary");

				d3.select(".stats-container").append("div").attr("class", "med-salary").text("Median Salary");
				d3.select(".stats-container").append("div").attr("class", "custom-text").text("Median Salary");

				d3.select(".stats-container").append("div").attr("class", "tot-emp").text("Total Employees");
				d3.select(".stats-container").append("div").attr("class", "custom-text").text("Total Employees");
				updateStats(userSelect="Alabama", hoveredState="Alabama");
	}

// Template from https://bl.ocks.org/mbostock/4090848
const colorScale = d3.scaleThreshold()
.domain([30000, 33000, 36000, 39000, 42000, 45000, 48000, 51000, 54000, 57000, 60000])
.range(['#f0e68c','#ddcf8b','#cab98a','#b7a388','#a48d86','#917883','#7d6380','#69507c','#533d78','#3b2a74','#191970']);


const slider = d3.select(".slider")
					.on("input", function() {
						d3.select(".year-label").html("Current Year: " + this.value);
						updateYear(Number(this.value));
						updateStats(userSelect, hoveredState);
					});

function updateYear(year){
	d3.queue()
	.defer(d3.json, "data/us_states_map.json")
	.defer(d3.csv, `data/data${year}.csv`)
	.await(ready2);
}
function ready2(error, us, data) {
  if (error) throw error;
	data.forEach( function(d) {
		states.push(d.STATE);
		averageSalarybyState[d.STATE] = Number(d.A_MEAN);
		medianSalarybyState[d.STATE] = Number(d.A_MEDIAN);
		totalEmployeebyState[d.STATE] = Number(d.TOT_EMP);
		hourMean[d.STATE] = Number(d.H_MEAN);
		hourMedian[d.STATE] = Number(d.H_MEDIAN);
		meanRSE[d.STATE] = Number(d.MEAN_PRSE);
	});

	  svg.append("g")
	      .attr("class", "states")
			.selectAll("path")
			.data(topojson.feature(us, us.objects.states).features)
			.enter()
				.append("path")
				.attr("d", path)
				.style("fill", function(d){
					return colorScale(averageSalarybyState[d.properties.NAME]);
				})
				.on("mouseover", function(d, i){
					d3.select(this).style("fill", "yellow").transition().duration(300).style("cursor", "pointer").style("display", "block");
					//Stats container update
					hoveredState = d.properties.NAME;
					updateStats(userSelect, hoveredState);
					//Tooltip transitions
					tooltip.transition().duration(350).style("opacity", 1);
					tooltip.select(".state-abbr").html(d.properties.NAME);
					tooltip.select(".average-salary").html("Avg. salary: $" + format(averageSalarybyState[d.properties.NAME]));
					tooltip.select(".median-salary").html("Median Salary: $" + format(medianSalarybyState[d.properties.NAME]));
					tooltip.select(".total-employee").html("Total Employee: " + format(totalEmployeebyState[d.properties.NAME]));
					tooltip.select(".average-hour").html("Avg. salary (h): $" + format(hourMean[d.properties.NAME]));
					tooltip.select(".median-hour").html("Median salary (h): $" + format(hourMedian[d.properties.NAME]));
					tooltip.select(".error").html("% Relative Standard Error: " + format(meanRSE[d.properties.NAME]));
				})
				.on("mousemove", function(d, i){
					return tooltip.style("top", (d3.event.pageY+20)+"px").style("left",(d3.event.pageX+15)+"px");
				})
				.on("mouseout", function(d, i){
					d3.select(this)
						.transition()
						.duration(300)
						.ease(d3.easeLinear)
						.style("opacity", 1)
						.style("fill", function(d){
							return colorScale(averageSalarybyState[d.properties.NAME]);
						});
					tooltip.transition().duration(300).style("opacity", 0);
					});

	  svg.append("path")
	      .attr("class", "state-borders")
		  .attr("d", path(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; })));

		const options = select
												.selectAll("option")
												.data(states)
												.enter()
													.append("option")
													.text(function(d) {return d;});

				select.on("change", function() {
					userSelect = d3.event.target.value;
					updateStats(userSelect, hoveredState);
				});
}

const select = d3.select(".stats-container")
									.append("select")
									.attr("type", "select");

function updateStats(selectedState, userHoveredState){
	const st = d3.select(".state-label");
	st.text(userHoveredState);
	st.exit().remove();

	const avg_sal = d3.select(".avg-salary");
	avg_sal.text("$" + format(averageSalarybyState[selectedState] - averageSalarybyState[userHoveredState])).style("color", function(){
		if ((medianSalarybyState[selectedState] - medianSalarybyState[userHoveredState]) > 0){
			return "green";
		} else if ((medianSalarybyState[selectedState] - medianSalarybyState[userHoveredState]) < 0) {
			return "red";
		}});
	avg_sal.exit().remove();

	const med_sal = d3.select(".med-salary");
	med_sal.text("$" + format(medianSalarybyState[selectedState] - medianSalarybyState[userHoveredState])).style("color", function(){
		if ((medianSalarybyState[selectedState] - medianSalarybyState[userHoveredState]) > 0){
			return "green";
		} else if ((medianSalarybyState[selectedState] - medianSalarybyState[userHoveredState]) < 0) {
			return "red";
		}});
	med_sal.exit().remove();

	const tot_emp = d3.select(".tot-emp");
	tot_emp.text(format(totalEmployeebyState[selectedState] - totalEmployeebyState[userHoveredState]));
	tot_emp.exit().remove();
}

const sideBar = d3.select('.map-container')
.append('div')
.attr("class", "side-bar");

const legend = sideBar.append("g")
.attr("class", "legend-container")
.selectAll("g")
.data([30000, 33000, 36000, 39000, 42000, 45000, 48000, 51000, 54000, 57000, 60000])
.enter().append("g").attr("class", "legend");

//Legend position
legend.append("div")
.attr("class", "legend-text")
.text(function(d) {
	return "$" + d3.format(",")(d);
	});

legend.append("div")
.attr("class", "legend-color")
.style("background-color", function(d, i){
	return colorScale(d);
});

//Stats Bar
d3.select(".side-bar")
	.append("div")
	.attr("class", "stats-container");

d3.select(".stats-container")
	.append("div")
	.attr("class", "stats-label")
	.text("Variance From: ");

//Footer
d3.select(".navbar")
	.append("div")
	.attr("class", "footer");

d3.select(".footer")
	.append("div")
	.attr("class", "footer-logo")
	.html('<a href="http://github.com/henrychen11" target="_blank"><i class="fa fa-github" aria-hidden="true"></i></a>');

d3.select(".footer")
	.append("div")
	.attr("class", "footer-logo")
	.html('<a href="http://www.linkedin.com/in/henrychen11/" target="_blank"><i class="fa fa-linkedin-square" aria-hidden="true"></i>');
