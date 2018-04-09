// code to add a static pie chart of the national view

var width = 1000,
    height = 300,
    radius = Math.min(width, height) / 2;

var piearea = d3.select("#national-pie")
      .append("svg")
        .attr('viewBox', '0 0 '+width+' '+height);
  
var pie_g = piearea
      .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var pie = d3.pie()
    .value(function(d) { return d.wateruse; });
    
var path = d3.arc()
    .outerRadius(radius)
    .innerRadius(0);
  
d3.json("data/wu_data_15_sum.json", function(error, wu_national_data) {
  
  var wu_national_no_total = wu_national_data
        .filter(function(d) { return d.category !== "total"; });
  
  var slices = pie_g.selectAll(".slice")
    .data(pie(wu_national_no_total))
    .enter()
    .append("g")
      .attr("class", "slice");
      
  slices
      .append("path")
        .attr("d", path)
        .attr("fill", function(d) { 
          return categoryToColor(d.data.category); 
        });

});
