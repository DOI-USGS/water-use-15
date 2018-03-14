// Width and height
var chart_width     =   1000;
var chart_height    =   700;

// define categories
var tempCategories = ["total", "thermoelectric", "publicsupply", "irrigation", "industrial"];

// Projection
var projection = albersUsaTerritories()
    .scale([1200])
    .translate([chart_width / 2, chart_height / 2]);
    // default is .rotate([96,0]) to center on US (we want this)
    
var buildPath = d3.geoPath()
    .projection(projection);
    
//Create container
var container = d3.select('body')
  .append('div')
  .attr('id', 'content-container');

// circle scale
var scaleCircles = d3.scaleSqrt()
  .range([0, 20]);

// hard-coded for now. Need to get scaling to be shared still.
var minWateruse = 0,
    maxWateruse = 3331;

// Setup tooltips
var tooltipDiv = d3.select("body").append("div")
      .classed("tooltip hidden", true);

// Create SVG
var svg = d3.select("#content-container")
    .append("svg")
    .attr('viewBox', '0 0 ' + chart_width + ' ' + chart_height + '')
	  .attr('preserveAspectRatio', 'xMidYMid');

var map = svg.append("g")
  .attr("id", "map");

var mapBackground = map.append("rect")
  .attr("id", "map-background")
  .attr("width", chart_width)
  .attr("height", chart_height)
  .on('click', zoomToFromState);

// add legend
addLegend(minWateruse, maxWateruse);

// Datasets
var stateData, stateDict, countyDict;
var countyData = new Map();

d3.queue()
  .defer(d3.json, "data/state_boundaries_USA.json")
  .defer(d3.json, "data/county_centroids_wu.json")
  .await(create_map);

// Zoom status: default is nation-wide
var activeView = getHash('view');
if(!activeView) activeView = 'USA';

// Water use category: default is total. To make these readable in the URLs,
// let's use full-length space-removed lower-case labels, e.g. publicsupply and thermoelectric
var activeCategory = getHash('category');
if(!activeCategory) activeCategory = 'total';

svg.append("text")
  .attr("id", "maptitle")
  .attr("x", chart_width/2)
  .attr("y", chart_height*0.10); // bring in 10% of chart height

// Initialize page info
updateTitle();
setHash('view', activeView);
setHash('category', activeCategory);

function create_map() {

  // arguments[0] is the error
	var error = arguments[0];
	if (error) throw error;

	// the rest of the indices of arguments are all the other arguments passed in -
	// so in this case, all of the results from q.await. Immediately convert to
	// geojson so we have that converted data available globally.
	stateData = topojson.feature(arguments[1], arguments[1].objects.states);
	countyCentroids = topojson.feature(arguments[2], arguments[2].objects.foo);
	
  addStates(map, stateData);
  addCentroids(map, countyCentroids);
  
  // get started downloading county data right away.
  // for now, pretend that we know that state '01' is the most likely state
  // for the user to click on; we could make this dynamic in the future.
  loadCountyData("AL", function(error, data) {
    if (error) throw error;
  });

}

var buttonContainer = d3.select('#content-container')
  .append('div')
  .attr('id', 'button-container');
  
buttonContainer.append('div').classed('select-arrowbox', true);
  
var categoryButtons = d3.select('#button-container')
  .selectAll('button')
  .data(tempCategories)
  .enter()
  .append('button')
  .text(function(d){
    return categoryToName(d);
  })
  .attr('class', function(d){
    return d;
  })
  .on('click', function(d){
    activeCategory = d.toLowerCase(); // put this here so it only changes on click
    updateCategory(activeCategory);
  })
  .on('mouseover', function(d){
    updateCategory(d.toLowerCase());
  })
  .on('mouseout', function(d){
    updateCategory(activeCategory);
  });
