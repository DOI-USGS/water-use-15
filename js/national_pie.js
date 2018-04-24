// code to add a static pie chart of the national view
function loadPie() {
  var width = 480,
      height = 350,
      radius = Math.min(width, height) / 3;
  
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
      .outerRadius(radius)
      .innerRadius(0);
  
  // for circles and inner most part of callout lines
  var lineStartArc = d3.arc()
      .outerRadius(radius*0.8)
      .innerRadius(radius*0.8);
  
  // for end of the callout lines
  var lineEndArc = d3.arc()
      .outerRadius(radius*1.15)
      .innerRadius(radius*1.15);
  
  // for pie slice text placement
  var textArc = d3.arc()
      .outerRadius(radius*1.25)
      .innerRadius(radius*1.25);
  
  var wu_national_no_total = waterUseViz.nationalData  
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
        
  var sliceLabels = pie_g.selectAll('.slice-label')
        .data(pie(wu_national_no_total))
        .enter()
        .append('g')
          .classed('slice-label', true);
  
  sliceLabels
    .append("circle")
      .classed('label-circle', true)
      .attr('cx', function(d) { return lineStartArc.centroid(d)[0]; })
      .attr('cy', function(d) { return lineStartArc.centroid(d)[1]; })
      .attr('r', 2);
    
  sliceLabels
    .append("line")
      .classed('label-line', true)
      .attr('x1', function(d, i) { return lineStartArc.centroid(d)[0]; })
      .attr('y1', function(d, i) { return lineStartArc.centroid(d)[1]; })
      .attr('x2', function(d, i) { return lineEndArc.centroid(d)[0]; })
      .attr('y2', function(d, i) { return lineEndArc.centroid(d)[1]; });
    
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
      .text(function(d) { return categoryToName(d.data.category); }); //+': '+d.data.wateruse; });
  
};