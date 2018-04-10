// dropdown selector utils

function updateViewSelectorOptions(view, stateBounds) {
  
  var viewMenu = d3.select("body")
        .select(".view-select")
        .attr("id", "view-menu")
        .on("change", function() {
          var menu = document.getElementById("view-menu");
          var selectedView = menu.options[menu.selectedIndex].value;
          updateView(selectedView); // letting analytics fire every time for now
        });
  
  // add states as options
  var viewOptions = viewMenu.selectAll("option")
    .data(stateBounds.features)
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

