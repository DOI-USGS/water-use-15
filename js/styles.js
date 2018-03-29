// Style definitions (need them here instead of css to do transitions)
var stateStyle = {
  nationView: {
    active: {
      'fill': '#BEBEBE',
      'stroke': 'transparent', // looks OK white, too
      'stroke-width': 0
    },
    inactive: {
      'fill': '#DCDCDC',
      'stroke': 'transparent', // i think we're avoiding borders usually?
      'stroke-width': 0
    }
  },
  stateView: {
    active: {
      'fill': '#DCDCDC',
      'stroke': 'transparent', // no need for border when there's fill
      'stroke-width': 0
    },
    inactive: {
      'fill': 'transparent',
      'stroke': 'transparent', // could use #DCDCDC to show neighbor outlines
      'stroke-width': 0
    }
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
  if (category == "total") { return "rgba(46, 134, 171, 0.8)"; }
  else if (category == "thermoelectric") { return "rgba(252,186,4, 0.8)"; }
  else if (category == "publicsupply") { return "rgba(186,50,40, 0.8)"; }
  else if (category == "irrigation") { return "rgba(155,197,61, 0.8)"; }
  else if (category == "industrial") { return "rgba(138,113,106, 0.8)"; }
  else if (category == "other") { return "rgba(143,73,186, 0.8)"; }
  else { return "none"; }
}
