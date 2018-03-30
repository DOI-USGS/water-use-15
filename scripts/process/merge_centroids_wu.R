process.merge_centroids_wu <- function(viz) {
  deps <- readDepends(viz)
  wu_data_15_simple <- deps[["wu_data_15_simple"]]
  topo <- geojsonio::topojson_read(as.viz(viz$depends$topo)$location, stringsAsFactors=FALSE) # bypass readDepends for topojson
  
  # merge datasets and keep a minimal set of columns
  county_data <- topo@data %>%
    left_join(wu_data_15_simple, by=c('GEOID'='FIPS')) %>%
    select(GEOID, STATE_ABBV, COUNTY, countypop:industrial) %>% 
    rowwise() %>% 
    mutate(other = total - sum(thermoelectric, publicsupply, irrigation, industrial))
  
  topo@data <- county_data
  
  # write to file
  geojsonio::topojson_write(topo, file=viz[['location']])
}
