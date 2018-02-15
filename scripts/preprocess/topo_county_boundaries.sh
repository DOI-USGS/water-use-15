#!/bin/bash  

# create a temp directory
TMP=$(mktemp -d)

# unzip the geojson
unzip $1 -d $TMP

# pick out the geojson files (exclude counties.js and states.js)
GJ=$(dir $TMP/*.geojson)

# list state fips for now
statefips=$2

for fip in $statefips

do

echo $fip

# convert to topojson
geo2topo \
  state=$TMP/$fip.geojson \
  -o $TMP/$fip.json

# simplify
toposimplify -s 1e-4 -f \
  $TMP/$fip.json \
  -o $TMP/$fip-simple.json

# quantize (store as integers, scale later)
topoquantize 1e5 \
  $TMP/$fip-simple.json \
  -o $TMP/$fip-quantized.json
  
done

echo All done

# zip back up for storage in cache/
WD=$(pwd)
cd "$TMP"
zip "$WD/$3" ./*quantized.json states.json counties.json
cd "$WD"

