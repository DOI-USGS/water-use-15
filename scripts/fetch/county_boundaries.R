fetchTimestamp.county_boundaries <- vizlab::alwaysCurrent

#' Gets data for county polygons.
fetch.county_boundaries <- function(viz){
  deps <- readDepends(viz)
  
  map_data <- list(1,2,3)
  
  saveRDS(map_data, viz[['location']])
}
