#!/bin/bash  

# read in the arguments describing how the files should be named
geo=$1
raw=$2
simple=$3
quantized=$4
simplify=$5
quantize=$6

# convert
echo Topojsonifying...
geo2topo counties=$geo -o $raw

# simplify
echo Simplifying...
toposimplify -s $simplify -f $raw -o $simple

# quantize (store as integers, scale later)
echo Quantizing...
topoquantize $quantize $simple -o $quantized

echo Done.
