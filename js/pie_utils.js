// functions related to the pie charts

var pie = d3.pie()
  .sort(null)
  .value(function(d) { return d.value; });

var arcpath = d3.arc()
  .innerRadius(0);

function addPieCharts() {
  
  //relies on map and pieFormData as a global variable
  
  // each pie is a group of pie slices. here add the pie groups
  var pies = map.selectAll('.pie')
    .data(pieFormData);
  var piesMerged = pies
    .enter()
    .append('g')
      .classed("pie", true)
      .attr("transform", function(d) {
        return "translate(" + d.coordinates.x + "," + d.coordinates.y + ")";
      })
      .merge(pies);
  
  // add pie slices to each pie group
  piesMerged.selectAll('.pieslice')  
    .data(function(d) {
      return d.sliceGeomData;
    })
    .enter()
    .append("path")
      .classed("pieslice", true);
  
  piesBaked = true;
  
  // these newly added pie charts won't work until updatePieCharts is called, but
  // since this function always gets called from updatePieCharts, that should be fine
}

function updatePieCharts() {
  
  // add the pies if needed
  if (!piesBaked) {
    addPieCharts();
  }
  
  map.selectAll('.pie').selectAll('.pieslice')
    //.transition().duration(0)
    .attr("d", arcpath.outerRadius(function(d) {
      return scaleCircles(d.data.total);
    }))
    .attr("fill", function(d) { 
      return categoryToColor(d.data.category); 
    });
  
}

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
        coordinates: {
          x: proj[0],
          y: proj[1]
        }
      });
    }
    
  return pieAll;
}
