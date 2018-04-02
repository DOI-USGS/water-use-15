// functions related to the symbol groups

// each pie is a group of pie slices and a pie tin (a circle). here add the pie groups
function addPies() {
  map.selectAll('g.pie-locations')
    .data(pieFormData)
    .enter()
    .append('g')
      .classed("pie-locations", true)
      .attr("transform", function(d) {  
        return "translate(" + d.coordinates.x + " " + d.coordinates.y + ")";
      })
      .append('g')
      .classed("pie-scales", true);
}
function updatePies(category, prevCategory) {
  
  // find the pies (groups of slices and tins=circles)
  var pies = map.selectAll('g.pie-scales');
  
  // define duration times for each phase (in milliseconds)
  var animDur = 1000;
  
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
    .transition()
      .ease(d3.easeLinear)
      .duration(animDur/2)
      .attr("transform", function(d) {  
        var halfheight = (scaleCircles(d.properties[[oldCat]]) + scaleCircles(d.properties[[newCat]])) / 2;
        return "scale(0.1 " + halfheight + ")";
      })
    .transition()
      .ease(d3.easeLinear)
      .duration(animDur/2).delay(animDur/2)
      .attr("transform", function(d) {  
        return "scale(" + scaleCircles(d.properties[[newCat]]) + ")";
      });
      

  updatePieSlices(category, animDur/2);
  updatePieTins(category, animDur/2);
    
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
