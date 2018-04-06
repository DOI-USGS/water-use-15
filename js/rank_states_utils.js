
var svgStates = d3.select("#rank-states-interactive")
  .append("svg")
  .attr('viewBox', '0 0 1000 300')
  .attr('preserveAspectRatio', 'xMidYMid');
svgStates.append("g")
  .append('rect')
    .attr('fill','red')
    .attr('height',"300")
    .attr('width',"1000");