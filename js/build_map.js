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
      heightDesktop: 275,
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
  },
  stateAbrvs: [], // created in extractNames()
  nationalData: {},
  stateData: {},
  isEmbed: RegExp("embed-water-use-15").test(window.location.pathname)
};

// Globals not yet in waterUseViz
var activeView, activeCategory, prevCategory;
var stateBoundsUSA, stateBoundsZoom, countyBoundsUSA, countyCentroids;
var countyBoundsZoom = new Map();
var categories = ["total", "thermoelectric", "irrigation","publicsupply", "industrial"];

// Projection
var projection = albersUsaTerritories()
  .scale([1200])
  .translate([waterUseViz.dims.map.width / 2, waterUseViz.dims.map.height / 2]);
  // default is .rotate([96,0]) to center on US (we want this)
    
var buildPath = d3.geoPath()
  .projection(projection);

// circle scale
var scaleCircles = d3.scaleSqrt()
  .range([0, 10]);
  
/** Get user view preferences **/

readHashes();
  
/** Add major svg elements and then set their sizes **/
    
// Create container
var container = d3.select('body div.main-svg');

// Create SVG and map
var svg = d3.select(".main-svg")
  .append("svg")
  .attr('preserveAspectRatio', 'xMidYMid');

var map = svg.append("g")
  .attr("id", "map");

var mapBackground = map.append("rect")
  .attr("id", "map-background")
  .on('click', zoomToFromState);

addButtons(); // sets waterUseViz.elements.buttonBox

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
var dataQueue = d3.queue();
if(waterUseViz.interactionMode === 'tap') {
  dataQueue.defer(d3.json, "data/state_boundaries_mobile.json");
} else {
  dataQueue.defer(d3.json, "data/state_boundaries_USA.json");
}
dataQueue
  .defer(d3.tsv, "data/county_centroids_wu.tsv")
  .defer(d3.json, "data/wu_data_15_range.json")
  .defer(d3.json, "data/wu_data_15_sum.json")
  .defer(d3.json, "data/wu_state_data.json")
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
  /* creating "defs" which is where we can put things that the browser doesn't render, 
  but can be used in parts of the svg that are rendered (e.g., <use/>) */
  map.append('defs').append('g').attr('id', 'state-bounds-lowres');
  
  /** Initialize URL **/
  setHash('view', activeView);
  setHash('category', activeCategory);
  
  /** Update caption **/
  customizeCaption();
}

// customize the caption according to the mode (mobile, desktop, etc.)
function customizeCaption() {
  var captionText = 
    "Circle sizes represent rates of water use by county. ";
  if(waterUseViz.interactionMode === 'tap') {
    captionText = captionText +
      "Tap in the legend to switch categories. " +
      "Tap a state to zoom in, then tap a county for details.";
  } else {
    captionText = captionText +
      "Hover over the map for details. Click a button to switch categories. " +
      "Click a state to zoom in, and click the same state to zoom out.";
  }
  console.log(d3.select('#fig-caption'));
  d3.select('#fig-caption p')
    .text(captionText);
}


function fillMap() {

  // be ready to update the view in case someone resizes the window when zoomed in
  // d3 automatically zooms out when that happens so we need to get zoomed back in
  d3.select(window).on('resize', function(d) {
    resize();
    updateView(activeView, fireAnalytics = false, doTransition = false);
  }); 

  // arguments[0] is the error
	var error = arguments[0];
	if (error) throw error;

	// the rest of the indices of arguments are all the other arguments passed in -
	// so in this case, all of the results from q.await. Immediately convert to
	// geojson so we have that converted data available globally.
	stateBoundsUSA = topojson.feature(arguments[1], arguments[1].objects.states);
	countyCentroids = arguments[2];
	
  // set up scaling for circles at national level
  waterUseViz.nationalRange = arguments[3];
  
  // cache data for dotmap and update legend if we're in national view
  waterUseViz.nationalData = arguments[4];
  
  // cache data for dotmap and update legend if we're in state view
  waterUseViz.stateData = arguments[5];
  
  // update circle scale with data
  scaleCircles = scaleCircles
    .domain(waterUseViz.nationalRange);
    
  // get state abreviations into waterUseViz.stateAbrvs for later use
  extractNames(stateBoundsUSA);  
  
  // add the main, active map features
  addStates(map, stateBoundsUSA);
  
  if(activeView !== "USA") {
    loadInitialCounties();
  }
  
  // add the circles
  // CIRCLES-AS-CIRCLES
  /*addCircles(countyCentroids);*/
  // CIRCLES-AS-PATHS
  var circlesPaths = prepareCirclePaths(categories, countyCentroids);
  addCircles(circlesPaths);
  updateCircleCategory(activeCategory);
  
  // manipulate dropdowns
  updateViewSelectorOptions(activeView, stateBoundsUSA);
  addZoomOutButton(activeView);
  
  // update the legend values and text
  updateLegendTextToView();
  
  // load county data, add and update county polygons.
  // it's OK if it's not done right away; it should be loaded by the time anyone tries to hover!
  // and it doesn't need to be done at all for mobile
  if(waterUseViz.interactionMode !== 'tap') {
    updateCounties('USA');
  } else {
    // set countyBoundsUSA to something small for which !countyBoundsUSA is false so that 
    // if and when the user zooms out from a state, updateCounties won't try to load the low-res data
    countyBoundsUSA = true;
  }
    
  // format data for rankEm
  var  barData = [];
  waterUseViz.stateData.forEach(function(d) {
      var x = {
        'abrv': d.abrv,
        'STATE_NAME': d.STATE_NAME,
        'open': d.open,
        'wu': d.use.filter(function(e) {return e.category === 'total';})[0].wateruse,
        'fancynums': d.use.filter(function(e) {return e.category === 'total';})[0].fancynums
      };
      barData.push(x);
  });
  
  // create big pie figure (uses waterUseViz.nationalData)
  if(!waterUseViz.isEmbed) loadPie();
  
  // create rankEm figure  
  if(!waterUseViz.isEmbed) rankEm(barData);

}

function loadInitialCounties() {
  // update the view once the county data is loaded
  
  function waitForCounties(error, results){
    updateView(activeView);
  }
  
  d3.queue()
    .defer(loadCountyBounds, activeView)
    .await(waitForCounties);
}
