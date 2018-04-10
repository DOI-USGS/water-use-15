/* Map Functions and Variables */

// Bounding box coordinates for the nation, for scaling states
var nationDims;
var zoom_scale;

// Create the state polygons
function addStates(map, stateBounds) {

  // add states
  map.select('#state-bounds')
    .selectAll( 'path' )
    .data(stateBounds.features, function(d) {
      return d.properties.STATE_ABBV;
    })
    .enter()
    .append('path')
    .classed('state', true)
    .attr('id', function(d) {
      return d.properties.STATE_ABBV;
    })
    .attr('d', buildPath);

  var nationBounds = buildPath.bounds(stateBounds);
  nationDims = {
    width: nationBounds[1][0] - nationBounds[0][0],
    height: nationBounds[1][1] - nationBounds[0][1]
  };

  // if URL specifies a state view, zoom to that now
  var newView = getHash('view');
  if(newView === null) { newView = 'USA'; }
  if(newView !== 'USA') {
    updateView(newView, fireAnalytics = false);
  }
}

// on click
function zoomToFromState(data) {

  // get the ID of the state that was clicked on (or NULL if it's not an ID).
  // could also use clickedState to set the URL, later
  var clickedView = d3.select(this).attr('id'); // need this in order to use background
  
  if( clickedView !== 'map-background' ) {
    // id of selection is a county code, but need to extract the state abbreviation from it
    clickedView = d3.select(this).data()[0].properties.STATE_ABBV;
  }
  
  // determine the new view
  var newView;
  if(clickedView === 'map-background' || clickedView === activeView) { 
    // if they clicked the background or same state, zoom back out
    newView = 'USA';
  } else {
    // if they clicked on a different state, prepare to zoom in
    newView = clickedView;
  }

  // zoom to the new view
  updateView(newView);
}

function updateView(newView, fireAnalytics) {
   if(fireAnalytics === undefined) {
      scale = true;
   }
  
  // update the global variable that stores the current view
  oldView = activeView;
  activeView = newView;
  
  setHash('view', activeView);

  // determine the center point and scaling for the new view
  var x, y;
  if(activeView === 'USA') {
    x = chart_width / 2;
    y = chart_height / 2;
    zoom_scale = 1;
  } else {
    var stateGeom, centroid, x0, y0, x1, y1, stateDims;
    
    // find the state data we want to zoom to
    stateGeom = stateBoundsUSA.features.filter(function(d) {
      return d.properties.STATE_ABBV === activeView;
    })[0];
    
    // find the center point to zoom to
    centroid = buildPath.centroid(stateGeom);
    x = centroid[0];
    y = centroid[1];
    
    // find the maximum zoom (up to nation bounding box size) that keeps the
    // whole state in view
    [[x0,y0],[x1,y1]] = buildPath.bounds(stateGeom);
    stateDims = {
      width: 2 * d3.max([ x1 - x, x - x0]),
      height: 2 * d3.max([ y1 - y, y - y0])
    };
    zoom_scale = d3.min([
      nationDims.height/stateDims.height,
      nationDims.width/stateDims.width]);
  }

  // update the geospatial data for the upcoming resolution
  updateCounties(activeView);
  updateStates(activeView);
  
  // set the styling: setting by adding or removing class, so d3 transitions not used
  
  // reset counties each time a zoom changes
  // cannot go inside first if because panning to adjacent state won't reset
  hideCountyLines();
  deemphasizeCounty();
  resetState();
  
  // change the zoom button or county dropdown based on view
  updateZoomOutButton(activeView);
  updateCountySelectorDropdown(activeView);
  
  if(activeView !== 'USA') {
    
    // select counties in current state
    var statecounties = d3.selectAll('.county')
      .filter(function(d) { return d.properties.STATE_ABBV === activeView; });
    var otherstates = d3.selectAll('.state')
      .filter(function(d) { return d.properties.STATE_ABBV !== activeView; });
    var thisstate = d3.selectAll('.state')
      .filter(function(d) { return d.properties.STATE_ABBV === activeView; });
    
    showCountyLines(statecounties);
    emphasizeCounty(statecounties);
    backgroundState(otherstates, scale = zoom_scale);
    foregroundState(thisstate, scale = zoom_scale);
    
    statecounties
      .transition()
      .duration(500) 
      .style("stroke-width",  0.75/zoom_scale); // make all counties have scaled stroke-width
  }

  // apply the transform (i.e., actually zoom in or out)
  map.transition()
    .duration(750)
    .attr('transform',
      "translate(" + chart_width / 2 + "," + chart_height / 2 + ")"+
      "scale(" + zoom_scale + ")" +
      "translate(" + -x + "," + -y + ")");
  // don't need timeout for view change   
  if(fireAnalytics) {
    gtag('event', 'update view', {
  'event_category': 'figure',
  'event_label': 'newView=' + newView + '; oldView=' +     oldView + '; category=' + activeCategory
    });
  }    
}


function updateCategory(category, prevCategory) {
  if(category === prevCategory) {
    return;
  }
  // update the globals about category view status
  activeCategory = category;
  
  // update page info
  setHash('category', category);
  documentCategorySwitch(category, prevCategory, action = "click");
}

function showCategory(category, prevCategory, action) {
  if(prevCategory !== category) {
    updateCircles(category);
    documentCategorySwitch(category, prevCategory, action);
  }
} 

var updateCategoryTimer = null;
var updateCategoryDelay = 600; //ms
function documentCategorySwitch(category, prevCategory, action) {
  if(updateCategoryTimer){
    clearTimeout(updateCategoryTimer);
  }
  updateCategoryTimer = setTimeout(function(){
     gtag('event', action + ' update category', {
  'event_category': 'figure',
  'event_label': category + '; from='+ prevCategory + '; view=' + activeView });
  }, updateCategoryDelay);
}

var toolTipTimer = null;
var toolTipDelay = 1000; //ms
function showToolTip(d, category) {

  // change tooltip
  d3.select(".tooltip")
    .classed("hidden", false)
    .style("left", (d3.event.pageX + 35) + "px")
    .style("top", (d3.event.pageY - 50) + "px");
  d3.select(".tooltip")
    .html(d.properties.COUNTY + ", " + d.properties.STATE_ABBV + "<br/>" + 
            "Population: " + d.properties.countypop + "<br/>" +
            categoryToName(category) + ": " + 
              d.properties[[category]] + " " + "MGD");
  if(toolTipTimer){
    clearTimeout(toolTipTimer);
  }
  toolTipTimer = setTimeout(function(){
     gtag('event', 'hover', {
  'event_category': 'figure',
  'event_label': d.properties.COUNTY + ", " + d.properties.STATE_ABBV + '; category=' + category + '; view=' + activeView});
  }, toolTipDelay);
}

function hideToolTip() {
  d3.select(".tooltip")
    .classed("hidden", true);
  if (toolTipTimer){
      clearTimeout(toolTipTimer); // stop ga for edge states
    }
}

d3.selection.prototype.moveToFront = function() {  
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};

// projection functions to catch and log bad ones
function projectX(coordinates) {
  var proj = projection(coordinates);
  if(!proj) {
    console.log('bad projection:');
    console.log(projection(coordinates));
    return 0;
  } else {
    return projection(coordinates)[0]; 
  }
}

function projectY(coordinates) {
  var proj = projection(coordinates);
  if(!proj) {
    return 0;
  } else {
    return projection(coordinates)[1]; 
  }
}
