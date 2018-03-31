// Style definitions (need them here instead of css to do transitions)
var stateStyle = {
  nationView: {
    active: {
      'fill': 'white',
      'stroke': 'black', // looks OK white, too
      'stroke-width': 1.5
    },
    inactive: {
      'fill': 'white',
      'stroke': 'black', // i think we're avoiding borders usually?
      'stroke-width': 1.0
    }
  },
  stateView: {
    active: {
      'fill': '#DCDCDC',
      'stroke': 'black', // no need for border when there's fill
      'stroke-width': 1.5
    },
    inactive: {
      'fill': 'transparent',
      'stroke': 'black', // could use #DCDCDC to show neighbor outlines
      'stroke-width': 1.0
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
  if (category == "total") { return "#2678b2"; }
  else if (category == "thermoelectric") { return "#edc948"; }
  else if (category == "publicsupply") { return "#76b7b2"; }
  else if (category == "irrigation") { return "#59a14f"; }
  else if (category == "industrial") { return "#e15759"; }
  else if (category == "other") { return "#A9A9A9"; }
  else { return "none"; }
}
