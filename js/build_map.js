// Width and height
var chart_width     =   1000;
var chart_height    =   700;

// define categories
var categories = ["total", "thermoelectric", "publicsupply", "irrigation", "industrial"];

// Projection
var projection = albersUsaTerritories()
  .scale([1200])
  .translate([chart_width / 2, chart_height / 2]);
  // default is .rotate([96,0]) to center on US (we want this)
    
var buildPath = d3.geoPath()
  .projection(projection);

// circle scale
var scaleCircles = d3.scaleSqrt()
  .range([0, 15]);
    
// Create container
var container = d3.select('body')
  .append('div')
  .classed('svg-container', true);

// Setup tooltips
var tooltipDiv = d3.select("body").append("div")
  .classed("tooltip hidden", true);

// Create SVG and map
var svg = d3.select(".svg-container")
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

// Globals
var activeView, activeCategory, prevCategory;
var stateBoundsUSA, stateBoundsZoom, countyBoundsUSA, countyCentroids;
var countyBoundsZoom = new Map();

// Set up some map info and map elements so we're ready to add data piece by piece
readHashes();
prepareMap();

// Read data and add to map
d3.queue()
  .defer(d3.json, "data/state_boundaries_USA.json")
  .defer(d3.tsv, "data/county_centroids_wu.tsv")
  .defer(d3.json, "data/wu_data_15_range.json")
  .await(fillMap);

// Add buttons  
addButtons();


/** Functions **/

function readHashes() {
  // Zoom status: default is nation-wide
  activeView = getHash('view');
  if(!activeView) activeView = 'USA';
  
  // Water use category: default is total. To make these readable in the URLs,
  // let's use full-length space-removed lower-case labels, e.g. publicsupply and thermoelectric
  activeCategory = getHash('category');
  if(!activeCategory) activeCategory = 'total';
  // default for prev is total
  prevCategory = 'total';
}

function prepareMap() {

  /** Add map elements **/
  
  // add placeholder groups for geographic boundaries and circles
  map.append('g').attr('id', 'county-bounds');
  map.append('g').attr('id', 'state-bounds');
  map.append('g').attr('id', 'wu-circles');
  /* creating "defs" which is where we can put things that the browser doesn't render, 
  but can be used in parts of the svg that are rendered (e.g., <use/>) */
  map.append('defs').append('g').attr('id', 'state-bounds-defs');
  
  // add watermark
  addWatermark();

  /** Initialize URL **/
  
  // Initialize page info
  setHash('view', activeView);
  setHash('category', activeCategory);
  
}

function fillMap() {

  // arguments[0] is the error
	var error = arguments[0];
	if (error) throw error;

	// the rest of the indices of arguments are all the other arguments passed in -
	// so in this case, all of the results from q.await. Immediately convert to
	// geojson so we have that converted data available globally.
	stateBoundsUSA = topojson.feature(arguments[1], arguments[1].objects.states);
	countyCentroids = arguments[2];
	
  // set up scaling for circles
  var rangeWateruse = arguments[3],
      minWateruse = rangeWateruse[0],
      maxWateruse = rangeWateruse[1];
  
  // update circle scale with data
  scaleCircles = scaleCircles
    .domain(rangeWateruse);
    
  // add the main, active map features
  addStates(map, stateBoundsUSA);
  
  // add the circles
  // CIRCLES-AS-CIRCLES
  addCircles(countyCentroids);
  // CIRCLES-AS-PATHS
  /*var circlesPaths = prepareCirclePaths(categories, countyCentroids);
  addCircles(circlesPaths);*/
  updateCircles(activeCategory);
  
  // manipulate dropdowns
  // need to figure out how to do this for only mobile views
  updateViewSelectorOptions(activeView, stateBoundsUSA, countyCentroids);
  addZoomOutButton(activeView);
  
  // load county data, add and update county polygons.
  // it's OK if it's not done right away; it should be loaded by the time anyone tries to hover!
  updateCounties('USA');
}

function addButtons() {
  var buttonContainer = d3.select('.svg-container')
    .append('div')
    .attr('id', 'button-container');
    
  buttonContainer.append('div')
    .classed('select-arrowbox', true);
    
  d3.select('#button-container')
    .selectAll('button')
    .data(categories)
    .enter()
    .append('button')
    .text(function(d){
      return categoryToName(d);
    })
    .attr('class', function(d){
      return d;
    })
    .on('click', function(d){
      updateCategory(d.toLowerCase(), activeCategory);
    })
    .on('mouseover', function(d){
      showCategory(d.toLowerCase(), activeCategory, action = 'mouseover');
    })
    .on('mouseout', function(d){
      showCategory(activeCategory, d.toLowerCase(), action = 'mouseout');
    });
}
