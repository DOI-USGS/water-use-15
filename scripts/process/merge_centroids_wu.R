process.merge_centroids_wu <- function(viz) {
  deps <- readDepends(viz)
  wu_data_15_simple <- deps[["wu_data_15_simple"]]
  topo <- rgdal::readOGR(as.viz(viz$depends$topo)$location, layer=viz$process_args$layer, drop_unsupported_fields=TRUE, stringsAsFactors=FALSE) # bypass readDepends for topojson
  #topo <- jsonlite::fromJSON(as.viz(viz$depends$topo)$location, simplifyVector=FALSE, simplifyDataFrame=TRUE)
  
    # merge datasets and keep a minimal set of columns
  county_data <- topo@data %>% #topo$objects[[viz$process_args$layer]]$geometries$properties %>%
    left_join(wu_data_15_simple, by=c('GEOID'='FIPS')) %>%
    select(GEOID, STATE_ABBV, COUNTY, countypop:industrial) %>% 
    rowwise() %>% 
    mutate(other = total - sum(thermoelectric, publicsupply, irrigation, industrial))
  
  # put the result back into the topojson
  #topo$objects[[viz$process_args$layer]]$geometries$properties <- county_data
  topo@data <- county_data
  
  # write to file. don't use geojsonio::topojson_write because we can't specify two layers [yet; geojsonio is growing fast]
  # jsonlite::write_json(topo, path=viz[['location']], auto_unbox=TRUE)
  geojsonio::topojson_write(topo, file=viz[['location']], overwrite=TRUE, object_name=viz$process_args$layer)
}
