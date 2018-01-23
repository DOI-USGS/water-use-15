// be ready for adding timeslider

function add_timeslider(map, years, chart_width, chart_height) {
  
  // ref: http://thematicmapping.org/playground/d3/d3.slider/
  
  var min_year = d3.min(years),
      max_year = d3.max(years);
  var xscale = d3.scaleLinear()
        .domain([min_year, max_year])
        .range([(0 + chart_width/4), (chart_width - chart_width/4)]);
  
  var xaxis = d3.axisBottom()
        .ticks(years.length)
        .scale(xscale)
  
  var slider = map.append("g")
    .attr("id", "slider")
    .attr("transform", "translate(0," + chart_height/2 + ")");
    
  slider.append("line")
    .attr("class", "track")
    .attr("x1", xscale(min_year))
    .attr("x2", xscale(max_year));
  
  slider.append("circle")
    .classed("track-circle", true)
    .attr("cx", xscale(max_year))
    .attr("r", 9)
    .call(d3.drag()
            .on("drag", function() { 
              var dragging_circle = d3.select(this);
              dragged(dragging_circle, xscale(min_year), xscale(max_year));
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
      