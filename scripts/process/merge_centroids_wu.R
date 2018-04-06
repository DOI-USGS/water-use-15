process.merge_centroids_wu <- function(viz) {
  deps <- readDepends(viz)
  wu_data_15_simple <- deps[["wu_data_15_simple"]]
  topo <- rgdal::readOGR(as.viz(viz$depends$topo)$location, layer=viz$process_args$layer, drop_unsupported_fields=TRUE, stringsAsFactors=FALSE) # bypass readDepends for topojson
  
  # extract the centroid coordinates into a table with GEOID
  centroid_coords <- bind_cols(select(topo@data, GEOID), rename(as_data_frame(topo@coords), lon=coords.x1, lat=coords.x2))
  
  # merge datasets and keep a minimal set of columns
  county_data <- topo@data %>%
    left_join(wu_data_15_simple, by=c('GEOID'='FIPS')) %>%
    select(GEOID, STATE_ABBV, COUNTY, countypop:industrial) %>% 
    rowwise() %>% 
    mutate(other = total - sum(thermoelectric, publicsupply, irrigation, industrial))
  
  # add centroid coordinates to the WU data
  county_data <- county_data %>%
    left_join(centroid_coords, by='GEOID')
  
  # rename for efficient storage in json - saves (240 Kb) (42% of json table, 29% of centroids topojson)!
  county_data <- county_data %>% 
    rename(
      G=GEOID, A=STATE_ABBV, C=COUNTY, p=countypop,
      t=total, e=thermoelectric, s=publicsupply, i=irrigation, n=industrial, o=other,
      x=lon, y=lat)
  
  # write to file - save centroids as simple json instead of topojson for efficiency (412 Kb instead of 586 Kb)
  jsonlite::write_json(county_data, path=viz[['location']])
}
