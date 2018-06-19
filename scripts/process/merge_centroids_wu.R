process.merge_centroids_wu <- function(viz) {
  deps <- readDepends(viz)
  wu_data <- deps[["wu_data"]]
  
  topo <- rgdal::readOGR(as.viz(viz$depends$topo)$location, #layer=viz$process_args$layer, 
                         drop_unsupported_fields=TRUE, stringsAsFactors=FALSE) # bypass readDepends for topojson
  
  # extract the centroid coordinates into a table with GEOID
  centroid_coords <- bind_cols(select(topo@data, HUC8), rename(as_data_frame(topo@coords), lon=coords.x1, lat=coords.x2))

  # merge datasets and keep a minimal set of columns
  county_data <- topo@data %>%
    left_join(wu_data, by=c('HUC8'='HUC')) %>%
    select(HUC8, NAME, total:industrial) %>% 
    rowwise() %>% 
    mutate(other = total - sum(thermoelectric, publicsupply, irrigation, industrial)) %>%
    mutate(total = signif(total, digits = 3),
           thermoelectric = signif(thermoelectric, digits = 3),
           irrigation = signif(irrigation, digits = 3),
           publicsupply =  signif(publicsupply, digits = 3),
           industrial = signif(industrial, digits = 3)) 
  
  # add centroid coordinates to the WU data
  county_data <- county_data %>%
    left_join(centroid_coords, by='HUC8')
  
  # write to file - save centroids as tsv instead of topojson for efficiency
  # (307 Kb instead of 412 for simplified json with 1 character per column name,
  # or 664 Kb for json with complete column names)
  readr::write_tsv(county_data, path=viz[['location']])
}
