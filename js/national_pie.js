// code to add a static pie chart of the national view

var piearea = d3.select("national-pie")
  .append("svg")
  .attr('viewBox', '0 0 1000 300');
  
d3.json("data/wu_data_15_sum.json", function(error, wu_national_data) {
  
  console.log(wu_national_data);

});
