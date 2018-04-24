#!/usr/bin/env node

// NODE_PATH needs to be set. If it's not, add it to your ~/.bash_profile and make sure that
// the command "source $USERPROFILE/.bash_profile" is sourcing that file. (That command appears
// in the system() call in process_counties_to_states().)
console.log("NODE_PATH: " + process.env.NODE_PATH);

// you need to run "npm i -g topojson geojson d3 yargs" if you haven't already
var fs = require('fs');
var topojson = require('topojson');
var geojson = require('geojson');
var d3 = require('d3');
const argv = require('yargs').argv;

// read in the topojson file with county boundaries and the json dictionary of state names and IDs
var countyTopo = JSON.parse(fs.readFileSync(argv.counties, 'utf8'));
var stateDict = JSON.parse(fs.readFileSync(argv.statedict, 'utf8'));

// load the projection we'll be using in the main vizzy.
// note that we're using a copy of custom_project.js. this is because we needed to reformat
// into a module to be able to use node's require() function to load the script. I tried
// jquery.getScript() and failed; require() works great except you need the module formatting.
var proj = require('./custom_projection.js');

// define the projection. this code is copied from build_map.js
var waterUseViz = {
  dims: {
    map: {
      width: 1000,
      height: 700
    }
  }
};
var projection = proj.albersUsaTerritories()
  .scale([1200])
  .translate([waterUseViz.dims.map.width / 2, waterUseViz.dims.map.height / 2]);
  // default is .rotate([96,0]) to center on US (we want this)
var buildPath = d3.geoPath()
  .projection(projection);

// here's the main function where we compute state-level information, including centroids and zoom info
function mergeCounties(countyTopo, stateDict) {
  // get an array of state FIPS codes
  var stateAbbvs = [];
  stateDict.forEach(function(d) {
    stateAbbvs.push(d.STATE_ABBV);
  });
  
  // start on the calculation of zoom parameters; here we just need the dims for the whole nation
  var nation = topojson.merge(countyTopo, countyTopo.objects.counties.geometries);
  var nationBounds = buildPath.bounds(nation);
  var nationDims = {
    width: nationBounds[1][0] - nationBounds[0][0],
    height: nationBounds[1][1] - nationBounds[0][1]
  };
  
  // for each state FIPS, find and merge all relevant counties and compute zoom parameters
  var states = [];
  stateAbbvs.forEach(function(abbv) {
    
    // find and merge all relevant counties
    var counties = countyTopo.objects.counties.geometries.filter(function(d) {
      return d.properties.STATE_ABBV === abbv;
    });
    var state = topojson.merge(countyTopo, counties);
    var stateInfo = stateDict.filter(function(d) {
      return d.STATE_ABBV === abbv;
    })[0];
    state.STATE_NAME = stateInfo.STATE_NAME;
    state.STATE_ABBV = stateInfo.STATE_ABBV;
    
    // compute zoom parameters
    [cx, cy] = buildPath.centroid(state);
    // find the maximum zoom (up to nation bounding box size) that keeps the
    // whole state in view
    [[x0,y0],[x1,y1]] = buildPath.bounds(state);
    stateDims = {
      width: 2 * d3.max([ x1 - cx, cx - x0]),
      height: 2 * d3.max([ y1 - cy, cy - y0])
    };
    zoom_scale = d3.min([
      nationDims.height/stateDims.height,
      nationDims.width/stateDims.width]);
    
    // combine the results into a vector. round numbers and use short names to save on file size
    function precisionRound(number, precision) {
      var factor = Math.pow(10, precision);
      return Math.round(number * factor) / factor;
    }
    state.ZOOM ={
      x: Math.round(cx),
      y: Math.round(cy),
      s: precisionRound(zoom_scale, 3)
    };
    states.push(state);
  });
  
  /* format the states array into a geojson object. at this point one option would be to
  combine with states so we could simplify and store everything all at once...it's a
  performance and strategy question whether we ought to be combining everything (faster
  overall load time) or splitting so that we can load states first for a nice quick view,
  counties later. going with the second option for now. */
  var include;
  if(argv.zoomdims === 'yes') {
    include = ['STATE_NAME','STATE_ABBV','ZOOM'];
  } else {
    include = ['STATE_NAME','STATE_ABBV'];
  }
  statesGeojson = geojson.parse(
    states,
    { MultiPolygon: 'coordinates', include: include },
    crs = { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } });
  return statesGeojson;
}
states = mergeCounties(countyTopo, stateDict);

// write the output to topojson file
var outTopojson;
if(argv.objects === 'states-and-counties') {
  var countiesGeojson = topojson.feature(countyTopo, countyTopo.objects.counties);
  outTopojson = topojson.topology({ states: statesGeojson, counties: countiesGeojson }, argv.quantize);
} else if(argv.objects === 'states') {
  outTopojson = topojson.topology({ states: statesGeojson }, argv.quantize);
}
fs.writeFileSync(argv.outfile, JSON.stringify(outTopojson));
