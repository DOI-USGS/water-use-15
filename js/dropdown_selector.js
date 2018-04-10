// dropdown selector utils

function addZoomOutButton(view) {
  
  var zoomButton = d3.select("body")
    .select(".zoom-out-button");
  
  zoomButton
    .on("click", function() {
      
      // actually change the view
      updateView('USA');
      
      // change selector back to default
      d3.select("body")
        .select(".view-select")
        .selectAll("option")
        .property("selected", function(d){ 
          return d.properties.STATE_ABBV === 'USA'; 
        });
        
    });
  
  // needed here in case initial view is not 'USA'
  updateZoomOutButton(view);
    
}

function updateZoomOutButton(view) {
  var zoomButton = d3.select('.zoom-out-button');
  if(view === 'USA'){
    //grey out the zoom button at national view
    zoomButton.classed("hidden", true);
  } else {
    zoomButton.classed("hidden", false);
  }
}

function updateViewSelectorOptions(view, stateBounds, countyCentroids) {
  
  var viewMenu = d3.select("body")
        .select(".view-select")
        .attr("id", "view-menu")
        .on("change", function() {
          
          // change the zoom
          var menu = document.getElementById("view-menu");
          var selectedView = menu.options[menu.selectedIndex].value;
          updateView(selectedView); // letting analytics fire every time for now
          
          // reset county highlights
          unhighlightCounty();
          unhighlightCircle();
          
          // filter to correct county data then update dropdowns
          var stateCountyData = countyCentroids
            .filter(function(d) { return d.STATE_ABBV === selectedView; });
          updateCountySelectorOptions(stateCountyData);
          
        });
  
  // add states as options
  var viewOptions = viewMenu.selectAll("option")
    .data(stateBounds.features) // ALABAMA IS CURRENTLY MISSING
    .enter()
    .append("option")
      .property("value", function(d) { return d.properties.STATE_ABBV; })
      .text(function(d) { return d.properties.STATE_NAME; });
        
  // change default selection if view is different from USA on load
  if(view !== "USA") {
    viewOptions.property("selected", function(d){ 
        return d.properties.STATE_ABBV === view; 
      });
  }

}

function updateCountySelectorOptions(countyData) {
  
  var countyMenu = d3.select("body")
        .select(".county-select")
        .attr("id", "county-menu")
        .on("change", function() {
          
          // start by resetting what is highlighted
          unhighlightCounty();
          unhighlightCircle();
          
          var menu = document.getElementById("county-menu");
          var thisCountyGEOID = menu.options[menu.selectedIndex].value;
          var thisCountySel = d3.selectAll('.county')
                .filter(function(d) { return d.properties.GEOID === thisCountyGEOID; });
          var thisCountyData = countyData.filter(function(d) { return d.GEOID === thisCountyGEOID; })[0];
          
          highlightCounty(thisCountySel);
          highlightCircle(thisCountyData, activeCategory);
          
          console.log("this will also update the data in the category legend");
        });
        
  // add counties as options
  var countyOptions = countyMenu
        .selectAll("option")
        .data(countyData);
  
  // add new options
  countyOptions
    .enter()
    .append("option")
      .property("value", function(d) { return d.GEOID; })
      .text(function(d) { return d.COUNTY; });
  
  // remove old options -- NOT WORKING RIGHT NOW
  // countyOptions.exit().remove();
}