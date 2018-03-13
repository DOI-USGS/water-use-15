process_compute_centroids <- function(outfile, spdat, county_dict_file) {
  
  # compute the centroids (actually, return a point on the surface of each multipolygon)
  centroids <- rgeos::gPointOnSurface(spdat, byid=TRUE, id=spdat@data$GEOID)
  
  # find those counties where the centroid doesn't actually land within the
  # county. do something different there.
  # centroid_is_in_county <- sapply(seq_len(nrow(spdat)), function(i) rgeos::gIntersects(spdat[i,], centroids[i,]))
  # bad_centroids <- which(!centroid_is_in_county)
  # for(bc in bad_centroids) {
  #   # extract the subcounty polygons that aren't holes
  #   subcounty_polys <- spdat[bc,]@polygons[[1]]@Polygons
  #   nonhole_polys <- subcounty_polys[!sapply(subcounty_polys, function(scp) { scp@hole })]
  #   nonholy_sp <- SpatialPolygons(mapply(function(poly, id) {
  #     Polygons(list(poly), ID=id)
  #   }, poly=nonhole_polys, id=seq_along(nonhole_polys)), proj4string=CRS(proj4string(spdat)))
  #   
  #   # find the centroids for the non-hole polygons
  #   subcounty_centroids <-  rgeos::gCentroid(nonholy_sp, byid=TRUE, id=sapply(nonholy_sp@polygons, function(P) P@ID))
  #   
  #   # use the centroid from the biggest non-hole polygon. alternative would be
  #   # to use the geometric median, but that sounds hard.
  #   biggest_subcounty_centroid <- subcounty_centroids[which.max(sapply(nonholy_sp@polygons, function(P) P@area)),]
  #   plot(spdat[bc,]); plot(subcounty_centroids, add=TRUE, col='blue'); plot(biggest_subcounty_centroid, add=TRUE, col='red') # shows we're getting poly-specific centroids
  #   
  #   # assign thew new value to the centroids df
  #   centroids@coords[bc,] <- biggest_subcounty_centroid@coords
  # }
  
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
