#!/bin/bash  

# create a temp directory
TMP=$(mktemp -d)

# unzip the geojson
unzip cache/county_boundaries_geojson.zip -d $TMP

# pick out the geojson files (exclude counties.js and states.js)
GJ=$(dir $TMP/*.geojson)

# convert to topojson
geo2topo \
  state=$TMP/01.geojson \
  -o $TMP/01.json
geo2topo \
  state=$TMP/04.geojson \
  -o $TMP/04.json

# simplify
toposimplify -s 1e-4 -f \
  $TMP/01.json \
  -o $TMP/01-simple.json
toposimplify -s 1e-4 -f \
  $TMP/04.json \
  -o $TMP/04-simple.json

# quantize (store as integers, scale later)
topoquantize 1e5 \
  $TMP/01-simple.json \
  -o $TMP/01-quantized.json
topoquantize 1e5 \
  $TMP/04-simple.json \
  -o $TMP/04-quantized.json

# zip back up for storage in cache/
WD=$(pwd)
cd "$TMP"
zip "$WD/cache/county_boundaries_topojson.zip" ./*quantized.json states.json counties.json
cd "$WD"

