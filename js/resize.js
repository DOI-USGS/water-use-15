function resize() {
  
  // Decide whether we're in mobile or desktop mode. Currently doing this by window width, but we could look to
  // https://www.w3schools.com/howto/howto_js_media_queries.asp for more device-specific solutions
  if(window.innerWidth > 425) { // sufficiently wide desktop windows
    waterUseViz.viewport = 'wide';
    waterUseViz.interactionMode = 'click';
  } else { // most mobile devices (except iPads) plus narrow desktop windows
    waterUseViz.viewport = 'narrow';
    waterUseViz.interactionMode = 'tap';
  }
  
  // Calculate new dimensions with adaptations for ~desktop vs ~mobile
  if(waterUseViz.viewport === 'wide') {
  
    // buttonBox is at the left and centered vertically
    waterUseViz.dims.buttonBox.width = waterUseViz.dims.buttonBox.widthDesktop;
    waterUseViz.dims.buttonBox.height = waterUseViz.dims.buttonBox.heightDesktop;
    waterUseViz.dims.buttonBox.x0 = 0;
    waterUseViz.dims.buttonBox.y0 = (waterUseViz.dims.map.height/2) - (waterUseViz.dims.buttonBox.height/2);
    // map fills the full svg
    waterUseViz.dims.map.x0 = waterUseViz.dims.buttonBox.width;
    // svg is [buttons][map]
    waterUseViz.dims.svg.width = waterUseViz.dims.buttonBox.width + waterUseViz.dims.map.width;
    waterUseViz.dims.svg.height = waterUseViz.dims.map.height;
    // watermark is at bottom left
    waterUseViz.dims.watermark.x0 = waterUseViz.dims.svg.width * 0.01;
    waterUseViz.dims.watermark.y0 = waterUseViz.dims.svg.height * 0.95;
    
  } else if(waterUseViz.viewport === 'narrow') {
  
    // buttonBox sits below map with small vertical buffer between map and buttons
    waterUseViz.dims.buttonBox.width = waterUseViz.dims.map.width * 0.6;
    waterUseViz.dims.buttonBox.height = waterUseViz.dims.buttonBox.width * 0.5 *
      (waterUseViz.dims.buttonBox.heightDesktop / waterUseViz.dims.buttonBox.widthDesktop);
    waterUseViz.dims.buttonBox.x0 = (waterUseViz.dims.svg.width - waterUseViz.dims.buttonBox.width) / 2; // center within svg
    waterUseViz.dims.buttonBox.y0 = waterUseViz.dims.map.height * 1.02;
    // map fills the top part of the svg
    waterUseViz.dims.map.x0 = 0;
    // svg is [map]
    //        [buttons]
    waterUseViz.dims.svg.width = waterUseViz.dims.map.width;
    waterUseViz.dims.svg.height = waterUseViz.dims.buttonBox.y0 + waterUseViz.dims.buttonBox.height;
    // watermark is at top right
    waterUseViz.dims.watermark.x0 = waterUseViz.dims.svg.width * 0.85;
    waterUseViz.dims.watermark.y0 = waterUseViz.dims.svg.height * 0.05;
  }
  
  // Apply the changes to the svg, map, map background, and watermark
  svg
    .attr('viewBox', '0 0 ' + waterUseViz.dims.svg.width + ' ' + waterUseViz.dims.svg.height + '');
  map
    .attr('transform', 'translate(' + waterUseViz.dims.map.x0 + ', ' + 0 + ')');
  mapBackground
    .attr("width", waterUseViz.dims.svg.width)
    .attr("height", waterUseViz.dims.map.height);
  watermark
    .attr('transform', 'translate(' + waterUseViz.dims.watermark.x0 + ',' + waterUseViz.dims.watermark.y0 + ')scale(0.25)');
  
  // Apply the changes to the button elements
  resizeButtons();
  
}
