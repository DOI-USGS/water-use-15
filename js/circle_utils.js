function addCircles() {
  
  // uses globals map, countyCentroids, scaleCircles, activeCategory
  
  var circleGroup = map.append('g')
    .classed('circles', true);
  circleGroup.selectAll('.county-point')
    .data(countyCentroids.features)
    .enter()
    .append('circle')
    .classed('county-point', true)
    .attr("cx", function(d) {
      var coordx = projectX(d.geometry.coordinates);
      if(coordx === 0) { console.log(d); } // moved outside of project function bc coordinates aren't always d.geometry.coordinates (like in pies)
      return coordx;
    })
    .attr("cy", function(d) { 
      return projectY(d.geometry.coordinates);
    })
    // this is OK to not worry about it changing on hover (activeCategory only changes on click) 
    // because people won't be able to see tooltips at the same time anyways
    .on("mouseover", function(d) { showToolTip(this, d, activeCategory); })
    .on("mouseout", function(d) { hideTooltip(this, d); });
    
  circlesAdded = true;
  
  // these newly added circles won't work until updateCircles is called, but
  // since this function always gets called from updateCircles, that should be fine
}

function updateCircles(category) {
  
  // add the circles if needed
  if (!circlesAdded) {
    addCircles();
  }

  d3.selectAll(".county-point")
    .sort(function(a,b) { 
      return d3.descending(a.properties[[category]], b.properties[[category]]);
    })
    //.transition().duration(0)
    .attr("r", function(d) {
      return scaleCircles(d.properties[[category]]);
    })
    .style("fill", categoryToColor(category));
      
  d3.selectAll(".legend-point")
    .transition().duration(600)
    .style("fill", categoryToColor(category));
    
}
