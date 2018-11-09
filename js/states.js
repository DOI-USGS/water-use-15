function updateStates(newView) {
  updateStateData(newView, updateStateBounds);
}

function updateStateData(newView, callback) {
  if(newView === 'USA') {
    callback(null, 'lowres');
  } else {
    if(waterUseViz.interactionMode === 'tap') {
      // don't need to load or point to highres data in mobile mode
      stateBoundsZoom = stateBoundsUSA;
      callback(null, 'lowres');

    } else if(map.select('#state-bounds-highres').empty()) {
      
      d3.json('data/huc4_boundaries.json', function(error, stateBoundsTopo) {
        stateBoundsZoom = topojson.feature(stateBoundsTopo, stateBoundsTopo.objects.Colorado_HUC4);
        // load the data and create the state boundaries in <use>
        d3.select('defs').append('g').attr('id', 'state-bounds-highres')
          .selectAll('path')
          .data(stateBoundsZoom.features, function(d) {
            return d.properties.HUC4;
          })
          .enter()
          .append('path')
          .attr('id', function(d) {
            return d.properties.HUC4+'-highres';
          })
          .attr('d', buildPath);
        // do the update to highres data
        callback(null, 'highres');
      });

    } else {
      // do the update to highres data
      callback(null, 'highres');
    }
    
  }
}

function updateStateBounds(error, resolution) {
  
  map.select('#state-bounds')
    .selectAll( 'use' )
    .attr('xlink:href', function(d) {
      return '#' + d + '-' + resolution;
    });
}
  
