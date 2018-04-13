
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
  
  
var staticStates = ["AL","AK","AZ","AR","CA","CO","CT","DE","DC","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","PR","VI"];

var dragStates = ["ID","OK","MI"];

// add states
  svgStates.select('#ranked-states-moved')
    .selectAll( 'use' )
    .data(staticStates)
    .enter()
    .append('use')
    .style('stroke-dasharray',"10, 10")
    .classed('static-state', true)
    .attr('xlink:href', function(d) {
      return '#'+ d +'-lowres';
    });
  
  svgStates.select('#ranked-states-draggable')
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
      return '#'+ d +'-lowres';
    })
    .datum({x: 0, y: 0})
    .call(d3.drag()
      .on("drag", dragging)
      .on("end", dragdone));
    
  var bardata = [{"wu":80, "abrv":'OK', "open": true}, {"wu":140, "abrv":'WI', "open":false}, {"wu":180, "abrv":'MI', "open":true}, 
    {"wu":210, "abrv":'ID', "open":true}, {"wu":260, "abrv":'TX', "open":false}, {"wu":310, "abrv":'CA', "open":false}];
  
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
    
