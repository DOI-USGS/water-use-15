// dropdown selector utils

function addZoomOutButton(view) {
  
  var zoomButton = d3.select("body")
    .select(".zoom-out-button");
  
  zoomButton
    .on("click", function() {
      
      // actually change the view
      updateView('USA');
        
    });
  
  // needed here in case initial view is not 'USA'
  updateZoomOutButton(view);
    
}

function updateZoomOutButton(view) {
  // hide div that button is in to let dropdowns autosize
  var zoomButtonDiv = d3.select('.zoom-out-button-container');
  if(view === 'USA'){
    //hide the zoom button at national view
    zoomButtonDiv.classed("hidden", true);
  } else {
    zoomButtonDiv.classed("hidden", false);
  }
}

function updateViewSelectorOptions(view, stateBounds) {
  
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
          
        });
  
  // add states as options
  var viewOptions = viewMenu.selectAll("option")
        .data(stateBounds.features);
  
  // add new options
  viewOptions
    .enter()
    .append("option");
  
  //update existing options with data (aka include the one that initially exists)
  viewMenu.selectAll("option")
    .property("value", function(d) { return d.properties.STATE_ABBV; })
    .text(function(d) { return d.properties.STATE_NAME; });
  
  viewMenu
    .insert("option", ":first-child")
      .property("value", "USA")
      .text("United States");
     
  // make sure default selection matches view (esp if different from USA on load)
  updateStateSelector(view);
  
  // needed here in case initial view is not 'USA'
  updateCountySelectorDropdown(view);

}

function updateStateSelector(view) {
  d3.select(".view-select")
    .selectAll("option")
    .property("selected", function(d,i) {
      if(view === 'USA') {
        return i === 0; // USA option was inserted as first, so 0 index
      } else {
        // skip over "USA" because d is undefined
        if(i === 0) { 
          return false;
        } else {
          return d.properties.STATE_ABBV === view; 
        }
      }
    });
    
  // update the available options
  if(view !== "USA") {
    addCountyOptions(view);
  }
}

function addCountyOptions(selectedView) {
  //uses global variable, `waterUseViz.countyCentroids`
  
  // filter to correct county data then update dropdowns
  var stateCountyData = waterUseViz.countyCentroids
    .filter(function(d) { return d.STATE_ABBV === selectedView; });
  updateCountySelectorOptions(stateCountyData);
}

function updateCountySelectorOptions(countyData) {
  
  var countyMenu = d3.select("body")
        .select(".county-select")
        .attr("id", "county-menu")
        .on("change", function() {
          
          // start by resetting what is highlighted
          unhighlightCounty();
          unhighlightCircle();
          updateLegendTextToView();
          
          var menu = document.getElementById("county-menu");
          var thisCountyGEOID = menu.options[menu.selectedIndex].value;
          
          if(thisCountyGEOID != "Select County") {
            var thisCountySel = d3.selectAll('.county')
                  .filter(function(d) { return d.properties.GEOID === thisCountyGEOID; });
            var thisCountyData = countyData.filter(function(d) { return d.GEOID === thisCountyGEOID; })[0];
            
            highlightCounty(thisCountySel);
            highlightCircle(thisCountyData, activeCategory);
            updateLegendText(thisCountyData, activeCategory);
            
            // set prevClickCounty as global var for next click
            waterUseViz.prevClickCounty = thisCountyGEOID;
          }
        });
        
  // alphabetize counties
  countyData.sort(function(a,b) { return d3.ascending(a.COUNTY, b.COUNTY); });
  
  // bind data to options in county dropdown menu
  var countyOptions = countyMenu
        .selectAll("option")
          .data(countyData);
          
  // remove old options
  countyOptions
    .exit()
      .remove();
  
  // add new options
  countyOptions
    .enter()
    .append("option");
  
  //update existing options with data
  countyMenu.selectAll("option")
    .property("value", function(d) { return d.GEOID; })
    .text(function(d) { return d.COUNTY; });
  
  countyMenu
    .insert("option", ":first-child")
      .property("value", "Select County")
      .text("--Select County--");
  resetCountySelector();
  
}

function updateCountySelectorDropdown(view) {
  // hide county selector at the national scale
  var countySelectorDiv = d3.select('.county-custom-select');
  if(view === 'USA'){
    //grey out the zoom button at national view
    countySelectorDiv.classed("hidden", true);
  } else {
    countySelectorDiv.classed("hidden", false);
  }
}

function updateCountySelector(countyGeoid) {
  
  d3.select("body")
    .select(".county-select")
    .selectAll("option")
      .property("selected", function(d,i) {
        if(i === 0) { // skip over "--Select County--" because d is undefined
          return false;
        } else {
          return d.GEOID === countyGeoid; 
        }
      });
}

function resetCountySelector() {
    
  d3.select("body")
    .select(".county-select")
    .selectAll("option")
      .property("selected", function(d,i) {
        // select county was just inserted into the first spot (so index 0) above
        return i === 0; 
      });
}

//Expand National Pie Mapp mobile text
window.addEventListener('load', function(event){
  var expandInteract = document.getElementById('national-static-pie-mobile-interact');
  var contentToShow = document.getElementById('national-static-pie-mobile-content');
  expandInteract.onclick = function(){
    if(contentToShow.style.display === "block"){
      contentToShow.style.display="none";
      expandInteract.innerHTML = 'Read More'
    }else{
      contentToShow.style.display="block";
      expandInteract.innerHTML = 'Hide'
    }
    
  };
});


