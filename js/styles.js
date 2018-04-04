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
    .classed("show-county-bounds", true);
}
function emphasizeCounty(selection) {
  selection
    .classed("emphasize-county", true);
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

