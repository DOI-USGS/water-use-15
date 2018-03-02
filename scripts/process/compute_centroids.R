process.compute_centroids <- function(viz) {
  
  spdat <- readDepends(viz)$sp_data
  
  # convert to sp
  sfdat <- as(spdat, 'sf')
  
  # compute the centroids
  centroids <- rgeos::gCentroid(spdat, byid=TRUE, id=spdat@data$GEOID)
  
  # add IDs to the centroids data.frame
  centroidnames <- dimnames(centroids@coords)[[1]]
  spdatnames <- as.character(spdat@data$GEOID)
  stopifnot(all(centroidnames == spdatnames)) # just confirming that the merge will be correct. is there a better way to do the merge?
  centroid_spdf <- sp::SpatialPointsDataFrame(centroids, spdat@data, match.ID=FALSE)
  
  # filter out Northern Mariana Island (STATEFP=='69'), Guam (STATEFP=='66'), and American Samoa (STATEFP=='60')
  centroid_spdf2 <- centroid_spdf[!(centroid_spdf$STATEFP %in% c('69','66','60')),]
  # limit to the necessary columns
  centroid_spdf3 <- centroid_spdf2[, c('GEOID')]
  
  # keep as RDS for now
  saveRDS(centroid_spdf3, viz[["location"]])

}
