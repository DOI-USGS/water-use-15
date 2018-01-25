/* Functions to set and read hash parameters in the URL */

// from https://www.udemy.com/building-interactive-data-visualizations-with-d3js/learn/v4/t/lecture/3699316?start=0
function getHash(key) {
  // Remove the "#" from keys/values
  var currentHash = location.hash.substr(1),
    hash = {};
  if(currentHash === "") { return null; }
  currentHash.split("&").forEach(function(keyVal) {
    var key = keyVal.split("=")[0];
    var val = keyVal.split("=")[1];
    hash[key] = val;
  });
  if(key) {
    return hash[key];
  }
  return hash;
}

// from https://www.udemy.com/building-interactive-data-visualizations-with-d3js/learn/v4/t/lecture/3699316?start=0
function setHash(key, val) {
  var currentHash = getHash() || {};
  currentHash[key] = val;
  var hash = "";
  var k;
  // Serialize
  for(k in currentHash) {
    if(hash != "") { hash += "&"; }
    hash += k + "=" + currentHash[k];
  }
  location.hash = hash;
}
