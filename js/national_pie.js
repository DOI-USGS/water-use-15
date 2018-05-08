// code to add a static pie chart of the national view
function loadPie() {
  
  function orderPieCategories(cat) {
    var orderNum;
    switch(cat) {
      case "thermoelectric":
        orderNum = 5;
        break;
      case "publicsupply":
        orderNum = 4;
        break;
      case "irrigation":
        orderNum = 1;
        break;
      case "industrial":
        orderNum = 3;
        break;
      case "other":
        orderNum = 2;
        break;
    }
    return orderNum;
  }
  
  function textAngle(d){
    var rot_rad = (d.startAngle + d.endAngle)/2 + rotate_value;
		return rot_rad * 180 / Math.PI - 90;
	}
	
	function textTransform(d, outside) {
	  var text_placement = textArc.centroid(d);
	      text_rot = 0;
	  if(outside) { 
	    text_placement = textOutsideArc.centroid(d);
    } 
    switch(d.data.category){
      case "industrial":
        text_placement = [text_placement[0],text_placement[1]*0.45];
        text_rot = textAngle(d);
        break;
      case "other":
        text_rot = textAngle(d);
        break;
      case "thermoelectric":
        text_placement = [text_placement[0]*0.55,text_placement[1]*0.65];
        break;
      case "irrigation":
        text_placement = [text_placement[0]*0.65,text_placement[1]*0.65];
        break;
      case "publicsupply":
        text_placement = [text_placement[0]*0.8,text_placement[1]*0.8];
        break;
      default:
        break;
    }
    return "translate("+text_placement+")" + "rotate("+text_rot+")";
	}
	
	function textPosition(cat) {
	  var text_anchor = "middle";
    switch(cat){
      case "industrial":
      case "other":
        text_anchor = "end";
        break;
      default:
        break;
    }
    return text_anchor;
	}
	
	function textSize(cat) {
	  var text_size = "14px";
	  switch(cat){
      case "industrial":
        text_size = "10px";
        break;
      default:
        break;
    }
    return text_size;
	}
	
  var width = 525,
      height = 350,
      radius = Math.min(width, height) / 3,
      other_cats = ["Domestic", "Livestock", "Aquaculture", "Mining"];
  
  var wu_national_no_total = waterUseViz.nationalData
        .filter(function(d) { return d.category !== "total"; });
  wu_national_no_total.forEach(function(d) { d.orderNum = +orderPieCategories(d.category); });
  var wu_national_total = waterUseViz.nationalData  
        .filter(function(d) { return d.category === "total"; });
  var wu_total = wu_national_total[0].wateruse;
  
  wu_national_no_total.forEach(function(d) {
    d.wuperc = Math.round((d.wateruse / wu_total * 100));
  });
  
  // calculate rotation to get irrigation balanced on top
  // then convert from percent to radians
  var irrigation_percent = wu_national_no_total[[2]].wuperc;
  var rotate_value = (100 - irrigation_percent/2) * Math.PI / 50;
  
  var piearea = d3.select(".side-by-side-figure")
        .append("svg")
          .attr('viewBox', '0 0 '+width+' '+height);
    
  var pie_g = piearea
        .append("g")
          .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
  
  var pie = d3.pie()
      .value(function(d) { return d.wateruse; })
      .sort(function(a,b) { return d3.ascending(a.orderNum, b.orderNum); });
      
  // for pie slices
  var path = d3.arc()
      .startAngle(function(d) { return d.startAngle + rotate_value; })
      .endAngle(function(d) { return d.endAngle + rotate_value; })
      .outerRadius(radius)
      .innerRadius(0);
  
  // for pie slice text placement
  var textArc = d3.arc()
      .startAngle(function(d) { return d.startAngle + rotate_value; })
      .endAngle(function(d) { return d.endAngle + rotate_value; })
      .outerRadius(radius*0.95)
      .innerRadius(radius*0.95);
  
  // for pie slice text placement that is on the outside of the circle
  // multiply by 2, so that textOutsideArc.centroid(d) is at the edge of the pie.
  var textOutsideArc = d3.arc()
      .startAngle(function(d) { return d.startAngle + rotate_value; })
      .endAngle(function(d) { return d.endAngle + rotate_value; })
      .outerRadius(radius*2.1)
      .innerRadius(0);
  
  var slices = pie_g.selectAll(".slice")
    .data(pie(wu_national_no_total))
    .enter()
    .append("g")
      .attr("class", "slice");
      
  slices
    .append("path")
      .attr("d", path)
      .attr("fill", function(d) { 
        return categoryToColor(d.data.category, 0.8); 
      });
        
  var sliceLabels = pie_g.selectAll('.slice-label')
        .data(pie(wu_national_no_total))
        .enter()
        .append('g')
          .attr('id', function(d) { return 'label-'+d.data.category; })
          .classed('slice-label', true);
    
  sliceLabels
    .append("text")
      .classed('label-text', true)
      .attr("transform", function(d) { return textTransform(d); })
      .attr("text-anchor", function(d) { return textPosition(d.data.category); })
      .attr("font-size", function(d) { return textSize(d.data.category); })
      .text(function(d) { 
        if(d.data.category === "other") {
          return d.data.wuperc+"%"; //other will have percent as main text
        } if(d.data.category === "publicsupply") {
          // put "Public" on the line above "Supply"
          var name_split = categoryToName(d.data.category).split(/\s+/);
          d3.select(this.parentNode)
            .append('text')
              .classed('label-text', true)
              .attr("transform", function(d) { return textTransform(d); })
              .attr("text-anchor", function(d) { return textPosition(d.data.category); })
              .attr("font-size", function(d) { return textSize(d.data.category); })
              .attr('dy', '-1em')
              .text(name_split[0]);
          return name_split[1];
        } else {
          return categoryToName(d.data.category);
        } 
      }); 
  
  sliceLabels
    .append("text")
      .classed('label-text', true)
      .attr("dy", "1.2em")
      .attr("transform", function(d) { return textTransform(d); })
      .attr("text-anchor", function(d) { return textPosition(d.data.category); })
      .attr("font-size", function(d) { return textSize(d.data.category); })
      .text(function(d) { 
        if(d.data.category === "other") {
          return ""; //other will have percent as main text
        } else {
          return d.data.wuperc+"%";
        }   
      }); 
  
  pie_g.select("#label-other")
    .selectAll('.additional-label')
    .data(other_cats)
    .enter()
    .append('text')
      .classed('label-text', true)
      .classed('additional-label', true)
      .attr('font-size', '9px')
      .attr("transform", function(d) {
        var parent_data = d3.select(this.parentNode).datum();
        return textTransform(parent_data, outside = true);
      })
      .attr('dy', function(d,i) { return (1*i-1.5)+"em"; })
      .text(function(d) { return d; });
  
}
