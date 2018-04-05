function addCircles() {
  
  // uses globals map, countyCentroids, scaleCircles, activeCategory
  
  map.selectAll('g#wu-circles').selectAll('.circle')
    .data(countyCentroids.features)
    .enter()
    .append('circle')
    .classed('circle', true)
    .attr("id", function(d) { return "circle-"+d.properties.GEOID; })
    .attr("cx", function(d) { return projectX(d.geometry.coordinates); })
    .attr("cy", function(d) {return projectY(d.geometry.coordinates); })
    .attr("r", 0)
    .style("fill", "transparent"); // start transparent & updateCircles will transition to color
    
  circlesAdded = true;
  
  // these newly added circles won't work until updateCircles is called, but
  // since this function always gets called from updateCircles, that should be fine
}

function updateCircles(category) {
  
  // add the circles if needed
  if (!circlesAdded) {
    addCircles();
  } 

  // grow circles to appropriate size
  d3.selectAll(".circle")
    .transition().duration(1000)
    .attr("r", function(d) { return scaleCircles(d.properties[[category]]); })
    .style("fill", categoryToColor(category))
    .style("stroke", categoryToColor(category)) // we should repoint this to use a lookup in styles.js
    .style("stroke-width", "0.1");

}
