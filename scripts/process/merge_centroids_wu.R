process.merge_centroids_wu <- function(viz) {
  deps <- readDepends(viz)
  wu_data_15_simple <- deps[["wu_data_15_simple"]]
  centroids_topo <- geojsonio::topojson_read(as.viz(viz$depends$centroids_topo)$location, stringsAsFactors=FALSE) # bypass readDepends for topojson
  
  # merge datasets and keep a minimal set of columns
  centroids_data <- centroids_topo@data %>%
    left_join(wu_data_15_simple, by=c('GEOID'='FIPS')) %>%
    select(GEOID, STATE_ABBV, COUNTY, countypop:industrial) %>% 
    rowwise() %>% 
    mutate(other = total - sum(thermoelectric, publicsupply, irrigation, industrial))
  
  centroids_topo@data <- centroids_data
  
  # write to file
  geojsonio::topojson_write(centroids_topo, file=viz[['location']])
}
