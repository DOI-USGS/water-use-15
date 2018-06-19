/* Map Functions and Variables */
// Bounding box coordinates for the nation, for scaling states
var nationDims;
var zoom_scale;

function extractNames(stateBounds) {
  stateBounds.features.forEach(function(d) {
     waterUseViz.stateAbrvs.push(d.properties.HUC4);
  });
}
// Create the state polygons
function addStates(map, stateBounds) {

  // changes pointer events depending on mobile or desktop
  var clickClass = "state-click-off"; // default to desktop
  if(waterUseViz.interactionMode === "tap") {
    clickClass = "state-click-on";
  }
  
  // add states
  map.select('#state-bounds-lowres')
    .selectAll( 'path' )
    .data(stateBounds.features, function(d) {
      return d.properties.HUC4;
    })
    .enter()
    .append('path')
    .attr('id', function(d) {
      return d.properties.HUC4+'-lowres';
    })
    .attr('d', buildPath);
    
  // add states
  map.select('#state-bounds')
    .selectAll( 'use' )
    .data(waterUseViz.stateAbrvs, function(d) {
      return d;
    })
    .enter()
    .append('use')
    .classed('state', true)
    .classed(clickClass, true)
    .attr('id', function(d) {
      return d;
    })
    .attr('xlink:href', function(d) {
      return '#' + d + '-lowres';
    })
    .on('click', zoomToFromState);

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
function zoomToFromState(d, i, j, selection) {
  
    // In some cases use `.on("click", zoomToFromState)` which makes first two args
    //  default to d (data), i (index), and j (parent data). If that's the case, we 
    //  need to explicitly select `this` here.
    // In other cases, we had to pass `d3.select(this)` in as an argument. I am not
    //  quite sure why. But that's why the argument `selection` is added on. In those
    //  cases, this function is called by `zoomToFromState(d,i,d3.select(this))`
  
  if(typeof selection === "undefined") {
    selection = d3.select(this);
  } 
  
  // get the ID of the state that was clicked on (or NULL if it's not an ID).
  // could also use clickedState to set the URL, later
  var clickedView = selection.attr('id'); // need this in order to use background
  
  if( clickedView !== 'map-background' && clickedView.length > 2 ) {
    // only do this if the clicked thing is not a state or map background
    // need to extract the state abbreviation from the clicked county
    clickedView = selection.data()[0].properties.HUC4;
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
  updateView(newView, fireAnalytics = true);
}

function getTimestamp() {return new Date().getTime().toString()}
function getSessionId() {return new Date().getTime() + '.' + Math.random().toString(36).substring(5)}

function updateView(newView, fireAnalytics, doTransition) {
  if(fireAnalytics === undefined) { 
    fireAnalytics = true;
  }
  if(doTransition === undefined) {
    doTransition = true;
  }
  // update the global variable that stores the current view
  oldView = activeView;
  activeView = newView;
  
  // set hash and set category selectors (will see on mobile)
  setHash('view', activeView);
  if(d3.select(".view-select").selectAll("option").data().length > 1) {
    // only update the selector if they've been added already
    updateStateSelector(activeView);
  } 
  
  // update the geospatial data for the upcoming resolution
  if(typeof countyCentroids !== 'undefined') {
    updateCounties(activeView);
  }
  updateStates(activeView);
  
  // ensure we have the zoom parameters (they're in the state zoom data) and apply the zoom
  updateStateData(newView, function() {
    applyZoomAndStyle(newView, doTransition);
  });
  
  // record the change for analytics. don't need timeout for view change   
  if(fireAnalytics) {
    var sessionId = getSessionId();
    var timestamp = getTimestamp();
    gtag('event', 'update view', {
      'event_category': 'figure',
      'event_label': 'newView=' + newView + '; oldView=' + oldView + '; category=' + activeCategory,
      'sessionId': sessionId,
      'timestamp': timestamp});
  }    
}

function applyZoomAndStyle(newView, doTransition) {
  if(doTransition === undefined) {
    doTransition = true;
  }
  
  // determine the center point and scaling for the new view
  var zoom;
  if(activeView === 'USA') {
    zoom = {
      x: waterUseViz.dims.map.width / 2,
      y: waterUseViz.dims.map.height / 2,
      s: 1
    };
  } else {
    // find the state data we want to zoom to
    var stateGeom = stateBoundsZoom.features.filter(function(d) {
      return d.properties.HUC4 === activeView;
    })[0];
    // the ZOOM property contains x, y, and s
    zoom = stateGeom.properties.ZOOM;
  }
  
  // setup appropriate circle scaling (zoom.s === 1 for view === 'USA')
  // multiple by zoom because you want the circles to shrink on zoom 
  // so you increase the domain and the same radii value now
  // corresponds to a smaller circle size. only do this if we already 
  // know the nationalRange, which is not the case when we first add states
  if(typeof waterUseViz.nationalRange !== 'undefined') {
    var stateZoomRatio = 0.4;
    var newScaling = [waterUseViz.nationalRange[0]*zoom.s,
                      waterUseViz.nationalRange[1]*zoom.s*stateZoomRatio];
    if(scaleCircles.domain() !== newScaling) {
      // only change circle scale if it's different
      scaleCircles.domain(newScaling);
      updateCircleSize(activeCategory, activeView);
    }
  }

  // reset counties each time a zoom changes
  // cannot go inside first if because panning to adjacent state won't reset
  hideCountyLines();
  deemphasizeCounty();
  resetState();
  unhighlightCounty();
  unhighlightCircle();
  updateLegendTextToView();

  // change the zoom button or county dropdown based on view
  updateZoomOutButton(activeView);
  updateCountySelectorDropdown(activeView);
  
  if(activeView !== 'USA') {
    
    // select counties in current state
    var statecounties = d3.selectAll('.county')
      .filter(function(d) { return d.properties.HUC4 === activeView; });
    var otherstates = d3.selectAll('.state')
      .filter(function(d) { return d !== activeView; });
    var thisstate = d3.selectAll('.state')
      .filter(function(d) { return d === activeView; });
    var wucircles = d3.selectAll('.wu-circle');
    
    showCountyLines(statecounties, scale = zoom.s);
    emphasizeCounty(statecounties);
    backgroundState(otherstates, scale = zoom.s);
    foregroundState(thisstate, scale = zoom.s);
    //scaleCircleStroke(wucircles, scale = zoom.s);
    
  } else {
    // only reset stroke when zooming back out
    //resetCircleStroke();
  }
  
  var allcounties = d3.selectAll('.county');
  
  allcounties
    .style("stroke-width",  1/zoom.s); // make all counties have scaled stroke-width

  // apply the transform (i.e., actually zoom in or out)
  var zoomTime;
  if(waterUseViz.interactionMode !== 'hover' || !doTransition){
    zoomTime = 0;
  } else {
    zoomTime = 750;
  }
  map.transition()
    .duration(zoomTime)
    .attr('transform',
      "translate(" + waterUseViz.dims.map.width / 2 + "," + waterUseViz.dims.map.height / 2 + ")"+
      "scale(" + zoom.s + ")" +
      "translate(" + (waterUseViz.dims.map.x0/zoom.s - zoom.x) + "," + -zoom.y + ")");
}

function updateCategory(category, prevCategory, action) {
  if(category === prevCategory) {
    // don't do anything if you click/hover on current category
    return;
  }
  
  // update the globals about category view status
  activeCategory = category;
  
  // update page info
  setHash('category', category);
  
  // change buttons and map circles
  updateButtons(category);
  updateButtonWidths(category);
  updateCircleCategory(category);
  
  // account for anything that is currently highlighted
  // and update the text with it
  var highlightedCounty = d3.select('.highlighted-county');
  if(!highlightedCounty.empty()) {
    updateLegendText(highlightedCounty.datum().properties, category); 
    highlightCircle(highlightedCounty.datum().properties, category);
  }
  
  // fire analytics event
  documentCategorySwitch(category, prevCategory, action);
} 

var updateCategoryTimer = null;
var updateCategoryDelay = 600; //ms
function documentCategorySwitch(category, prevCategory, action) {
  if(updateCategoryTimer){
    clearTimeout(updateCategoryTimer);
  }
  updateCategoryTimer = setTimeout(function(){
    var sessionId = getSessionId();
    var timestamp = getTimestamp();
    gtag('event', action + ' update category', {
      'event_category': 'figure',
      'event_label': category + '; from='+ prevCategory + '; view=' + activeView,
      'sessionId': sessionId,
      'timestamp': timestamp
    });
  }, updateCategoryDelay);
}

var toolTipTimer = null;
var toolTipDelay = 1000; //ms

function updateLegendText(d, category) {

  waterUseViz.elements
    .buttonBox
    .selectAll("#legend-title")
    .text(d.COUNTY + ", " + d.HUC4);
    
  waterUseViz.elements
    .buttonBox
    .selectAll("#" + category  + "-button-text")
    .text(d[[category]]);
    
  if(toolTipTimer){
    clearTimeout(toolTipTimer);
  }
  
  toolTipTimer = setTimeout(function(){
    var sessionId = getSessionId();
    var timestamp = getTimestamp();
     gtag('event', 'hover', {
          'event_category': 'figure',
           'event_label': d.COUNTY + ", " + d.HUC4 + '; category=' + category + '; view=' + activeView,
            'sessionId': sessionId,
            'timestamp': timestamp
     });
  }, toolTipDelay);
}



function updateLegendTextToView() {

  if(activeView === 'USA') {

    waterUseViz.elements
      .buttonBox
      .selectAll("#legend-title")
      .text("U.S. Water Withdrawals");

    waterUseViz.elements.buttonBox
      .selectAll('.category-amount')
      .data(waterUseViz.nationalData, function(d) { return d.category; })
      .text(function(d) { return d.fancynums; });

  } else if(typeof waterUseViz.stateData.filter === 'function') {

   var state_data = waterUseViz.stateData
      .filter(function(d) { 
        return d.abrv === activeView; 
    });

    waterUseViz.elements
      .buttonBox
      .selectAll("#legend-title")
      .data(state_data)
      .text(function(d) { return d.HUC4 + " Water Withdrawals"; });

    waterUseViz.elements.buttonBox
      .selectAll('.category-amount')
      .data(state_data[0].use, function(d) { return d.category; })
      .text(function(d) { return d.fancynums; });

  }

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
