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
      height: null,
      titlesHeight: null
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
  .scale([2000])
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
var container = d3.select('body div#mapSVG');

// Create SVG and map
var svg = d3.select("#mapSVG")
  .append("svg")
  .attr('preserveAspectRatio', 'xMidYMid');

var map = svg.append("g")
  .attr("id", "map");

var mapBackground = map.append("rect")
  .attr("id", "map-background")
  .on('click', zoomToFromState);

detectDevice(); // sets waterUseViz.interactiveMode
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
d3.json("data/huc4_boundaries.json", function(error, stateBoundsRaw) {
  if (error) throw error;
  drawMap(stateBoundsRaw);
});

d3.tsv("data/huc8_centroids_wu.tsv", function(error, countyCentroids) {
  
  if (error) throw error;

  d3.json("data/wu_data_range.json", function(error, waterUseRange) {

    if (error) throw error;
    // nationalRange gets used in drawMap->addStates->applyZoomAndStyle and
    // fillMap->scaleCircles-update
    waterUseViz.nationalRange = waterUseRange;

    d3.json("data/wu_data_national_sum.json", function(error, waterUseNational) {
      
      if (error) throw error;
      // cache data for dotmap and update legend if we're in national view
      waterUseViz.nationalData = waterUseNational;
      
      d3.json("data/wu_data_state_simplify.json", function(error, waterUseState) {
        
        if (error) throw error;
        // cache data for dotmap
        waterUseViz.stateData = waterUseState;
        fillMap(countyCentroids);
        
      });
    });
  });
});
