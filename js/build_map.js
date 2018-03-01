// Width and height
var chart_width     =   1000;
var chart_height    =   700;

// Projection
var projection = albersUsaPr()
    .scale([1200])
    // default is .rotate([96,0]) to center on US (we want this)
    .translate([chart_width / 2, chart_height / 2]);
var buildPath = d3.geoPath()
    .projection(projection);
    
//Create container
var container = d3.select('body')
  .append('div')
  .attr('id', 'content-container');

// circle scale
var scaleCircles = d3.scaleSqrt()
  .range([0, 20])

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

// Datasets
var stateData, stateDict, countyDict;
var countyData = new Map();

d3.queue()
  .defer(d3.json, "data/state_boundaries.geojson")
  .defer(d3.json, "data/states.json")
  .defer(d3.json, "data/counties.json") // could load this later
  .defer(d3.json, "data/county_centroids.json")
  .await(create_map);

// dummy var for now
var years = [1950, 1960, 1965, 1970, 1980, 1990, 1995, 2000, 2005, 2010, 2015];

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
	// so in this case, all of the results from q.await
	stateData = arguments[1];
	stateDict = arguments[2];
	countyDict = arguments[3];
	countyCentroids = arguments[4];
	
  addStates(map, stateData, stateDict);
  addCentroids(map, countyCentroids);
  
  // get started downloading county data right away.
  // for now, pretend that we know that state '01' is the most likely state
  // for the user to click on; we could make this dynamic in the future.
  loadCountyData("AL", function(error, data) {
    if (error) throw error;
  });

}

var tempCategories = ["Total", "Thermoelectric", "Public Supply", "Irrigation", "Industrial"];

var buttonContainer = d3.select('#content-container')
  .append('div')
  .attr('id', 'button-container');
  
buttonContainer.append('div').classed('select-arrowbox', true);

var categorySelect = d3.select('#button-container')
  .append('select')
  .classed('category-select', true);
  
var categorySelectOptions = d3.select('.category-select')
  .selectAll('option')
  .data(tempCategories)
  .enter()
  .append('option')
  .attr('value', function(d){
    return d;
  })
  .text(function(d){
    return d;
  });
  
var categoryButtons = d3.select('#button-container')
  .selectAll('button')
  .data(tempCategories)
  .enter()
  .append('button')
  .text(function(d){
    return d;
  })
  .attr('class', function(d){
    var name = d.split(' ');
    if(name[1]){
      return (name[0]+name[1]).toLowerCase();
    }else{
      return name[0].toLowerCase();
    }
  })
  .on('click', function(d){
    updateCategory(d.toLowerCase());
  });
