function hideCounties() {
  console.log("hiding counties");
}

function showCounties(state) {
  console.log("showing counties for state " + state);
  loadCountyData(state, displayCountyData);
}

function loadCountyData(state, callback) {
  // if the county boundaries for this state are already loaded, do nothing.
  // otherwise load them now
  if(!countyData.has(state)) {
    // convert state (an ID) into a file name (FIPS-based, at least for now)
    var stateFIPS = stateDict.filter(function(d) {
      return(d.state_abbv === state);
    })[0].state_FIPS;
    
    console.log('downloading ' + "data/" + stateFIPS + "-quantized.json");
    
    // download the data and run the processing function
    oneStateCounties = d3.json("data/" + stateFIPS + "-quantized.json", function(error, oneStateCounties) {
      if(error) callback(error);
      countyData.set(state, oneStateCounties);
      callback(error, countyData.get(state));
    });
  } else {
    // if we already have the data, just run the processing function
    callback(null, countyData.get(state));
  }
}

function displayCountyData(error, activeCountyData) {
    if(error) throw error;
    
    // extract the topojson to geojson
    var geojson = topojson.feature(activeCountyData, activeCountyData.objects.state_01);
  
    // create paths
    svg.selectAll(".county")
      .data(geojson.features)
      .enter()
      .append("path")
      .classed('county', true)
      .attr('id', function(d) {
        return d.properties.county_FIPS;
      })
      .attr('d', buildPath)
      .style("fill", 'none')
      .style("stroke", 'green')
      .style("stroke-width", 0.5);
}
