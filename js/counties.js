
function hideCountyLines() {
  d3.selectAll('.county')
    .classed('hidden-border', true);
}

function showCountyLines(state) {
  d3.selectAll('.county')
    .classed('hidden-border', false);
}

// call a series of functions to 
// make sure we have the USA data and then
// make sure we have this state stored in countyBoundsZoom and then
// visualize
function updateCounties(state) {
  loadCountyData(state, displayCountyBounds);
}

// make sure we have the USA data and then
// call the next function (make sure we have this state stored in countyBoundsZoom and then visualize)
function loadCountyData(state, callback) {
  // for now let's always load the county data all at once. later we can again split
  // into single-state files if that turns out to be useful for performance.
  if(state === 'USA') {
    // For national view, use the coarse-resolution county boundaries
    if(!countyBoundsUSA) {
      d3.json('data/county_boundaries_USA_wu.json', function(error, allCountiesTopo) {
        // cache the data to a global variable
        countyBoundsUSA = topojson.feature(allCountiesTopo, allCountiesTopo.objects.counties).features;
        // do the update
        callback(null, countyBoundsUSA);
      });
    } else {
      callback(null, countyBoundsUSA);
    }
  } else if(!countyBoundsZoom.has('USA')) {
    d3.json("data/county_boundaries_zoom_wu.json", function(error, allCountiesTopo) {
      if(error) throw error;
      
      // extract the topojson to geojson
      allCountiesGeo = topojson.feature(allCountiesTopo, allCountiesTopo.objects.counties).features;
      
      // cache in countyBounds
      countyBoundsZoom.set('USA', allCountiesGeo);
      
      cacheCountyData(state, callback);
    });
  } else {
    cacheCountyData(state, callback);
  }
}

// make sure we have the state stored in countyBoundsZoom and then
// call the next function (visualization)
function cacheCountyData(state, callback) {
  // if the county boundaries for this state are already loaded, do nothing.
  // otherwise load them now. (loading currently just means subsetting them from
  // the complete set of counties). keeping this code in here because this
  // state-caching approach could be useful in near future
  if(!countyBoundsZoom.has(state)) {
    // subset the data and run the processing function
    oneStateCounties = countyBoundsZoom.get('USA').filter(function(d) {
      return(d.properties.STATE_ABBV === state);
    });
    countyBoundsZoom.set(state, oneStateCounties);
    callback(null, countyBoundsZoom.get(state));
    
    // here's how we used to download the data and run the processing function:
    // oneStateCounties = d3.json("data/" + stateFIPS + "-quantized.json", function(error, oneStateCounties) {
    //   if(error) callback(error);
    //   countyBoundsZoom.set(state, oneStateCounties);
    //   callback(error, countyBoundsZoom.get(state));
    // });
    
  } else {
    // if we already have the data, just run the processing function
    callback(null, countyBoundsZoom.get(state));
  }
}

// visualize
function displayCountyBounds(error, activeCountyData) {
    console.log('start displayCountyBounds');
    if(error) throw error;
    
    // create paths
    var countyBounds = map.select('#county-bounds')
      .selectAll(".county")
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
      .classed('hidden-border', true) // add county shapes, but don't outline
      .attr('id', function(d) {
        return d.properties.GEOID;
      })
      .attr('d', buildPath)
      .on("mouseover", function(d) {
        highlightState(d3.select("#"+d.properties.STATE_ABBV));
        highlightCounty(this); 
        highlightCircle(d3.select("#"+"circle-"+d.properties.GEOID));
        showToolTip(d, activeCategory); 
        // OK to use global var activeCategory which only changes on click 
        // because people won't be able to hover on tooltips at the same time as hovering buttons
      })
      .on("mouseout", function(d) { 
        unhighlightState(d3.select("#"+d.properties.STATE_ABBV));
        unhighlightCounty(this);
        unhighlightCircle();
        hideToolTip();
      })
      .on('click', zoomToFromState);
    
    // update
    countyBounds
      .attr('d', buildPath);
    console.log('end displayCountyBounds');
}
