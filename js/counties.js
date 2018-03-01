function hideCounties() {
  map.selectAll('.county')
    //.data([])
    //.exit()
    .remove();
}

// call a series of functions to 
// make sure we have the USA data and then
// make sure we have this state stored in countyData and then
// visualize
function showCounties(state) {
  loadCountyData(state, displayCountyData);
}

// make sure we have the USA data and then
// call the next function (make sure we have this state stored in countyData and then visualize)
function loadCountyData(state, callback) {
  // for now let's always load the county data all at once. later we can again split
  // into single-state files if that turns out to be useful for performance.
  if(!countyData.has('USA')) {
    d3.json("data/county_boundaries_USA.json", function(error, allCountiesTopo) {
      if(error) callback(error);
      
      // extract the topojson to geojson
      allCountiesGeo = topojson.feature(allCountiesTopo, allCountiesTopo.objects.counties);
      
      // cache in countyData
      countyData.set('USA', allCountiesGeo);
      
      cacheCountyData(state, callback);
    });
  } else {
    cacheCountyData(state, callback);
  }
}

// make sure we have the state stored in countyData and then
// call the next function (visualization)
function cacheCountyData(state, callback) {
  console.log("after d3.json", countyData);
  
  // if the county boundaries for this state are already loaded, do nothing.
  // otherwise load them now. (loading currently just means subsetting them from
  // the complete set of counties). keeping this code in here because this
  // state-caching approach could be useful in near future
  if(!countyData.has(state)) {
    // convert state (an ID) into a file name (FIPS-based, at least for now)
    var stateFIPS = stateDict.filter(function(d) {
      return(d.state_abbv === state);
    })[0].state_FIPS;
    
    // subset the data and run the processing function
    oneStateCounties = countyData.get('USA').features.filter(function(d) {
      return(d.properties.STATEFP === stateFIPS)
    });
    countyData.set(state, oneStateCounties);
    callback(null, countyData.get(state));
    
    // here's how we used to download the data and run the processing function:
    // oneStateCounties = d3.json("data/" + stateFIPS + "-quantized.json", function(error, oneStateCounties) {
    //   if(error) callback(error);
    //   countyData.set(state, oneStateCounties);
    //   callback(error, countyData.get(state));
    // });
    
  } else {
    // if we already have the data, just run the processing function
    callback(null, countyData.get(state));
  }
}

// visualize
function displayCountyData(error, activeCountyData) {
    if(error) throw error;
    
    // create paths
    var countyBounds = map.selectAll(".county")
      .data(activeCountyData, function(d) {
        return d.properties.GEOID;
      });
    
    // exit
    countyBounds
      .exit()
      .remove();
      
    // enter
    countyBounds
      .enter()
      .append("path")
      .classed('county', true)
      .attr('id', function(d) {
        return d.properties.GEOID;
      })
      .text(function(d) {
        return d.properties.NAME;
      })
      .style("fill", 'none')
      .style("stroke", 'darkgrey')
      .style("stroke-width", 0.2)
      .attr('d', buildPath);
    
    // update
    countyBounds
      .attr('d', buildPath);
}
