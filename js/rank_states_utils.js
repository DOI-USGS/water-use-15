
var svgStates = d3.select("#rank-states-interactive")
  .append("svg")
  .attr('viewBox', '0 0 1000 300')
  .attr('preserveAspectRatio', 'xMidYMid');

var stateMap = svgStates.append('g')
  .attr('id','ranked-states-map')
  .attr('transform',"scale(0.4)");

stateMap.append('g')
  .attr('id','ranked-states-moved');

stateMap.append('g')
  .attr('id','ranked-states-draggable');
  
svgStates.append('g')
  .attr('id','ranked-states-bars');
  
// Read state data and add it to figure
d3.queue()
  .defer(d3.json, "data/wu_state_data.json")
  .await(rankEm);
  
function rankEm() {

  // arguments[0] is the error
	var error = arguments[0];
	if (error) throw error;
	
	var bardata = arguments[1];
	
	svgStates.select('#ranked-states-moved')
    .selectAll( 'use' )
    .data(bardata)
    .enter()
    .append('use')
    .style('stroke-dasharray',"10, 10")
    .classed('static-state', true)
    .attr('xlink:href', function(d) {
      return '#'+ d.abrv +'-lowres';
    });
    
    svgStates.select('#ranked-states-draggable')
    .selectAll( 'use' )
    .data(bardata)
    .enter()
    .append('use')
    .filter(function(d){
      return d.open;
    })
      .classed('draggable','true') 
      .style("fill",categoryToColor("total"))
      .style("stroke-dasharray",null)
      .attr('id', function(d) {
        return d.abrv + '-rank';
      })
      .attr('xlink:href', function(d) {
        return '#'+ d.abrv +'-lowres';
      })
      .datum({x: 0, y: 0})
      .call(d3.drag()
        .on("drag", dragging)
        .on("end", dragdone));
    
  // add states
  
  var barGroups = svgStates.select('#ranked-states-bars')
    .selectAll('g')
    .data(bardata)
    .enter()
    .append('g')
    .attr('transform', function(d, i){
      return 'translate(' + (500 + i *30) + "," + (280-d.wu) + ")";
    });
    
    barGroups.append('text')
    .attr('y', function(d){
      return d.wu;
    })
    .classed('bar-name',true)
    .classed('open-bar-name', function(d){
      return d.open;
    })
    .attr('dy',"1em")
    .text(function(d){
      return d.abrv;
    });
  
  barGroups.append('rect')
    .attr('height', function(d){
      return d.wu;
    })
    .attr('width','20')
    .style("stroke-dasharray","4, 2")
    .classed('open-rank-bar', function(d){
      return d.open;
    })
    .classed('closed-rank-bar', function(d){
      return !d.open;
    })
    .style('fill', function(d){
      if (!d.open){
        return categoryToColor("total");
      }
    })
    .on('mouseover', function(d){
      if (d.open){
        d3.select(this)
          .style("stroke-dasharray",null)
          .classed('chosen-rank-bar',true)
          .style("fill", categoryToColor("total"));
      }
      })
    .on('mouseout', function(d){
      if (d.open){
        d3.select(this)
          .style("stroke-dasharray","4, 2")
          .classed('chosen-rank-bar',false);
        } 
      });
  
    function dragging(d) {
      d3.select(this).attr("transform", "translate(" + (d3.event.x) + "," + (d3.event.y) + ")");
  }

  function dragdone(d) {
    var barchoice = d3.select('.chosen-rank-bar');
    if (barchoice.empty()){
      d3.select(this)
        .transition().duration(600)
          .attr('transform','translate(0,0)'); 
    } else {
      barchoice
        .on('mouseover', null)
        .on('mouseout', null)
        .attr('class','closed-rank-bar');
      d3.select(barchoice.node().parentNode).select('text')
        .classed('open-bar-name',false);
      d3.select(this)
        .transition().duration(600)
          .attr('opacity', 0); 
    }
  }
	
}
  


  

    
