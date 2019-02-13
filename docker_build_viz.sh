#!/bin/bash
viz_folder_name=water-use-15
docker start ${viz_folder_name}
docker cp ./. ${viz_folder_name}:/home/rstudio/${viz_folder_name}
docker exec ${viz_folder_name} Rscript -e 'vizlab::vizmake()'
docker cp ${viz_folder_name}:/home/rstudio/${viz_folder_name}/. .
docker stop ${viz_folder_name}
