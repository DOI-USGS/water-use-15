function addButtons() {
  var buttonBox = waterUseViz.elements.buttonBox = svg.append('g')
    .attr('id', 'button-container');
  
  buttonBox.append('rect')
    .attr('id', 'button-background')
    .attr('height', waterUseViz.dims.buttonBox.heightDesktop);
  
  var buttonY = d3.scaleBand()
    .domain(['title'].concat(categories))
    .range([0, waterUseViz.dims.buttonBox.heightDesktop])
    .paddingInner(0.1);
  
  // one group for each button
  var buttons = buttonBox.selectAll('rect.button')
    .data(categories)
    .enter()
    .append('g')
    .classed('button', true)
    .attr('id', function(d) {
      return d;
    })
    .attr('transform', function(d) {
      return 'translate(' + 10 + ', ' + buttonY(d) + ')';
    });
  
  // button rectangles
  buttons.append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('height', buttonY.bandwidth()) // width gets handled in updateButtons
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
    })
    .attr('y', function(d) {
      return buttonY.bandwidth()/2;
    });

  // button category use values
  buttons.append('text')
    .classed('category-amount', true)
    .text(function(d){
      return 'XX';
    })
    .style('font-weight', 'thick')
    .attr('text-anchor', 'end')
    .attr('y', function(d) {
      return buttonY.bandwidth()/2;
    });
  
  // add styling to the buttons and text according to which is active
  updateButtons(activeCategory);
  
}

function updateButtons(category) {
  waterUseViz.elements.buttonBox.selectAll('.button rect')
    .style('fill', function(d) {
      if(d === category) {
        return categoryToColor(d);
      } else {
        return '#c6c6c6';
      }
    })
    .attr('width', function(d) {
      if(d === category) {
        return waterUseViz.dims.buttonBox.width * 0.95;
      } else {
        return waterUseViz.dims.buttonBox.width * 0.7;
      }
    });
  
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
        return '#A9A9A9';
      }
    });
  
  waterUseViz.elements.buttonBox.selectAll('.button .category-amount')
    .classed('hidden', function(d) {
      return d !== category;
    })
}
