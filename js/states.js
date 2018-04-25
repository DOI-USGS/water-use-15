function updateStates(newView) {
  updateStateData(newView, updateStateBounds);
}

function updateStateData(newView, callback) {
  if(newView === 'USA') {
    callback(null, 'lowres');
  } else {
    if(map.select('#state-bounds-highres').empty()) {
      
      //d3.json('data/state_boundaries_zoom.json', function(error, stateBoundsTopo) {
      d3.json('data/state_boundaries_USA.json', function(error, stateBoundsTopo) { //
        stateBoundsZoom = topojson.feature(stateBoundsTopo, stateBoundsTopo.objects.states);
        // pull the zoom info from state_boundaries_zoom and attach it to the USA data, //
        // which we're trying to use as the zoomed-in data //
        d3.json('data/state_boundaries_zoom.json', function(error, stateBoundsTrueZoom) { //
          var trueStateBoundsZoom = topojson.feature(stateBoundsTrueZoom, stateBoundsTrueZoom.objects.states); //
          trueStateBoundsZoom.features.forEach(function(u) { //
            var match = stateBoundsZoom.features.filter(function(z) { //
              return z.properties.STATE_ABBV === u.properties.STATE_ABBV; //
            })[0]; //
            match.properties.ZOOM = u.properties.ZOOM; //
          }); //
        //
        // load the data and create the state boundaries in <use>
        d3.select('defs').append('g').attr('id', 'state-bounds-highres')
          .selectAll('path')
          .data(stateBoundsZoom.features, function(d) {
            return d.properties.STATE_ABBV;
          })
          .enter()
          .append('path')
          .attr('id', function(d) {
            return d.properties.STATE_ABBV+'-highres';
          })
          .attr('d', buildPath);
        // do the update to highres data
        callback(null, 'highres');
      });
      }); //
      
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
  
