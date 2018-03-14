
function addLegend(minWateruse, maxWateruse) {
  
  // increase minimum so that you can actually see it
  function precisionRound(number, precision) {
    var factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
  }
  
  var roundMaxWateruse = precisionRound(maxWateruse, -1),
      roundMinWaterUse = precisionRound(minWateruse, -1),
      newMinWateruse = roundMinWaterUse + 50;
  
  var legendHeight = 100,
      legendWidth = 200;
  var bufferFromEdge = 25;
  
  // put legend in the Atlantic
  var xPosLegend = chart_width*0.95,
      yPosLegend = 0.50*chart_height;
      
  // center min, center max within legend rect
  var yPosMin = bufferFromEdge,
      yPosMax = legendHeight-(bufferFromEdge-20); // more space between min words & max circle
  var yPosMinMax = [yPosMin, yPosMax];
  
  // add group for legend elements & move into the Atlantic Ocean
  var legend = svg
    .append('g')
      .attr('transform', 
            'translate('+xPosLegend+','+yPosLegend+')');
  
  // add box around legend items
  legend
    .append('rect')
      .classed('legend', true)
      .attr('width', legendWidth)
      .attr('height', legendHeight);

  // add appropriately sized circles side by side
  legend
    .selectAll('circle')
    .data([newMinWateruse, roundMaxWateruse])
    .enter()
    .append('circle')
      .classed('legend-point', true)
      .attr('r', function(d) { return scaleCircles(d); })
      .attr('transform', function(d, i) {
        var xpos = 0,
            ypos = yPosMinMax[i];
        return 'translate('+xpos+','+ypos+')'; 
      })
      .style("fill", categoryToColor(activeCategory));

  // add label to circles
  legend
    .selectAll('text')
    .data([newMinWateruse, roundMaxWateruse])
    .enter()
    .append('text')
      .classed('legendText', true)
      .attr('x', 0)
      .attr('y', function(d,i) {
        return yPosMinMax[i]+(bufferFromEdge+(i*10)); // increase text placement for bigger circle
      })
      .text(function(d) { return d+' Mgal/day'; });
  
}
