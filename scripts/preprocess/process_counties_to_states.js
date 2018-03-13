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

// read in the topojson file with county boundaries
var countyTopo = JSON.parse(fs.readFileSync(argv.counties, 'utf8'));

function mergeCounties(countyTopo) {
  // get an array of state FIPS codes
  var stateFipsObj = {};
  countyTopo.objects.counties.geometries.forEach(function(county) {
    stateFipsObj[county.properties.STATEFP] = 1;
  })
  var stateFips = Object.keys(stateFipsObj);
  
  // for each state FIPS, find and merge all relevant counties
  var states = [];
  stateFips.forEach(function(fip) {
      var state = topojson.merge(countyTopo, countyTopo.objects.counties.geometries.filter(function(d) {
        return d.properties.STATEFP === fip;
      }));
      state['STATEFP'] = fip;
      states.push(state);
  });
  
  /* format the states array into a geojson object. at this point one option would be to
  combine with states so we could simplify and store everything all at once...it's a
  performance and strategy question whether we ought to be combining everything (faster
  overall load time) or splitting so that we can load states first for a nice quick view,
  counties later. going with the second option for now. */
  statesGeojson = geojson.parse(
    states,
    { MultiPolygon: 'coordinates', include: ['STATEFP'] },
    crs = { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } });
  return statesGeojson;
}
statesGeojson = mergeCounties(countyTopo);

// write the output to topojson file
statesTopojson = topojson.topology({ states: statesGeojson }, 1e8);
fs.writeFileSync(argv.states, JSON.stringify(statesTopojson));
