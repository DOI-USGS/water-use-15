function updateStates(newView) {
  updateStateData(newView, updateStateBounds);
}

function updateStateData(newView, callback) {
  if(newView === 'USA') {
    callback(null, stateBoundsUSA);
  } else {
    if(!stateBoundsZoom) {
      d3.json('data/state_boundaries_zoom.json', function(error, stateBoundsTopo) {
        // cache the data to a global variable
        stateBoundsZoom = topojson.feature(stateBoundsTopo, stateBoundsTopo.objects.states);
        // do the update
        callback(null, stateBoundsZoom);
      });
    } else {
      // do the update
      callback(null, stateBoundsZoom);
    }
  }
}

function updateStateBounds(error, stateBounds) {
  map.select('#state-bounds')
    .selectAll( 'path.state' )
    .data(stateBounds.features, function(d) {
      return d.properties.STATE_ABBV;
    })
    .attr('d', buildPath);  
}
