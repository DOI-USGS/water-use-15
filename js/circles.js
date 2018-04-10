// CIRCLES-AS-PATHS
/*function prepareCirclePaths(categories, countyCentroids) {
  
  // uses globals scaleCircles, projectX, projectY
  
  // create an object literal of many-circle paths, one per category
  var catPaths = {};
  categories.forEach(function(cat) {
    // create an array of 1-circle paths of the form 'Mx y a r r 0 1 1 0 0.01',
    // where x is the leftmost point (cx - r), y is cy, and r is radius
    var pathArray = [];
    countyCentroids.forEach(function(d) {
      var radius = scaleCircles(d[[cat]]);
      var path = 'M' + (projectX([d.lon, d.lat]) - radius) + ' ' + projectY([d.lon, d.lat]) +
        ' a ' + radius + ' ' + radius +
        ' 0 1 1 0 0.01z';
      pathArray.push(path);
    });
  
    // concatenate into a single string for all circles in the category
    var fullPath = pathArray.join(sep=' ');
    
    catPaths[[cat]] = fullPath;
  });
  
  return catPaths;

}
function addCircles(circlesPaths) {
*/
function addCircles(countyCentroids) {
  
  // uses globals map
  
  // CIRCLES-AS-CIRCLES
  map.selectAll('g#wu-circles').selectAll('.wu-circle')
    .data(countyCentroids)
    .enter()
    .append('circle')
    .classed('wu-circle', true)
    .classed('wu-basic', true)
    .attr("id", function(d) { return "circle-"+d.GEOID; })
    .attr("cx", function(d) { return projectX([d.lon, d.lat]); })
    .attr("cy", function(d) { return projectY([d.lon, d.lat]); })
    .attr("r", 0)
    .style("fill", "transparent"); // start transparent & updateCircles will transition to color
  
  // CIRCLES-AS-PATHS
  /*
  map.selectAll('g#wu-circles')
    .datum(circlesPaths)
    .append('path')
    .classed('wu-circle', true)
    .attr('id', 'wu-path')
    .style('stroke','none')
    .style('fill', 'none'); // start transparent & updateCircles will transition to color
    */
    
  map.selectAll('g#wu-circles')
    .append('circle')
    .classed('wu-circle', true)
    .attr('id', 'wu-highlight');
  unhighlightCircle();
  
}

function updateCircles(category) {
  
  // grow circles to appropriate size
  d3.selectAll("circle.wu-basic")
    .transition().duration(1000)
    .attr("r", function(d) { return scaleCircles(d[[category]]); })
    .style("fill", categoryToColor(category))
    .style("stroke", categoryToColor(category))
    .style("stroke-width", "0.1");
  
  // CIRCLES-AS-PATHS
  /*// grow circles to appropriate size
  d3.select('#wu-path')
    .transition().duration(1000)
    .attr("d", function(d) { return d[[category]]; })
    .style("stroke", categoryToColor(category))
    .style("fill", categoryToColor(category));*/

}

function highlightCircle(countyDatum, category) {
  
  // style a duplicated circle sitting on top of the active county's circle
  map.select('circle#wu-highlight')
    .classed('hidden', false)
    .attr('cx', projectX([countyDatum.lon, countyDatum.lat]))
    .attr('cy', projectY([countyDatum.lon, countyDatum.lat]))
    .attr('r', scaleCircles(countyDatum[category]))
    .style('stroke', categoryToColor(category))
    .style('fill', categoryToColor(category));
  
}

function unhighlightCircle() {

  map.select('circle#wu-highlight')
    .classed('hidden', true);

}
