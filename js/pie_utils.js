// functions related to the pie charts

var arcpath = d3.arc()
  .innerRadius(0)
  .outerRadius(1);

function addPieSlices() {
  
  //relies on map as a global variable
  
  // add pie slices to each pie group
  map.selectAll('g.pie-scales').selectAll('.slice')  
    .data(function(d) {
      return d.sliceGeomData;
    })
    .enter()
    .append("path")
      .classed("slice", true)
      .style("fill", function(d) { 
        return categoryToColor(d.data.category); 
      })
      .attr("d", arcpath);
  
  piesBaked = true;
  
  // these newly added pie charts won't work until updatePieCharts is called, but
  // since this function always gets called from updatePieCharts, that should be fine
}

function updatePieSlices(category, delay) {
  
  // add the pies if needed
  if (!piesBaked) {
    addPieSlices();
  }
  
  if(category === 'piechart') {
    d3.selectAll(".slice")
      .transition().delay(delay).duration(0)
      .style("display", null);
  } else {
    d3.selectAll(".slice")
      .transition().delay(delay).duration(0)
      .style("display", "none");
  }
}

