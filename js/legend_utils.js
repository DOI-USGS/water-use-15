
function addLegend(minWateruse, maxWateruse) {
  
  
  var legendHeight = 100,
      legendWidth = 200;
  var bufferFromEdge = 50;
  
  // put legend in the Gulf
  var xPosGulf = chart_width*0.53,
      yPosGulf = 0.83*chart_height;
      
  // center min, center max within legend rect
  var xPosMin = bufferFromEdge,
      xPosMax = legendWidth-bufferFromEdge;
  var xPosMinMax = [xPosMin, xPosMax];
  
  // add group for legend elements & move into the Gulf of Mexico
  var legend = svg
    .append('g')
      .attr('transform', 
            'translate('+xPosGulf+','+yPosGulf+')');
  
  // add box around legend items
  legend
    .append('rect')
      .classed('legend', true)
      .attr('width', legendWidth)
      .attr('height', legendHeight);

  // add appropriately sized circles side by side
  legend
    .selectAll('circle')
    .data([minWateruse + 10, maxWateruse])
    .enter()
    .append('circle')
      .attr('r', function(d) { return scaleCircles(d); })
      .attr('transform', function(d, i) {
        var xpos = xPosMinMax[i],
            ypos = (legendHeight/2);
        return 'translate('+xpos+','+ypos+')'; 
      })
      .style("fill", categoryToColor('total'));

  // add label to circles
  legend
    .selectAll('text')
    .data([minWateruse + 10, maxWateruse])
    .enter()
    .append('text')
      .classed('legendText', true)
      .attr('x', function(d, i) {
        return xPosMinMax[i];
      })
      .attr('y', legendHeight*0.85)
      .text(function(d) { return d+' Mgal/day'; });
}
