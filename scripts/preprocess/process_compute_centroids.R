process_compute_centroids <- function(outfile, spdat, county_dict_file) {
  
  # compute the centroids (actually, return a point on the surface of each multipolygon)
  centroids <- rgeos::gPointOnSurface(spdat, byid=TRUE, id=spdat@data$GEOID)
  
  # edit the properties in the spdat, removing unnecessary ones and adding
  # others from county_dict. similar to process_counties.R
  county_dict <- jsonlite::fromJSON(county_dict_file)
  spdat@data <- spdat@data %>%
    mutate(GEOID=as.character(GEOID)) %>%
    left_join(county_dict, by='GEOID') %>%
    select(GEOID, STATE_ABBV, COUNTY_LONG)
  
  # add IDs to the centroids data.frame
  centroidnames <- dimnames(centroids@coords)[[1]]
  spdatnames <- as.character(spdat@data$GEOID)
  stopifnot(all(centroidnames == spdatnames)) # just confirming that the merge will be correct. is there a better way to do the merge?
  centroid_spdf <- sp::SpatialPointsDataFrame(centroids, spdat@data, match.ID=FALSE, proj4string=proj4string(spdat))
  
  # write to file
  geojsonio::topojson_write(centroid_spdf, file=outfile, overwrite=TRUE) # geojson would be about 37% larger
}
