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
    "Circle sizes represent rates of water withdrawals by county. ";
  if(waterUseViz.interactionMode === 'tap') {
    captionText = captionText +
      "Tap in the legend to switch categories. " +
      "Tap a state to zoom in, then tap a county for details.";
  } else {
    captionText = captionText +
      "Hover over the map for details. Click a button to switch categories. " +
      "Click a state to zoom in, and click the same state to zoom out.";
  }
  
  d3.select('#map-caption p')
  .text(captionText);
}

function drawMap(stateBoundsRaw) {
  
  // Immediately convert to geojson so we have that converted data available globally.
  stateBoundsUSA = topojson.feature(stateBoundsRaw, stateBoundsRaw.objects.Colorado_HUC4);
  
  // get state abreviations into waterUseViz.stateAbrvs for later use
  extractNames(stateBoundsUSA);  
  
  // add the main, active map features
  addStates(map, stateBoundsUSA);
  
}

function fillMap(countyCentroidData) {
  
  // be ready to update the view in case someone resizes the window when zoomed in
  // d3 automatically zooms out when that happens so we need to get zoomed back in
  d3.select(window).on('resize', function(d) {
    resize();
    updateView(activeView, fireAnalytics = false, doTransition = false);
  }); 
  
  countyCentroids = countyCentroidData; // had to name arg differently, otherwise error loading boundary data...
  
  // manipulate dropdowns - selector options require countyCentroids if starting zoomed in
  updateViewSelectorOptions(activeView, stateBoundsUSA);
  addZoomOutButton(activeView);
  
  // update circle scale with data
  scaleCircles = scaleCircles
  .domain(waterUseViz.nationalRange);
  
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
