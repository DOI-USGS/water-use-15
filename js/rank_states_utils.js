function rankEm(barData) {

  var rankSvg = {
      mobileWidth: 500,
      mobileHeight: 600,
      desktopWidth: 1000,
      desktopHeight: 300,
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
      isDragged: false,
      gameComplete: false
  };
  
  rankSvg.updateStyles = function(){
  var allBars = svgStates.select('#ranked-states-bars').selectAll('rect');
  var lockedStates = svgStates.select('#ranked-states-locked').selectAll('.locked-state');
  var draggableStates = svgStates.select('#ranked-states-draggable').selectAll('.draggable-state');
  var lockedBars = allBars.filter('.locked-rank-bar');
  var openBars = allBars.filter('*:not(.locked-rank-bar)');
  var lockedBarNames = svgStates.select('#ranked-states-bars').selectAll('text').filter('*:not(.open-bar-name)');
  
  function clearHighlight(){
    d3.selectAll('.highlight')
        .classed('highlight', false);
    d3.select("#rank-data-text")
      .attr("display", "none");
    rankSvg.updateStyles();  
      
  }
  
  var updateLabelText = function(data, isOpen) {
    
    var allText = d3.select("#rank-data-text")
      .attr("display", "block");
    
    if(isOpen) { 
      allText.select("#rank-state-text")
        .text("???");
    } else {
      allText.select("#rank-state-text")
        .text(data.STATE_NAME);
    }
    
    allText.select("#rank-value-text")
      .text(data.fancynums);
  };
  
  lockedBars
    .style('fill', categoryToColor('total'))
    .style('stroke-width', 0)
    .on('mouseover',function(){
      var state = d3.select(this).attr('id').split('-')[0];
      d3.select('#'+state+'-locked').classed('highlight', true);
      d3.select('#'+state+'-bar-name').classed('highlight', true);
      var bar = d3.select(this)
               .classed('highlight', true);
      rankSvg.updateStyles();
      updateLabelText(bar.datum());
    })
    .on('mouseout',clearHighlight);
  
  lockedBarNames
    .style('font-weight', 'normal')
    .on('mouseover',function(){
      var state = d3.select(this).attr('id').split('-')[0];
      d3.select('#'+state+'-locked').classed('highlight', true);
      var bar = d3.select('#'+state+'-bar').classed('highlight', true);
      d3.select(this).classed('highlight', true);
      rankSvg.updateStyles();
      updateLabelText(bar.datum());
    })
    .on('mouseout', clearHighlight);
    
  openBars
    .style('fill', "rgba(255, 255, 255, 0.0)")
    .style('stroke',"rgb(198,198,198)")
    .style('pointer-events', 'fill')
    .style('stroke-width', 1.5)
    .style("stroke-dasharray","4, 2")
    .on('mouseover',function(){
      var bar = d3.select(this)
             .classed('highlight', true);
      rankSvg.updateStyles();
      updateLabelText(bar.datum(), isOpen=true);
    })
    .on('mouseout',clearHighlight);
  
  var lockedStateStyles = {
    'strokeWidth': 4,
    'dasharray':"10, 10"
  };
  if (rankSvg.gameComplete){
    lockedStateStyles.strokeWidth = 2;
    lockedStateStyles.dasharray = null;
  }
  lockedStates
    .style('fill',"rgb(198,198,198)")
    .style('stroke', "rgb(222,222,222)")
    .style('stroke-width', lockedStateStyles.strokeWidth)
    .style("stroke-dasharray", lockedStateStyles.dasharray)
    .on('mouseover',function(){
      d3.selectAll('.highlight')
        .classed('highlight', false);
      var state = d3.select(this).attr('id').split('-')[0];
      var bar = d3.select('#'+state+'-bar')
                .classed('highlight', true);
      d3.select(this).classed('highlight', true);
      d3.select('#'+state+'-bar-name').classed('highlight', true);
      updateLabelText(bar.datum());
      rankSvg.updateStyles();
    })
    .on('mouseout',clearHighlight);
    
  draggableStates
    .style('fill',categoryToColor("total", 0.8))
    .style('stroke',"transparent")
    .style('stroke-width', 4);
  
  if (!rankSvg.isDragged){
    lockedBars.filter('.highlight')
      .style('fill',categoryToColor('total',1));
      
    lockedStates.filter('.highlight')
      .raise()
      .style("stroke-dasharray", null)
      .style('stroke-width',4)
      .style('fill',"rgba(220,220,220, 0.4)")
      .style('stroke',categoryToColor('total',1));
    
    lockedBarNames.filter('.highlight')
      .style('font-weight', "bold");
      
    d3.select('#rank-directions')
      .transition().duration(600).style('opacity',1);
  } else {
    lockedBars
      .on("mouseover", clearHighlight);
    openBars
      .on("mouseover", clearHighlight);
    
    d3.select("#rank-data-text")
      .attr("display", "none");
  }
  
  openBars.filter('.highlight')
  .style("stroke-dasharray", null)
  .style('stroke-width', 0)
  .style('fill',categoryToColor('total',1));  
};
  
  rankSvg.liftedState = function(d){
    d3.selectAll('.highlight')
        .classed('highlight', false);
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
          d3.select('#rank-explanation').selectAll('text')
            .transition()
            .delay(600)
            .duration(600)
            .style('opacity',1);
          rankSvg.gameComplete = true;
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
  var width = rankSvg.desktopWidth;
  var height = rankSvg.desktopHeight;
  if (waterUseViz.viewport === 'narrow'){
    width = rankSvg.mobileWidth;
    height = rankSvg.mobileHeight;
  }
  var svgStates = d3.select("#rank-states-interactive")
    .append("svg")
    .attr('viewBox', '0 0 '+ width + " " + height)
    .attr('preserveAspectRatio', 'xMidYMid');
  svgStates.append('style')
    .attr('type', "text/css")
    .text("@import url(https://fonts.googleapis.com/css?family=Shadows+Into+Light)");
  
  var stateMap = svgStates.append('g');
  stateMap
    .attr('id','ranked-states-map');
  if (waterUseViz.viewport === 'narrow'){
    stateMap.attr('transform',"translate(120,210)scale(0.4)");
  } else {
    stateMap.attr('transform',"translate(-10,-30)scale(0.4)");
  }
    
  
  stateMap.append('g')
    .attr('id','ranked-states-locked');
  
  stateMap.append('g')
    .attr('id','ranked-states-draggable');
    
  svgStates.append('g')
    .attr('id','ranked-states-bars');
  
  var helpY = 30;
  var helpX = width * 0.6;
  if (waterUseViz.viewport === 'narrow'){
    helpY = height - 50;
    helpX = width * 0.55;
  } 
  
  svgStates.append('g')
    .attr('id','rank-directions')
    .attr('transform',"translate("+helpX+","+helpY+")")
    .append('text')
      .classed('rankem-title', true)
      .attr('text-anchor','middle')
      .text('Drag a blue state over its matching bar');
  
  // add message about Idaho to conclude.  
  var rankMsg = svgStates.append('g')
    .attr('id', 'rank-explanation')
    .attr('transform',"translate("+helpX+","+helpY+")");
  rankMsg
    .append('text')
      .classed('rankem-explanation', true)
      .style('opacity', 0)
      .text('Were you surprised by Idaho? Though it has a small');
  rankMsg
    .append('text')
      .classed('rankem-explanation', true)
      .style('opacity', 0)
      .attr('dy', '1.2em')
      .text('population, Idaho has a large agricultural industry.');
  
  var labelTextGroup = svgStates.append('g')
    .attr('id','rank-data-text')
    .attr('text-anchor','middle')
    .attr('display', 'none')
    .attr('transform', ('translate('+width * 0.6+','+height * 0.3+")"));

  
  labelTextGroup.append("text")
      .attr("id", "rank-state-text");
  
  labelTextGroup.append("text")
      .attr("id", "rank-value-text")
      .attr('dy', '1.2em');
  
  labelTextGroup.append("text")
      .attr("id", "rank-units-text")
      .attr('dy', '3.4em')
      .attr("font-size", "12px")
      .text("million gallons per day");

	var dragData = barData.filter(function(d) {
	  return d.open;
	});
	
	var scaleX = d3.scaleBand()
	  .range([0, width])
	  .paddingInner(0.1)
	  .domain(barData.map(function(d,i){
	    return i;
	   }));
	
	var scaleY = d3.scaleLinear()
	  .range([rankSvg.bottomMargin, height])
	  .domain([0, d3.max(barData, function(d){
	    return d.wu;
	  })]);
	
	if (waterUseViz.viewport === 'narrow'){
	  scaleX = d3.scaleLinear()
	    .range([0, width-30])
	    .domain([0, d3.max(barData, function(d){
	      return d.wu;
	    })]);
	   
	   scaleY = d3.scaleBand()
	    .range([height, 0])
	    .paddingInner(0.1)
	    .domain(barData.map(function(d,i){
	      return i;
	    }));
	 }
	
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
    .append('g');
  
  if (waterUseViz.viewport === 'narrow'){
     barGroups.attr('transform', function(d, i){
      return 'translate(25,' + scaleY(i) + ")";
    });
  } else {
    barGroups.attr('transform', function(d, i){
      return 'translate(' + scaleX(i) + "," + (height - scaleY(d.wu)) + ")";
    });
  }
    
  var textBars = barGroups.append('text');
  textBars
    .attr('id', function(d) {
      return d.abrv+'-bar-name';
    })
    .classed('bar-name',true)
    .classed('open-bar-name', function(d){
      return d.open;
    })
    .text(function(d){
      return d.abrv;
    });
    
    if (waterUseViz.viewport === 'narrow'){
      textBars
        .attr('y', scaleY.bandwidth()/2)
        .attr('text-anchor','end')
        .attr('dy',"0.33em")
        .attr('dx',"-0.5em");
    } else {
      textBars
        .attr('y', function(d){
          return scaleY(d.wu) - rankSvg.bottomMargin;
        })
        .attr('dy',"1em")
        .attr('x', scaleX.bandwidth()/2)
        .attr('text-anchor','middle');
    }
  
  var rectBars = barGroups.append('rect');
  rectBars
    .attr('id', function(d){
      return d.abrv+'-bar';
    })
    .classed('locked-rank-bar', function(d){
      return !d.open;
    });
  
  if (waterUseViz.viewport === 'narrow'){
    rectBars
      .attr('height', scaleY.bandwidth())
      .attr('x', 0)
      .attr('width',  function(d){
        return scaleX(d.wu);
      });
  } else {
    rectBars
      .attr('width', scaleX.bandwidth())
      .attr('height', function(d){
        return scaleY(d.wu) - rankSvg.bottomMargin;
      })
      .attr('width', scaleX.bandwidth());
  }
    
    
    
    rankSvg.updateStyles();
}

