
function categoryToName(category) {
  if (category === "total") { return "Total"; }
  else if (category === "thermoelectric") { return "Thermoelectric"; }
  else if (category === "publicsupply") { return "Public Supply"; }
  else if (category === "irrigation") { return "Irrigation"; }
  else if (category === "industrial") { return "Industrial"; }
  else if (category === "other") { return "Other"; }
  else { return "none"; }
}

function categoryToColor(category, stroke) {
  
  if(stroke === undefined) {
      stroke = false;
   }  
  
  var opacityValue = 0.8;
  if(stroke) {
    opacityValue = 1;
  }
  
  if (category === "total") { return "rgba(38, 140, 178, "+opacityValue+")"; }
  else if (category === "thermoelectric") { return "rgba(237, 201, 72, "+opacityValue+")"; }
  else if (category === "publicsupply") { return "rgba(118, 183, 178, "+opacityValue+")"; }
  else if (category === "irrigation") { return "rgba(89, 161, 79, "+opacityValue+")"; }
  else if (category === "industrial") { return "rgba(225, 87, 89, "+opacityValue+")"; }
  else if (category === "other") { return "rgba(169, 169, 169, "+opacityValue+")"; }
  else { return "none"; }
}

// on zoom in

function showCountyLines(selection, scale) {
  if(scale === undefined) {
      scale = 1;
   }
  
  selection
    .classed("show-county-bounds", true) // used so that hideCountyLines can easily select
    .style("stroke-width",  1/scale); // don't wait to scale stroke-width after lines added
    
}
function emphasizeCounty(selection) {
  selection
    .classed("emphasize-county", true);
}

function foregroundState(selection, scale) {
   if(scale === undefined) {
      scale = 1;
   }
  
  selection
    .transition()
    .duration(500)
    .style("stroke-width",  2/scale); // scale stroke-width
    
  if(waterUseViz.mode === "mobile") {
    // turn off state pointer events for this state so that counties can be chosen
    selection
      .classed("state-click-on", false)
      .classed("state-click-off", true);
  }
  
}

function backgroundState(selection, scale) {
   if(scale === undefined) {
      scale = 1;
   }
  
  selection
    .transition()
    .duration(500)
    .style("stroke-width",  1/scale); // scale stroke-width;
}

// on zoom out

function hideCountyLines() {
  d3.selectAll('.show-county-bounds')
    .classed("show-county-bounds", false); // revert to stroke in .county definition
}

function deemphasizeCounty() {
  d3.selectAll('.emphasize-county')
    .classed("emphasize-county", false);
}

function resetState() {
  d3.selectAll('.state')
    .transition()
    .duration(750)
    .style("stroke-width", 1); // use null to get back to CSS
  
  if(waterUseViz.mode === "mobile") {
    // turn on state pointer events for all states so that counties cannot be chosen
    d3.selectAll('.state')
      .classed("state-click-on", true)
      .classed("state-click-off", false);
  }
}

// on mouseover
function highlightCounty(selection) {
  selection
    .classed("highlighted-county", true);
}

// on mouseout
function unhighlightCounty() {
  d3.selectAll('.highlighted-county')
    .classed("highlighted-county", false);
}

function scaleCircleStroke(selection, scale) {
  selection
    .style("stroke-width", 2/scale+"px");
}

function resetCircleStroke() {
  //resets stroke-width to whatever is coming from CSS
  d3.selectAll('.wu-circle')
    .transition()
    .delay(500) // delay until > 1/2 way through zoom out
    .style("stroke-width", null);
}
