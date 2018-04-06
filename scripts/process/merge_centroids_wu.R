process.merge_centroids_wu <- function(viz) {
  deps <- readDepends(viz)
  wu_data_15_simple <- deps[["wu_data_15_simple"]]
  topo <- rgdal::readOGR(as.viz(viz$depends$topo)$location, layer=viz$process_args$layer, drop_unsupported_fields=TRUE, stringsAsFactors=FALSE) # bypass readDepends for topojson
  
  # merge datasets and keep a minimal set of columns
  county_data <- topo@data %>%
    left_join(wu_data_15_simple, by=c('GEOID'='FIPS')) %>%
    select(GEOID, STATE_ABBV, COUNTY, countypop:industrial) %>% 
    rowwise() %>% 
    mutate(other = total - sum(thermoelectric, publicsupply, irrigation, industrial))
  
  # if requested, add centroids data to the county boundaries
  if('centroids' %in% names(deps)) {
    centroids <- rgdal::readOGR(as.viz(viz$depends$centroids)$location, layer='centroids', drop_unsupported_fields=TRUE, stringsAsFactors=FALSE) # bypass readDepends for topojson
    centroid_coords <- bind_cols(select(centroids@data, GEOID), rename(as_data_frame(centroids@coords), lon=coords.x1, lat=coords.x2))
    county_data <- county_data %>%
      left_join(centroid_coords, by='GEOID')
  }
  
  # rename for efficient storage in json - saves (240 Kb) (42% of json table, 29% of centroids topojson)!
  county_data <- county_data %>% 
    rename(
      G=GEOID, A=STATE_ABBV, C=COUNTY, p=countypop,
      t=total, e=thermoelectric, s=publicsupply, i=irrigation, n=industrial, o=other,
      x=lon, y=lat)
  
  # put the result back into the topojson
  topo@data <- select(county_data, -x, -y)
  
  # write to file - save centroids as simple json instead of topojson for efficiency (412 Kb instead of 586 Kb)
  jsonlite::write_json(county_data, path="cache/county_centroids_wu_table.json")
  geojsonio::topojson_write(topo, file=viz[['location']], overwrite=TRUE, object_name=viz$process_args$layer)
}
