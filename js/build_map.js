// Width and height
var chart_width     =   1000;
var chart_height    =   600;

// Projection
var projection = d3.geoAlbers()
    .scale([1200])
    // default is .rotate([96,0]) to center on US (we want this)
    .translate([chart_width / 2, chart_height / 2]);
var buildPath = d3.geoPath()
    .projection(projection);

// Create SVG
var svg = d3.select("body")
    .append("svg")
    .attr("width", chart_width)
    .attr("height", chart_height);
    
var map = svg.append("g")
  .attr("id", "map");
  
d3.queue()
  .defer(d3.json, "data/conus_map.geojson")
  .await(create_map);

function create_map() {
  
  // arguments[0] is the error
	var error = arguments[0];
	if (error) throw error;

	// the rest of the indices of arguments are all the other arguments passed in -
	// so in this case, all of the results from q.await
	var state_data = arguments[1];
  
  add_states(map, state_data);
  
}
