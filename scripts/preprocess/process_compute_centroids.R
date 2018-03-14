process_compute_centroids <- function(outfile, spdat, county_dict_file) {
  
  # Return a point on the surface of each multipolygon. We were originally
  # computing true centroids with gCentroid, but gPointOnSurface seems to
  # usually return centroids while also addressing the challenges specific to
  # counties with holes (big lakes?) in them or with multiple parts
  # (multi-island counties). This function does its best to place a point on an
  # actual land surface within the set of polygons for a county. The most
  # extreme positive effect of this switch was to get the center point of the
  # Aleutian islands (which straddles the -180, 180 longitudes) plotting within
  # projectable coordinates rather than somewhere in the Atlantic Ocean.
  centroids <- rgeos::gPointOnSurface(spdat, byid=TRUE, id=spdat@data$GEOID)
  
  # edit the properties in the spdat, removing unnecessary ones (COUNTYFP,
  # COUNTYNS, AFFGEOID, etc.) and adding others from county_dict. this code
  # should match similar lines in process_counties.R
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
