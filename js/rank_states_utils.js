function rankEm(barData) {

  var rankSvg = {
      width: 1000,
      height: 300,
      bottomMargin: 15,
      updateStyles: function() {
      },
      liftedState: function() {
        
      },
      draggingState: function() {
      },
      droppedState: function() {
      },
      isOnRankBar: function(){
      },
      isDragged: false
  };
  
  rankSvg.updateStyles = function(){
  var allBars = svgStates.select('#ranked-states-bars').selectAll('rect');
  var lockedStates = svgStates.select('#ranked-states-locked').selectAll('.locked-state');
  var draggableStates = svgStates.select('#ranked-states-draggable').selectAll('.draggable-state');
  var lockedBars = allBars.filter('.locked-rank-bar');
  var openBars = allBars.filter('*:not(.locked-rank-bar)');
  
  function clearHighlight(){
    d3.selectAll('.highlight')
        .classed('highlight', false);
    d3.select("#rank-data-text")
      .attr("display", "none");
    rankSvg.updateStyles();  
      
  }
  
  var updateLabelText = function(data) {
    var allText = d3.select("#rank-data-text")
      .attr("display", "block");
    
    allText.select("#rank-state-text")
      .text(data.STATE_NAME);
    
    allText.select("#rank-value-text")
      .text(data.wu);
  };
  
  lockedBars
    .style('fill', categoryToColor('total'))
    .style('stroke-width', 0)
    .on('mouseover',function(){
      var state = d3.select(this).attr('id').split('-')[0];
      d3.select('#'+state+'-locked').classed('highlight', true);
      var bar = d3.select(this)
               .classed('highlight', true);
      rankSvg.updateStyles();
      updateLabelText(bar.datum());
    })
    .on('mouseout',clearHighlight);
  
    
  openBars
    .style('fill', "rgba(255, 255, 255, 0.0)")
    .style('stroke',"rgb(190,190,190)")
    .style('stroke-width', 1.5)
    .style("stroke-dasharray","4, 2")
    .on('mouseover',function(){
      var bar = d3.select(this)
               .classed('highlight', true);
      rankSvg.updateStyles();
    })
    .on('mouseout',clearHighlight);
    
  lockedStates
    .style('fill',"rgb(220,220,220)")
    .style('stroke',"rgb(190,190,190)")
    .style('stroke-width', 4)
    .style("stroke-dasharray","10, 10")
    .on('mouseover',function(){
      d3.selectAll('.highlight')
        .classed('highlight', false);
      var state = d3.select(this).attr('id').split('-')[0];
      var bar = d3.select('#'+state+'-bar')
                .classed('highlight', true);
      d3.select(this).classed('highlight', true);
      updateLabelText(bar.datum());
      rankSvg.updateStyles();
    })
    .on('mouseout',clearHighlight);
    
  draggableStates
    .style('fill',categoryToColor("total"))
    .style('stroke',"transparent")
    .style('stroke-width', 4);
  
  if (!rankSvg.isDragged){
    lockedBars.filter('.highlight')
      .style('fill',categoryToColor('total',true));
      
    lockedStates.filter('.highlight')
      .raise()
      .style("stroke-dasharray", null)
      .style('fill',"rgba(220,220,220, 0.4)")
      .style('stroke',categoryToColor('total',true));
    
    d3.select('#rank-directions')
      .transition().duration(600).style('opacity',1);
  }
  openBars.filter('.highlight')
  .style("stroke-dasharray", null)
  .style('stroke-width', 0)
  .style('fill',categoryToColor('total',true));  
};

  rankSvg.liftedState = function(d){
    d3.select('#rank-directions')
      .transition().duration(600).style('opacity',0);
  };
  
  rankSvg.draggingState = function (d) {
    var thisShape = d3.select(this);
    rankSvg.isDragged = true;
    thisShape.attr("transform", "translate(" + (d3.event.x) + "," + (d3.event.y) + ")");
    rankSvg.isOnRankBar(thisShape.node().getBoundingClientRect());
  };
  
  rankSvg.droppedState = function(d){
    rankSvg.isDragged = false;
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
        
        // is this the last one? if so, remove the directions    
        if (svgStates.select('#ranked-states-bars').selectAll('rect').filter('*:not(.locked-rank-bar)').empty()){
          d3.select('#rank-directions')
            .select('text').remove();
        }
  
      } else {
        d3.select(this)
          .transition().duration(600)
            .attr('transform','translate(0,0)'); 
        barchoice.attr('class',null);
        barchoice.transition().duration(600).ease(d3.easeLinear)
          .style('stroke-dashoffset',"6")
          .style('stroke-width',2.0)
          .style('stroke', 'rgb(200, 65, 39)') // emphasize with a redorange stroke
          .transition().duration(600)
            .style('stroke','rgb(190,190,190)')
            .style('stroke-width',1.5)
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
       d3.select(thisBar)
        .classed('chosen-rank-bar',isOverBar)
        .classed('highlight',isOverBar);
    }
    rankSvg.updateStyles();
  };
  
  var svgStates = d3.select("#rank-states-interactive")
    .append("svg")
    .attr('viewBox', '0 0 '+ rankSvg.width + " " + rankSvg.height)
    .attr('preserveAspectRatio', 'xMidYMid');
  svgStates.append('style')
    .attr('type', "text/css")
    .text("@import url(https://fonts.googleapis.com/css?family=Shadows+Into+Light)");
  
  var stateMap = svgStates.append('g')
    .attr('id','ranked-states-map')
    .attr('transform',"translate(-10,-30)scale(0.4)");
  
  stateMap.append('g')
    .attr('id','ranked-states-locked');
  
  stateMap.append('g')
    .attr('id','ranked-states-draggable');
    
  svgStates.append('g')
    .attr('id','ranked-states-bars');
    
  svgStates.append('g')
    .attr('id','rank-directions')
    .attr('transform',"translate("+(rankSvg.width * 0.6)+",30)")
    .append('text')
      .classed('rankem-title', true)
      .attr('text-anchor','middle')
      .text('Drag a state over its matching bar');
  
  var labelTextGroup = svgStates.append('g')
    .attr('id','rank-data-text')
    .attr('text-anchor','middle')
    .attr('display', 'none');
  
  labelTextGroup.append("text")
      .attr("id", "rank-state-text")
      .attr("x", rankSvg.width * 0.6)
      .attr("y", rankSvg.height * 0.3);
  
  labelTextGroup.append("text")
      .attr("id", "rank-value-text")
      .attr("x", rankSvg.width * 0.6)
      .attr("y", rankSvg.height * 0.3)
      .attr('dy', '1.2em');
  
  labelTextGroup.append("text")
      .attr("id", "rank-units-text")
      .attr("x", rankSvg.width * 0.6)
      .attr("y", rankSvg.height * 0.3)
      .attr('dy', '3.4em')
      .attr("font-size", "12px")
      .text("million gallons per day");

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
      .on("start", rankSvg.liftedState)
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

