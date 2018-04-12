
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
  .attr('id','ranked-states-dragable');
  
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
    .style('stroke-dasharray',"10, 10")
    .classed('moved-state', true)
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
      .on("drag", dragging)
      .on("end", dragdone));
    
  var bardata = [{"wu":80, "abrv":'OK', "open": true}, {"wu":180, "abrv":'MI', "open":true}, {"wu":210, "abrv":'ID', "open":true}];
  
  svgStates.select('#ranked-states-bars')
    .selectAll('rect')
    .data(bardata)
    .enter()
    .append('rect')
    .attr('x', function(d, i){
      return 500+i*30;
    })
    .attr('y', function(d){
      return 280-d.wu;
    })
    .attr('height', function(d){
      return d.wu;
    })
    .attr('width','20')
    .style("stroke-dasharray","4, 2")
    .classed('open-rank-bar', true)
    .on('mouseover', function(d){
      d3.select(this)
        .style("stroke-dasharray",null)
        .classed('chosen-rank-bar',true)
        .style("fill", categoryToColor("total"));
      })
    .on('mouseout', function(d){
      d3.select(this)
        .style("stroke-dasharray","4, 2")
        .classed('chosen-rank-bar',false);
      });
  
    function dragging(d) {
      d3.select(this).attr("transform", "translate(" + (d.x = d3.event.x) + "," + (d.y = d3.event.y) + ")");
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
        d3.select(this)
          .transition().duration(600)
            .attr('opacity', 0); 
      }
      d.x = 0;
      d.y = 0;
    }
    
