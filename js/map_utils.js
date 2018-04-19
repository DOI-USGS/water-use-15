/* Map Functions and Variables */

// Bounding box coordinates for the nation, for scaling states
var nationDims;
var zoom_scale;

function extractNames(stateBounds) {
  stateBounds.features.forEach(function(d) {
     waterUseViz.stateAbrvs.push(d.properties.STATE_ABBV);
  });
}
// Create the state polygons
function addStates(map, stateBounds) {

  // changes pointer events depending on mobile or desktop
  var clickClass = "state-click-off"; // default to desktop
  if(waterUseViz.mode === "mobile") {
    clickClass = "state-click-on";
  }
  
  // add states
  map.select('#state-bounds-lowres')
    .selectAll( 'path' )
    .data(stateBounds.features, function(d) {
      return d.properties.STATE_ABBV;
    })
    .enter()
    .append('path')
    .attr('id', function(d) {
      return d.properties.STATE_ABBV+'-lowres';
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
    clickedView = selection.data()[0].properties.STATE_ABBV;
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
  
  // set hash and set category selectors (will see on mobile)
  setHash('view', activeView);
  if(d3.select(".view-select").selectAll("option").data().length > 1) {
    // only update the selector if they've been added already
    updateStateSelector(activeView);
  } 
  
  // determine the center point and scaling for the new view
  var x, y;
  if(activeView === 'USA') {
    x = waterUseViz.dims.map.width / 2;
    y = waterUseViz.dims.map.height / 2;
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
  unhighlightCounty();
  unhighlightCircle();
  updateLegendTextToView();
  
  // change the zoom button or county dropdown based on view
  updateZoomOutButton(activeView);
  updateCountySelectorDropdown(activeView);
  
  if(activeView !== 'USA') {
    
    // select counties in current state
    var statecounties = d3.selectAll('.county')
      .filter(function(d) { return d.properties.STATE_ABBV === activeView; });
    var otherstates = d3.selectAll('.state')
      .filter(function(d) { return d !== activeView; });
    var thisstate = d3.selectAll('.state')
      .filter(function(d) { return d === activeView; });
    
    showCountyLines(statecounties, scale = zoom_scale);
    emphasizeCounty(statecounties);
    backgroundState(otherstates, scale = zoom_scale);
    foregroundState(thisstate, scale = zoom_scale);
    
  }
  var allcounties = d3.selectAll('.county');
  
  allcounties
    .style("stroke-width",  1/zoom_scale); // make all counties have scaled stroke-width
  
  // apply the transform (i.e., actually zoom in or out)
  map.transition()
    .duration(750)
    .attr('transform',
      "translate(" + waterUseViz.dims.map.width / 2 + "," + waterUseViz.dims.map.height / 2 + ")"+
      "scale(" + zoom_scale + ")" +
      "translate(" + (waterUseViz.dims.map.x0/zoom_scale - x) + "," + -y + ")");
      
  // record the change for analytics. don't need timeout for view change   
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
    updateButtons(category);
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
      'event_label': category + '; from='+ prevCategory + '; view=' + activeView
    });
  }, updateCategoryDelay);
}

var toolTipTimer = null;
var toolTipDelay = 1000; //ms

function updateLegendText(d, category) {

  waterUseViz.elements
    .buttonBox
    .selectAll("#legend-title")
    .text(d.COUNTY + ", " + d.STATE_ABBV);

  waterUseViz.elements
    .buttonBox
    .selectAll("#" + category  + "-button-text")
    .text(d[[category]]);
    
  if(toolTipTimer){
    clearTimeout(toolTipTimer);
  }
  toolTipTimer = setTimeout(function(){
     gtag('event', 'hover', {
  'event_category': 'figure',
  'event_label': d.COUNTY + ", " + d.STATE_ABBV + '; category=' + category + '; view=' + activeView});
  }, toolTipDelay);
}

var wu_national_data;

// Read state data and add it to figure
d3.json("data/wu_data_15_sum.json", function(error, data) {
  
  if (error) throw error;
  
  wu_national_data = data;
  
});


function updateLegendTextToView() {

  if(activeView === 'USA') {
    console.log('activeView is USA, so setting category amounts');
    
    waterUseViz.elements
      .buttonBox
      .selectAll("#legend-title")
      .text("U.S. Water Use");
  
    waterUseViz.elements.buttonBox
      .selectAll('.category-amount')
      .data(wu_national_data, function(d) { return d.category; })
      .text(function(d) { return d.wateruse; });

  } else {
    console.log('activeView is not USA, so not yet setting category amounts because this is just a test');
    waterUseViz.elements
      .buttonBox
      .selectAll("#legend-title")
      .text("Water Use");
  
    waterUseViz.elements
      .buttonBox
      .selectAll('.category-amount')
      .text("");
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
