// functions related to the pie charts

function addPieSlices() {
  
  //relies on map as a global variable
  
  // add pie slices to each pie group
  map.selectAll('g.pie').selectAll('.pieslice')  
    .data(function(d) {
      return [d.sliceGeomData];
    })
    .enter()
    .append("path")
      .classed("pieslice", true)
      .attr("fill", function(d) { 
        return categoryToColor(d.data.category); 
      });
  
  piesBaked = true;
  
  // these newly added pie charts won't work until updatePieCharts is called, but
  // since this function always gets called from updatePieCharts, that should be fine
}

var arcpath = d3.arc()
  .innerRadius(0)
  .outerRadius(1);

function updatePieSlices(prevTransition) {
  
  // add the pies if needed
  if (!piesBaked) {
    addPieSlices();
  }
  
  var newTransition = map.selectAll('.pieslice') 
    .transition(prevTransition).duration(0);
    
  return newTransition;
}

