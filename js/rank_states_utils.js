
var rankSvg = {
    width: 1000,
    height: 300,
    bottomMargin: 15,
    updateStyles: function() {
    },
    draggingState: function() {
    },
    droppedState: function() {
    },
    isOnRankBar: function(){
    }
};

var svgStates = d3.select("#rank-states-interactive")
  .append("svg")
  .attr('viewBox', '0 0 '+ rankSvg.width + " " + rankSvg.height)
  .attr('preserveAspectRatio', 'xMidYMid');

var stateMap = svgStates.append('g')
  .attr('id','ranked-states-map')
  .attr('transform',"translate(-10,-30)scale(0.4)");

stateMap.append('g')
  .attr('id','ranked-states-locked');

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
	
	var barData = arguments[1];
	var dragData = barData.filter(function(d) {
	  return d.open;
	});
	
	var scaleX = d3.scaleBand()
	  .range([0, rankSvg.width])
	  .paddingInner(0.1)
	  .domain(barData.map(function(d,i){
	    return i;
	   }));
	
	var scaleY = d3.scaleLinear()
	  .range([rankSvg.bottomMargin, rankSvg.height])
	  .domain([0, d3.max(barData, function(d){
	    return d.wu;
	  })]);
	
	svgStates.select('#ranked-states-locked')
    .selectAll( 'use' )
    .data(barData)
    .enter()
    .append('use')
    .classed('locked-state', true)
    .attr('xlink:href', function(d) {
      return '#'+ d.abrv +'-lowres';
    })
    .attr('id', function(d) {
      return d.abrv +'-locked';
    });
    
    svgStates.select('#ranked-states-draggable')
    .selectAll( 'use' )
    .data(dragData)
    .enter()
    .append('use')
    .classed('draggable-state','true') 
    .attr('id', function(d) {
      return d.abrv + '-draggable';
    })
    .attr('xlink:href', function(d) {
      return '#'+ d.abrv +'-lowres';
    })
    .datum({x: 0, y: 0})
    .call(d3.drag()
      .on("drag", rankSvg.draggingState)
      .on("end", rankSvg.droppedState));
    
  // add states
  
  var barGroups = svgStates.select('#ranked-states-bars')
    .selectAll('g')
    .data(barData)
    .enter()
    .append('g')
    .attr('transform', function(d, i){
      return 'translate(' + scaleX(i) + "," + (rankSvg.height - scaleY(d.wu)) + ")";
    });
    
    barGroups.append('text')
    .attr('y', function(d){
      return scaleY(d.wu) - rankSvg.bottomMargin;
    })
    .attr('x', scaleX.bandwidth()/2)
    .attr('text-anchor','middle')
    .attr('alignment-baseline','hanging')
    .classed('bar-name',true)
    .classed('open-bar-name', function(d){
      return d.open;
    })
    .attr('dy',"0.33em")
    .text(function(d){
      return d.abrv;
    });
  
  barGroups.append('rect')
    .attr('height', function(d){
      return scaleY(d.wu) - rankSvg.bottomMargin;
    })
    .attr('id', function(d){
      return d.abrv+'-bar';
    })
    .attr('width', scaleX.bandwidth())
    .classed('locked-rank-bar', function(d){
      return !d.open;
    });
    
    rankSvg.updateStyles();
}

rankSvg.updateStyles = function(){
  var allBars = svgStates.select('#ranked-states-bars').selectAll('rect');
  var lockedStates = svgStates.select('#ranked-states-locked').selectAll('.locked-state');
  var draggableStates = svgStates.select('#ranked-states-draggable').selectAll('.draggable-state');
  
  allBars.filter('.locked-rank-bar')
    .style('fill', categoryToColor('total'))
    .style('stroke-width',0);
    
  allBars.filter('*:not(.locked-rank-bar)')
    .style('fill', "none")
    .style('stroke',"rgb(190,190,190)")
    .style("stroke-dasharray","4, 2");
    
  lockedStates
    .style('fill',"rgb(220,220,220)")
    .style('stroke',"rgb(190,190,190)")
    .style('stroke-width',4)
    .style("stroke-dasharray","10, 10");
    
  draggableStates
    .style('fill',categoryToColor("total"));
};
  
rankSvg.draggingState = function (d) {
  var thisShape = d3.select(this);
  thisShape.attr("transform", "translate(" + (d3.event.x) + "," + (d3.event.y) + ")");
  rankSvg.isOnRankBar(thisShape.node().getBoundingClientRect());
};

rankSvg.droppedState = function(d){
  var barchoice = d3.select('.chosen-rank-bar');
      
  if (barchoice.empty()){
    d3.select(this)
      .transition().duration(600)
        .attr('transform','translate(0,0)'); 
  } else {
    var stateName = barchoice.attr('id').split('-')[0];
    if (stateName === d3.select(this).attr('id').split('-')[0]){
      // the guess is right
      barchoice.attr('class','locked-rank-bar');
      d3.select(barchoice.node().parentNode).select('text')
        .classed('open-bar-name',false);
      d3.select(this)
        .attr('class',null)
        .transition().duration(600)
          .style('opacity', 0);

    } else {
      d3.select(this)
        .transition().duration(600)
          .attr('transform','translate(0,0)'); 
      barchoice.attr('class',null);
      barchoice.transition().duration(600).ease(d3.easeLinear)
        .style('stroke-dashoffset',"6")
        .style('stroke', 'rgb(200, 65, 39)') // emphasize with a redorange stroke
        .transition().duration(600)
          .style('stroke','rgb(190,190,190)')
          .style('stroke-dashoffset',"12"); // needs to be a multiple of stroke-dasharray to look smooth
      barchoice.style('stroke-dashoffset',null); // resets to "0", which doesn't change the look
    }
  }
  rankSvg.updateStyles();
};
rankSvg.isOnRankBar = function(shapeBox) {
  var openBars = svgStates.select('#ranked-states-bars')
    .selectAll('rect')
    .filter('*:not(.locked-rank-bar)').nodes();
      
  for (var i = 0; i < openBars.length; i++) { 
    var thisBar = openBars[i];
    var barBox = thisBar.getBoundingClientRect();
    
    var isOverBar = !(barBox.right < shapeBox.left || 
              barBox.left > shapeBox.right || 
              barBox.bottom < shapeBox.top || 
              barBox.top > shapeBox.bottom);
    if (isOverBar){
      d3.select(thisBar).classed('chosen-rank-bar',true);
    } else {
      d3.select(thisBar).classed('chosen-rank-bar',null);
    }
  }
};
