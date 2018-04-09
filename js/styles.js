
function categoryToName(category) {
  if (category === "total") { return "Total"; }
  else if (category === "thermoelectric") { return "Thermoelectric"; }
  else if (category === "publicsupply") { return "Public Supply"; }
  else if (category === "irrigation") { return "Irrigation"; }
  else if (category === "industrial") { return "Industrial"; }
  else { return "none"; }
}

function categoryToColor(category) {
  if (category === "total") { return "rgba(38, 120, 178, 0.8)"; }
  else if (category === "thermoelectric") { return "rgba(237, 201, 72, 0.8)"; }
  else if (category === "publicsupply") { return "rgba(118, 183, 178, 0.8)"; }
  else if (category === "irrigation") { return "rgba(89, 161, 79, 0.8)"; }
  else if (category === "industrial") { return "rgba(225, 87, 89, 0.8)"; }
  else if (category === "other") { return "rgba(169, 169, 169, 0.8)"; }
  else { return "none"; }
}

// on zoom in

function showCountyLines(selection) {
  selection
    .classed("show-county-bounds", true);
}
function emphasizeCounty(selection) {
  selection
    .classed("emphasize-county", true);
}

function foregroundState(selection, scale = 1) {
  selection
    .transition()
    .duration(500)
    .style("stroke-width",  2.5/scale); // scale stroke-width
}

function backgroundState(selection, scale = 1) {
  selection
    .transition()
    .duration(500)
    .style("stroke-width",  0.75/scale); // scale stroke-width;
}

// on zoom out

function hideCountyLines() {
  d3.selectAll('.county')
    .classed("show-county-bounds", false); 
}

function deemphasizeCounty() {
  d3.selectAll('.county')
    .classed("emphasize-county", false);
}

function resetState() {
  d3.selectAll('.state')
    .transition()
    .duration(750)
    .style("stroke-width", null); // use null to get back to CSS
}

// on mouseover
function highlightCounty(selection) {
  d3.select(selection)
    .classed("highlighted-county", true);
}

// on mouseout
function unhighlightCounty(selection) {
  d3.select(selection)
    .classed("highlighted-county", false);
}

