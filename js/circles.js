function prepareCirclePaths(categories, countyCentroids) {
  
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
        ' 0 1 1 0 0.01';
      pathArray.push(path);
    });
  
    // concatenate into a single string for all circles in the category
    var fullPath = pathArray.join(sep=' ');
    
    catPaths[[cat]] = fullPath;
  });
  
  return catPaths;
}

function addCircles(circlesPaths) {
  
  // uses globals map
  
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
  
}

function updateCircles(category) {
  
  // grow circles to appropriate size
  d3.select('.wu-path')
    .transition().duration(1000)
    .attr("d", function(d) { return d[[category]]; })
    .style("fill", categoryToColor(category))
    .style("stroke", categoryToColor(category))
    .style("stroke-width", "0.1");

}

function highlightCircle(countyDatum, category) {
  // style a duplicated circle sitting on top of the active county's circle
  console.log(categoryToColor(category));
  map.select('circle#wu-highlight')
    .classed('hidden', false)
    .attr('cx', projectX([countyDatum.properties.lon, countyDatum.properties.lat]))
    .attr('cy', projectY([countyDatum.properties.lon, countyDatum.properties.lat]))
    .attr('r', scaleCircles(countyDatum.properties[category]))
    .style('fill', categoryToColor(category))
    .style('stroke', categoryToColor(category));
}

function unhighlightCircle() {
  map.select('circle#wu-highlight')
    .classed('hidden', true);
