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
	.defer(d3.csv, "data/data2016.csv")
	.await(ready);

// Template from https://bl.ocks.org/mbostock/4090848
const colorScale = d3.scaleThreshold()
.domain([30000, 33000, 36000, 39000, 42000, 45000, 48000, 51000, 54000, 57000, 60000])
.range(['#90ee90','#81df80','#75ce73','#6cbf6b','#65ae67','#629c68','#618b6f','#62777c','#616194','#5745bb','#0000ff']);


const slider = d3.select(".slider")
					.on("input", function() {
						d3.select(".year-label").html("Current Year: " + this.value);
						updateYear(Number(this.value));
					});

function updateYear(year){
	d3.queue()
	.defer(d3.json, "data/us_states_map.json")
	.defer(d3.csv, `data/data${year}.csv`)
	.await(ready);
}

let states = [];
let averageSalarybyState = {};
let medianSalarybyState = {};
let totalEmployeebyState = {};

function ready(error, us, data) {
	// var g = svg.append("g")
    // .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
    // .append("g")
	// .attr("id", "states");

	// g.selectAll("text")
	// .data(topojson.feature(us, us.objects.states).features)
	// .enter()
	// .append("text")
	// .attr("transform", function (d) { return "translate(" + path.centroid(d) + ")"; })
	// .attr("dx", function (d) { return d.properties.dx || "0"; })
	// .attr("dy", function (d) { return d.properties.dy || "0.35em"; })
	// .text(function (d) { return d.properties.abbr; });

  if (error) throw error;


		data.forEach( function(d) {
			states.push(d.STATE);
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
					return colorScale(averageSalarybyState[d.properties.NAME]);
				})
				.on("mouseover", function(d, i){
					d3.select(this).style("fill", "yellow").transition().duration(300).style("cursor", "pointer").style("display", "block");
					//Tooltip transitions
					tooltip.transition().duration(350).style("opacity", 1);
					tooltip.select(".state-abbr").html(d.properties.STUSPS);
					tooltip.select(".average-salary").html("Avg. salary: " + averageSalarybyState[d.properties.NAME]);
					tooltip.select(".median-salary").html("Median Salary: " + medianSalarybyState[d.properties.NAME]);
					tooltip.select(".total-employee").html("Total Employee: " + totalEmployeebyState[d.properties.NAME]);
				})
				.on("mousemove", function(d, i){
					return tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");
				})
				.on("mouseout", function(d, i){
					d3.select(this)
						.transition()
						.duration(250)
						.ease(d3.easeLinear)
						.style("opacity", 1)
						.style("fill", function(d){
							return colorScale(averageSalarybyState[d.properties.NAME]);
						});
					tooltip.transition().duration(350).style("opacity", 0);
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
				updateStats(d3.event.target.value);
			});

			d3.select(".stats-container").append("div").attr("class", "state-label").text("Current State: ");
			d3.select(".stats-container").append("div").attr("class", "avg-salary").text("Average Salary: ");
			d3.select(".stats-container").append("div").attr("class", "med-salary").text("Median Salary: ");
			d3.select(".stats-container").append("div").attr("class", "tot-emp").text("Total Employee: ");
			updateStats("Alabama");
}


function updateStats(state){
	const st = d3.select(".state-label");
	st.text("Selected State: " + state);
	st.exit().remove();

	const avg_sal = d3.select(".avg-salary");
	avg_sal.text("Average Salary: " + (averageSalarybyState["California"] - averageSalarybyState[state]));

	const med_sal = d3.select(".med-salary");
	med_sal.text("Median Salary: " + (medianSalarybyState["California"] - medianSalarybyState[state]));

	const tot_emp = d3.select(".tot-emp");
	tot_emp.text("Total Employee: " + (totalEmployeebyState["California"] - totalEmployeebyState[state]));
}

const sideBar = d3.select('.map-container')
.append('div')
.attr("class", "side-bar");

const legend = sideBar.append("g")
.attr("class", "legend-container")
// .attr("transform", "translate(" + (width) + "," + 20 + ")")
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
	.attr("casss", "stats-label")
	.text("Variance from California");

const select = d3.select(".stats-container")
									.append("select")
									.attr("type", "select");

//Footer
d3.select(".side-bar")
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
