// map functions

function add_states(map, state_data) {
  
  // add states
  map.append("g").attr('id', 'statepolygons')
    .selectAll( 'path' )
    .data(state_data.features)
    .enter()
    .append('path')
    .classed('state', true)
    .attr('d', buildPath);
}

function zoom_to_state() {
  
  
  
}
