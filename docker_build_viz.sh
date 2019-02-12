#!/bin/bash
#could use a variable for viz name?
docker start water-use-15
docker cp ./. water-use-15:/home/rstudio/water-use-15
docker exec water-use-15 Rscript -e 'vizlab::vizmake()'
docker cp water-use-15:/home/rstudio/water-use-15/. .
docker stop water-use-15