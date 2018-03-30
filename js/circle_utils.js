function addPieTins() {
  
  // uses globals map, countyCentroids, scaleCircles, activeCategory
  
  map.selectAll('g.pie').selectAll('.tin')
    .data(function(d) {
      return [d.properties];
    })
    .enter()
    .append('circle')
    .classed('tin', true)
    .attr("id", function(d) { return "circle-"+d.GEOID; })
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", 1);
    
  tinsAdded = true;
  
  // these newly added circles won't work until updatePieTins is called, but
  // since this function always gets called from updatePieTins, that should be fine
}

function updatePieTins(category, delay, duration) {
  
  // add the circles if needed
  if (!tinsAdded) {
    addPieTins();
  }

  if(category === 'piechart') {
    d3.selectAll(".tin")
      .transition().delay(delay).duration(duration)
      .style("fill", "transparent")
      .style("stroke", "lightgrey")
      .style("stroke-width", "0.01");
  } else {
    d3.selectAll(".tin")
      .transition().delay(delay).duration(duration)
      .style("fill", categoryToColor(category))
      .style("stroke", "transparent"); // we should repoint this to use a lookup in styles.js

  }
}
