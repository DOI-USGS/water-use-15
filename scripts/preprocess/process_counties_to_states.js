#!/usr/bin/env node

// NODE_PATH needs to be set. If it's not, add it to your ~/.bash_profile and make sure that
// the command "source $USERPROFILE/.bash_profile" is sourcing that file. (That command appears
// in the system() call in process_counties_to_states().)
console.log("NODE_PATH: " + process.env.NODE_PATH);

// need to run npm install -g topojson geojson yargs if you haven't already
var fs = require('fs');
var topojson = require('topojson');
var geojson = require('geojson');
const argv = require('yargs').argv;

// read in the topojson file with county boundaries and the json dictionary of state names and IDs
var countyTopo = JSON.parse(fs.readFileSync(argv.counties, 'utf8'));
var stateDict = JSON.parse(fs.readFileSync(argv.statedict, 'utf8'));

function mergeCounties(countyTopo, stateDict) {
  // get an array of state FIPS codes
  var stateAbbvs = [];
  stateDict.forEach(function(d) {
    stateAbbvs.push(d.STATE_ABBV);
  });
  
  // for each state FIPS, find and merge all relevant counties
  var states = [];
  stateAbbvs.forEach(function(abbv) {
    var counties = countyTopo.objects.counties.geometries.filter(function(d) {
      return d.properties.STATE_ABBV === abbv;
    });
    var state = topojson.merge(countyTopo, counties);
    var stateInfo = stateDict.filter(function(d) {
      return d.STATE_ABBV === abbv;
    })[0];
    state.STATE_NAME = stateInfo.STATE_NAME;
    state.STATE_ABBV = stateInfo.STATE_ABBV;
    states.push(state);
  });
  
  /* format the states array into a geojson object. at this point one option would be to
  combine with states so we could simplify and store everything all at once...it's a
  performance and strategy question whether we ought to be combining everything (faster
  overall load time) or splitting so that we can load states first for a nice quick view,
  counties later. going with the second option for now. */
  statesGeojson = geojson.parse(
    states,
    { MultiPolygon: 'coordinates', include: ['STATE_NAME','STATE_ABBV'] },
    crs = { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } });
  return statesGeojson;
}
statesGeojson = mergeCounties(countyTopo, stateDict);

// write the output to topojson file
statesTopojson = topojson.topology({ states: statesGeojson }, 1e8);
fs.writeFileSync(argv.states, JSON.stringify(statesTopojson));
