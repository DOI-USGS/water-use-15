// functions related to the pie charts

var pie = d3.pie()
    .sort(null)
    .value(function(d) { return d.value; });

var arcpath = d3.arc()
    .innerRadius(0);

function addPieCharts() {
  
  //relies on map and pieFormData as a global variable
  
  var pies = map.selectAll('.pie')
    .data(pieFormData)
    .enter()
    .append('g')
      .classed("pie", true)
      .attr("transform", function(d) {
        var xcoord = projectX(d.coordinates),
            ycoord = projectY(d.coordinates);
        return "translate("+xcoord+","+ycoord+")";
      });
    
  
  var pieslices = map.selectAll('.pie').selectAll('.pieslice')  
      .data(function(d) {
        return d.sliceGeomData;
      });
  
  var pieenter = pieslices
      .enter()
      .append("path")
        .classed("pieslice", true);
  
  piesBaked = true;
  updatePieCharts();
  
}

function updatePieCharts() {
  
  map.selectAll('.pie').selectAll('.pieslice')
    //.transition().duration(0)
    .attr("d", arcpath.outerRadius(function(d) {
      return scaleCircles(d.data.total);
    }))
    .attr("d", arcpath)
    .attr("fill", function(d) { 
      return categoryToColor(d.data.category); 
    });
  
}

function pieData(geodata) {
  
  var pieAll = [];
  
    for (var i=0; i<geodata.features.length; i++) {
      properties = geodata.features[i].properties;
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
        coordinates: geodata.features[i].geometry.coordinates
      });
    }
    
  return pieAll;
}
