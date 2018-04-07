function prepareCirclePaths(categories, countyCentroids) {
  
  // uses globals scaleCircles, projectX, projectY
  
  // create an object literal of many-circle paths, one per category
  var catPaths = {};
  categories.forEach(function(cat) {
    // create an array of 1-circle paths of the form 'Mx y a r r 0 1 1 0 0.01'
    var pathArray = [];
    countyCentroids.features.forEach(function(d) {
      var path = 'M' + projectX(d.geometry.coordinates) + ' ' + projectY(d.geometry.coordinates) +
        ' a ' + scaleCircles(d.properties[['total']]) + ' ' + scaleCircles(d.properties[['total']]) +
        ' 0 1 1 0 0.01';
      pathArray.push(path);
    });
  
    // concatenate into a single string for all circles in the category
    var fullPath = pathArray.join(sep=' ');
    
    catPaths[[cat]] = fullPath;
  });
  
  return catPaths;
}

function addCircles() {
  
  // uses globals map, circlesPaths, activeCategory, projectX, projectY
  
  /*map.selectAll('g#wu-circles').selectAll('.circle')
    .data(countyCentroids.features)
    .enter()
    .append('circle')
    .classed('circle', true)
    .attr("id", function(d) { return "circle-"+d.properties.GEOID; })
    .attr("cx", function(d) { return projectX(d.geometry.coordinates); })
    .attr("cy", function(d) { return projectY(d.geometry.coordinates); })
    .attr("r", 0)
    .style("fill", "transparent"); // start transparent & updateCircles will transition to color*/
  
  map.selectAll('g#wu-circles')
    .datum(circlesPaths)
    .append('path')
    .classed('wu-path', true)
    .style('stroke','transparent')
    .style('fill', "transparent"); // start transparent & updateCircles will transition to color
    
  map.selectAll('g#wu-circles')
    .append('circle')
    .classed('wu-highlight', true)
    .style('pointer-events', 'none')
    .style('opacity', 1);
  unhighlightCircle()
  
  circlesAdded = true;
  
  // these newly added circles won't work until updateCircles is called, but
  // since this function always gets called from updateCircles, that should be fine
}

function updateCircles(category) {
  
  // add the circles if needed
  if (!circlesAdded) {
    addCircles();
  } 

  /*// grow circles to appropriate size
  d3.selectAll(".circle")
    .transition().duration(1000)
    .attr("r", function(d) { return scaleCircles(d.properties[[category]]); })
    .style("fill", categoryToColor(category))
    .style("stroke", categoryToColor(category))
    .style("stroke-width", "0.1");*/
    
  // grow circles to appropriate size
  d3.select('.wu-path')
    .transition().duration(1000)
    .attr("d", function(d) { return d[[category]]; })
    .style("fill", categoryToColor(category))
    .style("stroke", categoryToColor(category))
    .style("stroke-width", "0.1");

}
