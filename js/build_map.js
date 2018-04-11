// Define one big global to eventually rule them all.
// null values are placeholders for globals that will be filled in
var waterUseViz = {
  dims: {
    map: {
      width: 1000,
      height: 700
    },
    buttonBox: {
      widthDesktop: 250,
      heightDesktop: 250,
      width: null,
      height: null
    },
    svg: {
      width: null,
      height: null
    },
    watermark: {
      width: null,
      height: null
    }
  },
  elements: {
    //svg: null,
    //map: null,
    buttonBox: null
  }
};

// Globals not yet in waterUseViz
var activeView, activeCategory, prevCategory;
var stateBoundsUSA, stateBoundsZoom, countyBoundsUSA, countyCentroids;
var countyBoundsZoom = new Map();
var categories = ["total", "thermoelectric", "publicsupply", "irrigation", "industrial"];

// Projection
var projection = albersUsaTerritories()
  .scale([1200])
  .translate([waterUseViz.dims.map.width / 2, waterUseViz.dims.map.height / 2]);
  // default is .rotate([96,0]) to center on US (we want this)
    
var buildPath = d3.geoPath()
  .projection(projection);

// circle scale
var scaleCircles = d3.scaleSqrt()
  .range([0, 15]);
  
/** Get user view preferences **/

readHashes();
  
/** Add major svg elements and then set their sizes **/
    
// Create container
var container = d3.select('body')
  .append('div')
  .classed('svg-container', true);

// Create SVG and map
var svg = d3.select(".svg-container")
  .append("svg")
  .attr('preserveAspectRatio', 'xMidYMid');

var map = svg.append("g")
  .attr("id", "map");

var mapBackground = map.append("rect")
  .attr("id", "map-background")
  .on('click', zoomToFromState);

var buttonBox = addButtons();

var watermark = addWatermark();

// Set sizes once now and plan to resize anytime the user resizes their window
resize();
d3.select(window).on('resize', resize); 

/** Add major map-specific elements **/

// Set up some map elements so we're ready to add data piece by piece
prepareMap();

// Set up tooltips
var tooltipDiv = d3.select("body").append("div")
  .classed("tooltip hidden", true);

// Read data and add to map
d3.queue()
  .defer(d3.json, "data/state_boundaries_USA.json")
  .defer(d3.tsv, "data/county_centroids_wu.tsv")
  .defer(d3.json, "data/wu_data_15_range.json")
  .await(fillMap);

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
  
  // load county data, add and update county polygons.
  // it's OK if it's not done right away; it should be loaded by the time anyone tries to hover!
  updateCounties('USA');
}

function resize() {
  
  // Decide whether we're in mobile or desktop mode. Currently doing this by window width, but we could look to
  // https://www.w3schools.com/howto/howto_js_media_queries.asp for more device-specific solutions
  if(window.innerWidth > 425) { // sufficiently wide desktop windows
    waterUseViz.mode = 'desktop';
  } else { // most mobile devices (except iPads) plus narrow desktop windows
    waterUseViz.mode = 'mobile';
  }
  
  // Calculate new dimensions with adaptations for ~desktop vs ~mobile
  if(waterUseViz.mode === 'desktop') {
  
    // buttonBox is at the left and centered vertically
    waterUseViz.dims.buttonBox.y0 = (waterUseViz.dims.map.height/2) - (waterUseViz.dims.buttonBox.height/2);
    waterUseViz.dims.buttonBox.width = waterUseViz.dims.buttonBox.widthDesktop;
    waterUseViz.dims.buttonBox.height = waterUseViz.dims.buttonBox.heightDesktop;
    // map fills the full svg
    waterUseViz.dims.map.x0 = waterUseViz.dims.buttonBox.width;
    // svg is [buttons][map]
    waterUseViz.dims.svg.width = waterUseViz.dims.buttonBox.width + waterUseViz.dims.map.width;
    waterUseViz.dims.svg.height = waterUseViz.dims.map.height;
    // watermark is at bottom left
    waterUseViz.dims.watermark.x0 = waterUseViz.dims.svg.width * 0.01;
    waterUseViz.dims.watermark.y0 = waterUseViz.dims.svg.height * 0.95;
    
  } else {
  
    // buttonBox sits below map with small vertical buffer between map and buttons
    waterUseViz.dims.buttonBox.y0 = waterUseViz.dims.map.height * 1.05;
    waterUseViz.dims.buttonBox.width = waterUseViz.dims.map.width;
    waterUseViz.dims.buttonBox.height = waterUseViz.dims.buttonBox.width *
      (waterUseViz.dims.buttonBox.heightDesktop / waterUseViz.dims.buttonBox.widthDesktop);
    // map fills the top part of the svg
    waterUseViz.dims.map.x0 = 0;
    // svg is [map]
    //        [buttons]
    waterUseViz.dims.svg.width = waterUseViz.dims.map.width;
    waterUseViz.dims.svg.height = waterUseViz.dims.buttonBox.y0 + waterUseViz.dims.buttonBox.height;
    // watermark is at bottom right
    waterUseViz.dims.watermark.x0 = waterUseViz.dims.svg.width * 0.85;
    waterUseViz.dims.watermark.y0 = waterUseViz.dims.svg.height * 0.95;
  }
  
  // Apply the changes to the svg, map, map background, and watermark
  svg
    .attr('viewBox', '0 0 ' + waterUseViz.dims.svg.width + ' ' + waterUseViz.dims.svg.height + '');
  map
    .attr('transform', 'translate(' + waterUseViz.dims.map.x0 + ', ' + 0 + ')');
  mapBackground
    .attr("width", waterUseViz.dims.svg.width)
    .attr("height", waterUseViz.dims.map.height);
  watermark
    .attr('transform', 'translate(' + waterUseViz.dims.watermark.x0 + ',' + waterUseViz.dims.watermark.x0 + ')scale(0.25)');
  
  // Apply the changes to the button elements
  waterUseViz.elements.buttonBox
    .attr('transform', 'translate(' + 0 + ', ' + waterUseViz.dims.buttonBox.y0 + ')');
  waterUseViz.elements.buttonBox.select('#button-background')  
    .attr('width', waterUseViz.dims.buttonBox.width);
  waterUseViz.elements.buttonBox.selectAll('.button .category-label')
    .attr('x', waterUseViz.dims.buttonBox.width * 0.05); // nudge a little over from the rectangle's left edge
  waterUseViz.elements.buttonBox.selectAll('.button .category-amount')
    .attr('x', waterUseViz.dims.buttonBox.width * 0.9); // nudge a little over from the rectangle's left edge
  updateButtons(activeCategory); // updates the button rectangle widths
  
}
