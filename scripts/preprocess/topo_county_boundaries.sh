#!/bin/bash  

# create a temp directory
TMP=$(mktemp -d)

# unzip the geojson
unzip $1 -d $TMP

# pick out the geojson files (exclude counties.js and states.js)
GJ=$(dir $TMP/*.geojson)

# list state fips for now
while read fip
do

  fipfixed=$(echo "$fip" | tr -d '\r')
  path="$TMP"/"$fipfixed"
  
  # convert to topojson
  geo2topo \
    state=$path.geojson \
    -o $path.json
  
  # simplify
  toposimplify -s 1e-4 -f \
    $path.json \
    -o $path-simple.json
  
  # quantize (store as integers, scale later)
  topoquantize 1e5 \
    $path-simple.json \
    -o $path-quantized.json
  
  echo "Finished $fipfixed"
  
done < $2

echo All done

# zip back up for storage in cache/
WD=$(pwd)
cd "$TMP"
zip "$WD/$3" ./*quantized.json states.json counties.json
cd "$WD"

