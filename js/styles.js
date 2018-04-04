// Style definitions (need them here instead of css to do transitions)
var countyStyle = {
  showbounds: {
    'stroke': 'darkgrey'
  },
  emphasize: {
    'fill': 'pink'
  },
  highlight: {
    'fill': 'darkgrey'
  }
};

function categoryToName(category) {
  if (category == "total") { return "Total"; }
  else if (category == "thermoelectric") { return "Thermoelectric"; }
  else if (category == "publicsupply") { return "Public Supply"; }
  else if (category == "irrigation") { return "Irrigation"; }
  else if (category == "industrial") { return "Industrial"; }
  else if (category == "piechart") { return "Pie Chart"; }
  else { return "none"; }
}

function categoryToColor(category) {
  if (category == "total") { return "#2678b2"; }
  else if (category == "thermoelectric") { return "#edc948"; }
  else if (category == "publicsupply") { return "#76b7b2"; }
  else if (category == "irrigation") { return "#59a14f"; }
  else if (category == "industrial") { return "#e15759"; }
  else if (category == "other") { return "#A9A9A9"; }
  else { return "none"; }
}

// on zoom in

function showCountyLines(selection) {
  selection
    //.transition()
    //.duration(750)
    .style("stroke", countyStyle.showbounds.stroke);
}
function emphasizeCounty(selection) {
  selection
    .transition()
    .duration(1000)
    .style("fill", countyStyle.emphasize.fill);
}

// on zoom out

function hideCountyLines() {
  d3.selectAll('.county')
    //.transition()
    //.duration(750)
    .style("stroke", null); // use null to revert back to whatever is in CSS
}

function deemphasizeCounty() {
  d3.selectAll('.county')
    .transition()
    .duration(750)
    .style("fill", null);
}

// on mouseover
function highlightCounty(selection) {
  d3.select(selection)
    .style("fill", countyStyle.highlight.fill);
}

// on mouseout
function unhighlightCounty(selection) {
  d3.select(selection)
    .style("fill", null);
}

