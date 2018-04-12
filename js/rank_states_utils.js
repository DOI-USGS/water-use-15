
var svgStates = d3.select("#rank-states-interactive")
  .append("svg")
  .attr('viewBox', '0 0 1000 300')
  .attr('preserveAspectRatio', 'xMidYMid');

svgStates.append('g')
  .attr('id','ranked-states-moved')
  .attr('transform',"scale(0.4)");

svgStates.append('g')
  .attr('id','ranked-states-dragable')
  .attr('transform',"scale(0.4)");
  
svgStates.append('g')
  .attr('id','ranked-states-bars');
  
  
var movedStates = ["AL","AK","AZ","AR","CA","CO","CT","DE","DC","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","PR","VI"];

var dragStates = ["ID","OK","MI"];

// add states
  svgStates.select('#ranked-states-moved')
    .selectAll( 'use' )
    .data(movedStates)
    .enter()
    .append('use')
    .style("fill","rgb(240,240,240)")
    .style("stroke","rgb(190,190,190)")
    .style("stroke-dasharray","10, 10")
    .style("stroke-width","4")
    .attr('xlink:href', function(d) {
      return '#'+ d +'-pattern';
    });
  
  svgStates.select('#ranked-states-dragable')
    .selectAll( 'use' )
    .data(dragStates)
    .enter()
    .append('use')
    .classed('draggable','true') 
    .style("fill",categoryToColor("total"))
    .style("stroke-dasharray",null)
    .attr('id', function(d) {
      return d + '-rank';
    })
    .attr('xlink:href', function(d) {
      return '#'+ d +'-pattern';
    })
    .datum({x: 0, y: 0})
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended));
    
  var bardata = [80, 180, 210];
  
  svgStates.select('#ranked-states-bars')
    .selectAll( 'rect' )
    .data(bardata)
    .enter()
    .append('rect')
    .attr('x', function(d, i){
      return 500+i*30;
    })
    .attr('y', function(d){
      return 280-d;
    })
    .attr('height', function(d){
      return d;
    })
    .attr('width','20')
    .style("stroke","rgb(190,190,190)")
    .style("stroke-dasharray","10, 10")
    .style("fill", "white")
    .style("fill-opacity", "0")
    .attr('id','test-rect')
    .on('mouseover', function(d){
      d3.select(this)
        .style("stroke-dasharray",null)
        .style("fill-opacity", null)
        .classed('chosen-bar',true)
        .style("fill", categoryToColor("total"));
      })
    .on('mouseout', function(d){
      d3.select(this)
        .style("stroke-dasharray","10, 10")
        .classed('chosen-bar',false)
        .style("fill-opacity", "0")
        .style("fill", "white");
      });
  
    function dragstarted(d) {
      /*d3.select(this).raise().classed("active", true); SLOW? RESET d.x?
      */
    }

    function dragged(d) {
      d3.select(this).attr("transform", "translate(" + (d.x = d3.event.x) + "," + (d.y = d3.event.y) + ")");
    }

    function dragended(d) {
      var barchoice = d3.select('.chosen-bar');
      if (barchoice.empty()){
        d3.select(this).classed("active", false)
        .transition().duration(600)
          .attr('transform','translate(0,0)'); 
      } else {
        barchoice.style('fill','orange')
          .on('mouseover', null)
          .on('mouseout', null)
          .classed('chosen-bar',null);
        d3.select(this).classed("active", false)
        .transition().duration(600)
          .attr('opacity', 0); 
      }
      
      d.x = 0;
      d.y = 0;
    }
    
