function addButtons() {
  var buttonBox = waterUseViz.elements.buttonBox = svg.append('g')
    .attr('id', 'button-container');
  
  buttonBox.append('rect')
    .attr('id', 'button-background');
  
  // one group for each button
  var buttons = buttonBox.selectAll('g.button')
    .data(categories)
    .enter()
    .append('g')
    .classed('button', true)
    .attr('id', function(d) {
      return d;
    });
    
    // legend title
  buttonBox.append('text')
    .classed('title', true)
    .attr('id', 'legend-title');
  
  // legend subtitle
  buttonBox.append('text')
    .classed('title', true)
    .attr('id', 'legend-subtitle')
    .text('(millions of gallons per day)');
  
  // button rectangles for *style*
  buttons.append('rect')
    .classed('filled-button', true);
  
  // button rectangles for *mouse events*
  buttons.append('rect')
    .classed('mouser-button', true)
    .style('opacity','0')
    .on('click', function(d){
      updateCategory(d.toLowerCase(), activeCategory);
    })
    .on('mouseover', function(d){
      showCategory(d.toLowerCase(), activeCategory, action = 'mouseover');
    })
    .on('mouseout', function(d){
      showCategory(activeCategory, d.toLowerCase(), action = 'mouseout');
    });
  
  // button category labels
  buttons.append('text')
    .classed('category-label', true)
    .text(function(d){
      return categoryToName(d);
    });

  // button category use values
  buttons.append('text')
    .classed('category-amount', true)
    .attr('id', function(d){
      return (d + "-button-text");
    })
    .style('font-weight', 'thick')
    .attr('text-anchor', 'end')
    .each( function(d) { this.__data__ = {category: d, wateruse: NaN}; });
  
  // add styling to the buttons and text according to which is active

  updateButtons(activeCategory);
  
}

function resizeButtons() {
  
   // reserve the top band for titles
   titlesHeight = waterUseViz.dims.buttonBox.height * 0.22;
  
  // recompute the button heights and positions for the new buttonBox width
  var buttonY = d3.scaleBand()
    .domain(categories)
    .range([titlesHeight, waterUseViz.dims.buttonBox.height])
    .paddingInner(0.1);
  
  // place buttonBox within svg (x0 and y0 calculated in the main resize() function)
  waterUseViz.elements.buttonBox
    .attr('transform', 'translate(' +
      waterUseViz.dims.buttonBox.x0 + ', ' +
      waterUseViz.dims.buttonBox.y0 + ')');
  
  // size button background so it fills buttonBox
  waterUseViz.elements.buttonBox.selectAll('#button-background')
    .attr('width', waterUseViz.dims.buttonBox.width)
    .attr('height', waterUseViz.dims.buttonBox.height);
  
  // set y values of each colored rects and associated text elements all together
  waterUseViz.elements.buttonBox.selectAll('g.button')
    .attr('transform', function(d) {
      return 'translate(' + 0 + ', ' + buttonY(d) + ')';
    });

  // set x position, height, and width of colored rects
  waterUseViz.elements.buttonBox.selectAll('.button .filled-button')
    .attr('x', waterUseViz.dims.buttonBox.width * 0.05)
    .attr('height', buttonY.bandwidth())
    .style('stroke', function(d){
      return("rgb(" + getColor(d) + ")");
    })
    .style('stroke-width', 3);
    
  waterUseViz.elements.buttonBox.selectAll('.button .mouser-button')
    .attr('x', waterUseViz.dims.buttonBox.width * 0.05)
    .attr('height', buttonY.padding(0).bandwidth() * 1.02); // seems to leave a small pad w/o multiplier 
  updateButtonWidths(activeCategory);
  
  // look up the active button for further reference
  var activeButton = d3.selectAll('.button rect').filter(function(d) { return d === activeCategory; });
  
  // set y position of legend title and subtitle
  waterUseViz.elements.buttonBox.selectAll('text.title')
    .attr('x', +activeButton.attr('x'));
  waterUseViz.elements.buttonBox.select('#legend-title')
    .attr('dy', '1.2em');
  waterUseViz.elements.buttonBox.select('#legend-subtitle')
    .attr('dy', '2.9em');

  // category labels and water use amounts are aligned relative to the width of the active (longest) button.
  // category labels are left aligned, nudged a little over from the rectangle's left edge.
  // category water use amounts are right aligned, nudged a little over from the rectangle's right edge.
  waterUseViz.elements.buttonBox.selectAll('.button .category-label')
    .attr('x', +activeButton.attr('x') + activeButton.attr('width') * 0.05)
    .attr('y', function(d) {
      return buttonY.bandwidth()/2;
    });
  waterUseViz.elements.buttonBox.selectAll('.button .category-amount')
    .attr('x', waterUseViz.dims.buttonBox.width * 0.05 + activeButton.attr('width') * 0.95)
    .attr('y', function(d) {
      return buttonY.bandwidth()/2;
    });
}

function updateButtonWidths(category) {
  waterUseViz.elements.buttonBox.selectAll('.button rect')
    .attr('width', function(d) {
      if(d === category) {
        return waterUseViz.dims.buttonBox.width;
      } else {
        return waterUseViz.dims.buttonBox.width * 0.95;
      }
    });
}

function updateButtons(category) {
  waterUseViz.elements.buttonBox
    .selectAll('.button rect')
    .style('fill', function(d) {
      if(d === category) {
        var col = "rgb(" + getColor(d) + ")";
        return (col);
      } else {
        return 'transparent';
      }
    });
    
  waterUseViz.elements.buttonBox
    .selectAll(".button rect")
    .filter(".filled-button")
    .style('opacity', function(d){
      if(d === category) {
        return 1;
      } else {
        return 0.8;
      }      
    });
    
  updateButtonWidths(category);
  
  waterUseViz.elements.buttonBox.selectAll('.button .category-label')
    .style('font-weight', function(d) {
      if(d === category) {
        return 'thick';
      } else {
        return 'normal';
      }
    })
    .style('fill', function(d) {
      if(d === category) {
        return 'black';
      } else {
        return '#6A6A6A';
      }
    });
  
  waterUseViz.elements.buttonBox.selectAll('.button .category-amount')
    .classed('hidden', function(d) {
      return d.category !== category;
    });
}
