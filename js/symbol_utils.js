// functions related to the symbol groups

// each pie is a group of pie slices and a pie tin (a circle). here add the pie groups
function addPies() {
  map.selectAll('g.pie')
    .data(pieFormData)
    .enter()
    .append('g')
      .classed("pie", true);
}

function updatePies(category, prevCategory) {
  
  // find the pies (groups of slices and tins=circles)
  var pies = map.selectAll('g.pie');
  
  // define duration times for each phase (in milliseconds)
  var t1 = 500, t2 = 50, t3 = 500;
  
  var oldRadius, newRadius;
  if(prevCategory === 'piechart') {
    oldCat = 'total';
  } else {
    oldCat = prevCategory;
  }
  if(category === 'piechart') {
    newCat = 'total';
  } else {
    newCat = category;
  }
  
  // phase 1: sort and then transition width to 0, height to halfway to new value
  pies
    /*.sort(function(a,b) { 
      return d3.descending(a.properties[[category]], b.properties[[category]]);
    })*/
    .transition().duration(t1)
    /*.attr("style", function(d) {  
      var halfheight = (scaleCircles(d.properties[[oldCat]]) + scaleCircles(d.properties[[newCat]])) / 2;
      return "transform: "+
               "translate(" + d.coordinates.x + "," + d.coordinates.y + ") "+
               "scale(0 " + halfheight + ")";
    });*/
    .attr("transform", function(d) {  
      var halfheight = (scaleCircles(d.properties[[oldCat]]) + scaleCircles(d.properties[[newCat]])) / 2;
      return "translate(" + d.coordinates.x + " " + d.coordinates.y + ")"+
             "scale(0 " + halfheight + ")";
    });
    /*.style(function(d) {
      var halfheight = (scaleCircles(d.properties[[oldCat]]) + scaleCircles(d.properties[[newCat]])) / 2;
      return {
        transform: "translate(" + d.coordinates.x + " " + d.coordinates.y + ")"+
                   "scale(0 " + halfheight + ")"
        //transition: "all 1s ease-in-out"}; 
      };
    });*/
    
  // phase 2: quickly switch to new view
  updatePieSlices(category, t1, t2);
  updatePieTins(category, t1, t2);
    
  // phase 3: transition to final width and height
  pies.transition().delay(t1+t2).duration(t3)
    /*.attr("style", function(d) {  
      var halfheight = (scaleCircles(d.properties[[oldCat]]) + scaleCircles(d.properties[[newCat]])) / 2;
      return "transform: "+
               "translate(" + d.coordinates.x + "," + d.coordinates.y + ") "+
               "scale(0 " + scaleCircles(d.properties[[newCat]]) + ")";
    });*/
    .attr("transform", function(d) {  
      return "translate(" + d.coordinates.x + " " + d.coordinates.y + ")"+
             "scale(" + scaleCircles(d.properties[[newCat]]) + ")";
    });
    /*.style(function(d) {
      return {
        transform: "translate(" + d.coordinates.x + " " + d.coordinates.y + ")"+
                   "scale(0 " + scaleCircles(d.properties[[newCat]]) + ")"
        //transition: "all 1s ease-in-out"}; 
      };
    });*/
}


//// Data preparation ////

var pie = d3.pie()
  .sort(null)
  .value(function(d) { return d.value; });

function pieData(geodata) {
  
  var pieAll = [];
  
    for (var i=0; i<geodata.features.length; i++) {
      properties = geodata.features[i].properties;
      var proj = projection(geodata.features[i].geometry.coordinates);
      if(proj === null) {
        console.log('bad projection:');
        console.log(proj);
        console.log(geodata.features[i]);
      }
      pieAll.push( {
        sliceGeomData: pie([
          { "category": "thermoelectric", 
            "value": properties.thermoelectric,
            "total": properties.total
          },
          { "category": "publicsupply", 
            "value": properties.publicsupply,
            "total": properties.total
          },
          { "category": "irrigation", 
            "value": properties.irrigation,
            "total": properties.total
          },
          { "category": "industrial", 
            "value": properties.industrial,
            "total": properties.total
          },
          { "category": "other", 
            "value": properties.other,
            "total": properties.total
          }]),
        properties: properties,
        coordinates: {
          x: proj[0],
          y: proj[1]
        }
      });
    }
    
  return pieAll;
}
