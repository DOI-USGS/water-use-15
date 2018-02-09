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
        .tickFormat(d3.format("")) // treat as character so that 2015 is not 2,015
        .tickPadding(10);
  
  var slider = svg.append("g")
    .attr("id", "slider")
    .attr("transform", "translate(0," + (chart_height - (chart_height * 0.05)) + ")");
    
  slider.append("line")
    .attr("class", "track")
    .attr("x1", xscale(min_year))
    .attr("x2", xscale(max_year));
  
  slider.append("g")
    .attr("id", "slideraxis")
    .call(xaxis);
  
  slider.append("circle")
    .classed("track-circle", true)
    .attr("cx", xscale(max_year))
    .attr("r", 9)
    .call(d3.drag()
            .on("drag", function() { 
              var dragging_circle = d3.select(this);
              dragged(dragging_circle, xscale, min_year, max_year);
              dragging_circle.classed("dragging", true); 
            })
            .on("end", function() { 
              var dragged_circle = d3.select(this);
              var new_year = xscale.invert(dragged_circle.attr("cx"));
              
              // this is where functions to update data would go
              // just pass in `new_year` which is the year the 
              // timeslider has been changed to
              updateTitle(new_year);
              
              return dragged_circle.classed("dragging", false); })
          );
  
}

function dragged(obj, xscale, min_yr, max_yr) {
  
  // rounding in order to only allow the slider on every 5th yr
  // aka snap to every 5th year
  
  var new_loc = d3.event.x,
      new_yr = xscale.invert(new_loc),
      round_yr = nearestFive(new_yr),
      round_loc = xscale(round_yr);
  
  if(round_loc >= xscale(min_yr) && round_loc <= xscale(max_yr)){
    obj.attr("cx", round_loc);
  }
}

function nearestFive(number) {
  return Math.round(number / 5) * 5;
}
      