
var svgStates = d3.select("#rank-states-interactive")
  .append("svg")
  .attr('viewBox', '0 0 1000 300')
  .attr('preserveAspectRatio', 'xMidYMid');
var boxes = svgStates.append("g");
boxes.append('rect')
    .attr('fill','red')
    .attr('height',"300")
    .attr('width',"1000");
boxes.append('circle')
    .attr('fill', 'yellow')
    .attr('r','2')
    .attr('transform','translate(200,100)scale(20)');