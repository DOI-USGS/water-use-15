/* Map Functions and Variables */

// Bounding box coordinates for the nation, for scaling states
var nationDims;
  
// Create the state polygons
function addStates(map, stateData) {

  // add states
  map.append("g").attr('id', 'statepolygons')
    .selectAll( 'path' )
    .data(stateData.features)
    .enter()
    .append('path')
    .classed('state', true)
    .attr('id', function(d) {
      return d.properties.STATE_ABBV;
    })
    .attr('d', buildPath)
    .style("fill", function(d) { return formatState('fill', d, false); })
    .style("stroke", function(d) { return formatState('stroke', d, false); })
    .style("stroke-width", function(d) { return formatState('stroke-width', d, false); })
    .on('mouseover', highlightState)
    .on('mouseout', unhighlightState)
    .on('click', zoomToFromState);

  var nationBounds = buildPath.bounds(stateData);
  nationDims = {
    width: nationBounds[1][0] - nationBounds[0][0],
    height: nationBounds[1][1] - nationBounds[0][1]
  };

  // if URL specifies a state view, zoom to that now
  var newView = getHash('view');
  if(newView == null) { newView = 'USA'; }
  if(newView != 'USA') {
    updateView(newView);
  }
}

// Function to look up a style
formatState = function(attr, d, active) {
  if(activeView == 'USA') {
    var view = 'nationView';
  } else {
    active = (d.properties.STATE_ABBV === activeView);
    var view = 'stateView';
  }
  if(active) {
    activeness = 'active';
  } else {
    activeness = 'inactive';
  }
  return stateStyle[view][activeness][attr];
}

// on mouseover
function highlightState() {
  d3.select(this)
    .style('fill', function(d) { return formatState('fill', d, true); })
    .style('stroke', function(d) { return formatState('stroke', d, true); })
    .style('stroke-width', function(d) { return formatState('stroke-width', d, true); });
}

// on mouseout
function unhighlightState() {
  d3.select(this)
    .style("fill", function(d) { return formatState('fill', d, false); })
    .style('stroke', function(d) { return formatState('stroke', d, false); })
    .style('stroke-width', function(d) { return formatState('stroke-width', d, false); });
}

// on click
function zoomToFromState(data) {

  // get the ID of the state that was clicked on (or NULL if it's not an ID).
  // could also use clickedState to set the URL, later
  clickedView = d3.select(this).attr('id'); // should be same as data.properties.STATE_ABBV;

  // determine the new view
  if(clickedView === 'map-background' || activeView != 'USA') {
    // could have made it so we go national only if they click on the background
    // or the same state: if(clickedView === 'map-background' || activeView ===
    // clickedView) {}. but instead let's always zoom out if they're in state
    // view, in if they're in nation view (and click on a state)
    var newView = 'USA';
  } else {
    // if they clicked on a different state, prepare to zoom in
    var newView = clickedView;
  }

  // zoom to the new view
  updateView(newView);
}

function updateView(newView) {
  // update the global variable that stores the current view
  activeView = newView;
  
  // update page info
  updateTitle(activeCategory); // also OK not to worry about compatibility with hover
  setHash('view', activeView);

  // determine the center point and scaling for the new view
  var x, y, k;
  if(activeView === 'USA') {
    x = chart_width / 2;
    y = chart_height / 2;
    k = 1;
  } else {
    var stateGeom, centroid, x0, y0, x1, y1, stateDims;
    
    // find the state data we want to zoom to
    stateGeom = stateData.features.filter(function(d) {
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
    k = d3.min([
      nationDims.height/stateDims.height,
      nationDims.width/stateDims.width]);
  }

  // set the styling: all states inactive for view=USA, just one state active
  // otherwise. i tried doing this with .classed('active') and
  // .classed('hidden') and css (conditional on activeView=='USA' and
  // d.properties.STATE_ABBV === activeView), but that didn't work with transitions.
  var states = map.selectAll('.state');
  if(activeView === 'USA') {
    hideCounties();
    states
      .transition()
      .duration(750)
      .style("fill", function(d) { return formatState('fill', d, false); })
      .style("stroke", function(d) { return formatState('stroke', d, false); })
      .style("stroke-width", function(d) { return formatState('stroke-width', d, false); });
  } else {
    showCounties(activeView);
    states
      .transition()
      .duration(750)
      .style("fill", function(d) { return formatState('fill', d); })
      .style("stroke", function(d) { return formatState('stroke', d); })
      .style("stroke-width", function(d) { return formatState('stroke-width', d); });
  }

 // apply the transform (i.e., actually zoom in or out)
  map.transition()
    .duration(750)
    .attr('transform',
      "translate(" + chart_width / 2 + "," + chart_height / 2 + ")"+
      "scale(" + k + ")" +
      "translate(" + -x + "," + -y + ")");
}

function updateCategory(category, prevCategory) {
  
  // update page info
  updateTitle(category);
  setHash('category', category);
  
  updatePies(category, prevCategory);
  
  updateLegend(category);
  
}

function updateTitle(category) {
  d3.select("#maptitle")
    .text("Water Use Data for " + activeView + ", 2015, " + category);
}

function showToolTip(currentCircle, d, category) {
  var orig = d3.select(currentCircle),
      origNode = orig.node();
  var duplicate = d3.select(origNode.parentNode.appendChild(origNode.cloneNode(true), 
                                                            origNode.nextSibling));
  
  // style duplicated circles sitting on top
  duplicate
    .classed('tin-duplicate', true)
    .style("pointer-events", "none")
    .style("opacity", 1); // makes the duplicate circle on the top
  
  // change tooltip
  d3.select(".tooltip")
    .classed("shown", true)
    .classed("hidden", false)
    .style("left", (d3.event.pageX + 35) + "px")
    .style("top", (d3.event.pageY - 50) + "px");
  d3.select(".tooltip")
    .html(d.COUNTY + "<br/>" + 
            "Population: " + d.countypop + "<br/>" +
            categoryToName(category) + ": " + 
              d[[category]] + " " + "MGD");
}

function hideTooltip(currentCircle, d) {
  d3.select('.tin-duplicate')
    .remove(); // delete duplicate
  d3.select(".tooltip")
    .classed("shown", false)
    .classed("hidden", true);
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
