// be ready for adding timeslider

function add_timeslider(map, years, chart_width, chart_height) {
  
  // ref: http://thematicmapping.org/playground/d3/d3.slider/

  var min_time = d3.min(years),
      max_time = d3.max(years);
  var timescale = d3.scaleLinear()
        .domain([min_time, max_time])
        .range([(0 + chart_width/4), (chart_width - chart_width/4)]);
  
  var timeaxis = d3.axisBottom()
        .ticks(years)
        .scale(timescale);
  
  var slider = map.append("g")
    .attr("id", "slider")
    .attr("transform", "translate(0," + chart_height/2 + ")");
    
  slider.append("line")
    .attr("class", "track")
    .attr("x1", timescale(min_time))
    .attr("x2", timescale(max_time));
  
  slider.append("circle")
    .classed("track-circle", true)
    .attr("cx", timescale(max_time))
    .attr("r", 9)
    .call(d3.drag()
            .on("drag", function() { 
              var dragging_circle = d3.select(this);
              dragged(dragging_circle, timescale(min_time), timescale(max_time));
              dragging_circle.classed("dragging", true); 
            })
            .on("end", function() { return d3.select(this).classed("dragging", false); })
          );
  
}

function dragged(obj, min_x, max_x) {
  var new_loc = d3.event.x;
  if(new_loc >= min_x && new_loc <= max_x){
    obj.attr("cx", new_loc);
  }
}
      