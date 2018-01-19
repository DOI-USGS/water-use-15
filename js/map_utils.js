// map functions

function add_states(map, state_data) {
  
  // add states
  map.append("g").attr('id', 'statepolygons')
    .selectAll( 'path' )
    .data(state_data.features)
    .enter()
    .append('path')
    .attr('d', buildPath);
}
