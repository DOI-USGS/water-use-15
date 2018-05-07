// code to add a static pie chart of the national view
function loadPie() {
  var width = 525,
      height = 350,
      radius = Math.min(width, height) / 3;
  
  var wu_national_no_total = waterUseViz.nationalData  
        .filter(function(d) { return d.category !== "total"; });
  var wu_national_total = waterUseViz.nationalData  
        .filter(function(d) { return d.category === "total"; });
  var wu_total = wu_national_total[0].wateruse;
  
  wu_national_no_total.forEach(function(d) {
    d.wuperc = Math.round((d.wateruse / wu_total * 100));
  });
  
  // calculate rotation to get irrigation balanced on top
  // calculate where thermo needs to start (how far from zero)
  // then convert from percent to radians
  var thermo_percent = wu_national_no_total[[0]].wuperc,
      irrigation_percent = wu_national_no_total[[2]].wuperc;
  var rotate_value = (100 - (irrigation_percent/2 + thermo_percent )) * Math.PI / 50;
  
  var piearea = d3.select(".side-by-side-figure")
        .append("svg")
          .attr('viewBox', '0 0 '+width+' '+height);
    
  var pie_g = piearea
        .append("g")
          .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
  
  var pie = d3.pie()
      .value(function(d) { return d.wateruse; });
      
  // for pie slices
  var path = d3.arc()
      .startAngle(function(d) { return d.startAngle + rotate_value; })
      .endAngle(function(d) { return d.endAngle + rotate_value; })
      .outerRadius(radius)
      .innerRadius(0);
  
  // for pie slice text placement
  var textArc = d3.arc()
      .startAngle(function(d) { return d.startAngle + rotate_value; })
      .endAngle(function(d) { return d.endAngle + rotate_value; })
      .outerRadius(radius*1.25)
      .innerRadius(radius*1.25);
  
  var slices = pie_g.selectAll(".slice")
    .data(pie(wu_national_no_total))
    .enter()
    .append("g")
      .attr("class", "slice");
      
  slices
    .append("path")
      .attr("d", path)
      .attr("fill", function(d) { 
        return categoryToColor(d.data.category, 0.8); 
      });
        
  var sliceLabels = pie_g.selectAll('.slice-label')
        .data(pie(wu_national_no_total))
        .enter()
        .append('g')
          .classed('slice-label', true);
    
  sliceLabels
    .append("text")
      .classed('label-text', true)
      .attr("transform", function(d) { return "translate(" + textArc.centroid(d) + ")"; })
      .attr("dy", "0.35em")
      .attr("text-anchor", function(d) {
        if( (textArc.centroid(d)[0] * 0.75) < path.centroid(d)[0] ) {
          // label is more than 3/4 left of the pie center than the slice x centroid
          // so essentially, only grabs labels way out on the left
          return "end";
        } else if ( (textArc.centroid(d)[0] * 0.75) > path.centroid(d)[0] ) {
          // label is more than 3/4 right of the pie center than the slice x centroid
          return "start";
        } else {
          // label is above or below pie center
          return "middle";
        }
      })
      .text(function(d) { 
        return categoryToName(d.data.category)+' ('+d.data.wuperc+'%)'; 
      }); 
  
}
