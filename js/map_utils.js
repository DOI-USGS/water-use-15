/* Map Functions and Variables */

// Bounding box coordinates for the nation, for scaling states
var nationDims;

// Style definitions (need them here instead of css to do transitions)
var stateStyle = {
  nationView: {
    active: {
      'fill': '#BEBEBE',
      'stroke': 'transparent', // looks OK white, too
      'stroke-width': 0
    },
    inactive: {
      'fill': '#DCDCDC',
      'stroke': 'transparent', // i think we're avoiding borders usually?
      'stroke-width': 0
    }
  },
  stateView: {
    active: {
      'fill': '#DCDCDC',
      'stroke': 'transparent', // no need for border when there's fill
      'stroke-width': 0
    },
    inactive: {
      'fill': 'transparent',
      'stroke': 'transparent', // could use #DCDCDC to show neighbor outlines
      'stroke-width': 0
    }
  }
};

// Create the state polygons
function add_states(map, stateData) {

  // add states
  map.append("g").attr('id', 'statepolygons')
    .selectAll( 'path' )
    .data(stateData.features)
    .enter()
    .append('path')
    .classed('state', true)
    .attr('id', function(d) {
      return d.properties.ID;
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
  var newView = getHash('v');
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
    active = (d.properties.ID === activeView);
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
  clickedView = d3.select(this).attr('id'); // should be same as data.properties.ID;

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
  
  updateTitle();

  // update the URL with a #v=xxx so users can return to this view
  setHash('v', activeView);

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
      return d.properties.ID === activeView;
    })[0];
    console.log(stateGeom);
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
  // d.properties.ID === activeView), but that didn't work with transitions.
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

function updateYear(year) {
  activeYear = year;
  
  // this is where functions to update data for a new year should go
  updateTitle();
  if(activeView !== 'USA') {
    showCounties(activeView);
  }
}

function updateTitle() {
  d3.select("#maptitle")
    .text("Water Use Data for " + activeView + ", " + activeYear);
}
