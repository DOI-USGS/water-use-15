
// call a series of functions to 
// make sure we have the USA data and then
// make sure we have this state stored in countyBoundsZoom and then
// visualize
function updateCounties(state) {
  loadCountyBounds(state, displayCountyBounds);
}

// make sure we have the USA data and then
// call the next function (make sure we have this state stored in countyBoundsZoom and then visualize)
function loadCountyBounds(state, callback) {
  
  // for now let's always load the county data all at once. later we can again split
  // into single-state files if that turns out to be useful for performance.
  if(state === 'USA') {
    // For national view, use the coarse-resolution county boundaries
    if(!countyBoundsUSA) {
      d3.json('data/county_boundaries_USA.json', function(error, allCountiesTopo) {
        if(error) throw error;
      
        // extract the topojson to geojson and add data. cache the data to a global variable, countyBoundsUSA
        allCountiesGeo = topojson.feature(allCountiesTopo, allCountiesTopo.objects.counties).features;
        countyBoundsUSA = addDataToCounties(allCountiesGeo);
        
        // do the update
        callback(null, countyBoundsUSA);
      });
    } else {
      callback(null, countyBoundsUSA);
    }
  } else if(!countyBoundsZoom.has('USA')) {
    d3.json("data/county_boundaries_USA.json", function(error, allCountiesTopo) { //
      if(error) throw error;
      
      // extract the topojson to geojson and add data
      allCountiesGeo = topojson.feature(allCountiesTopo, allCountiesTopo.objects.counties).features;
      allCountiesGeoData = addDataToCounties(allCountiesGeo);
      
      // cache in countyBoundsZoom
      countyBoundsZoom.set('USA', allCountiesGeo);
      
      cacheCountyBounds(state, callback);
    });
  } else {
    cacheCountyBounds(state, callback);
  }
}

function addDataToCounties(countyBounds) {
  // make countyCentroids easily searchable
  var countyDataMap = d3.map(countyCentroids, function(d) { return d.GEOID; });
  
  // iterate over countyBounds, adding data from countyCentroids to each
  for(var i = 0; i < countyBounds.length; i++) {
    // identify the data row (object) relevant to this county
    var currentCountyData = countyDataMap.get(countyBounds[i].properties.GEOID);
    
    // set the countyBounds properties equal to this data object.
    // no need to keep the old properties; they were just GEOID (G)
    countyBounds[i].properties = currentCountyData;
  }
  
  return(countyBounds);
}

// make sure we have the state stored in countyBoundsZoom and then
// call the next function (visualization)
function cacheCountyBounds(state, callback) {
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
    
    // apply to the boundaries. could choose between calling callback on
    // get(state), get('USA'), or multiple calls for get(multiple states)
    callback(null, countyBoundsZoom.get(state));
    
  } else {
    // if we already have the data, just run the processing function
    callback(null, countyBoundsZoom.get(state));
  }
}

// visualize
function displayCountyBounds(error, activeCountyData) {
    if(error) throw error;
    
    currentCountyBounds = map.select('#county-bounds').selectAll('.county');
    
    // return immediately if we already have the counties defined and we're zooming out
    if(currentCountyBounds._groups[0].length > 3000 & activeCountyData === countyBoundsUSA) {
      return;
    }
    
    // attach data
    var countyBounds = currentCountyBounds
      .data(activeCountyData, function(d) {
        return d.properties.GEOID;
      });
    
    // enter
    countyBounds
      .enter()
      .append("path")
      .classed('county', true) // by default, county bounds not seen
      .attr('id', function(d) {
        return d.properties.GEOID;
      })
      .attr('d', buildPath)
      .on("mouseover", function(d) {
        highlightCounty(d3.select(this)); 
        highlightCircle(d.properties, activeCategory);
        updateLegendText(d.properties, activeCategory); 
        // OK to use global var activeCategory which only changes on click 
        // because people won't be able to hover on tooltips at the same time as hovering buttons
      })
      .on("mouseout", function(d) { 
        unhighlightCounty();
        unhighlightCircle();
        updateLegendTextToView();
      })
      .on('click', function(d,i,j) {
        
        // clicking a county on mobile has no affect on the 
        // view unless it's the same county as last time
        if(waterUseViz.mode === "mobile") {
          
          var prevCounty = waterUseViz.prevClickCounty;
          var thisCountyID = d3.select(this).attr("id");
          if(prevCounty === thisCountyID) {
            
            //only zoom out if you click on the same county 
            zoomToFromState(d,i,j, d3.select(this));
            
            // hide on any zoom bc no county will be selected
            unhighlightCounty();
            unhighlightCircle();
            updateLegendTextToView(); 
          } else {
            updateCountySelector(thisCountyID);
          }          
          // set prevClickCounty as global var for next click
          waterUseViz.prevClickCounty = thisCountyID;
        } else {
          // desktop county clicks zoom in and out
          zoomToFromState(d,i,j, d3.select(this));
        }
      });
    
    // update
    countyBounds
      .attr('d', buildPath);
}
