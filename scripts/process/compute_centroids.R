process.compute_centroids <- function(viz) {
  zipfile <- readDepends(viz)$zipfile
  
  # unzip to a temp dir
  exdir <- file.path(tempdir(), 'census')
  if(!dir.exists(exdir)) dir.create(exdir)
  unzip(zipfile, exdir=exdir)
  shpfiles <- normalizePath(dir(exdir, full.names=TRUE))
  
  # read the shapefile
  shpfile <- grep('\\.shp$', shpfiles, value=TRUE)
  layer <- sf::st_layers(shpfile)
  sfdat <- sf::st_read(shpfile, layer$name[[1]])
  spdat <- as(sfdat, 'Spatial')
  
  # compute the centroids
  centroids <- rgeos::gCentroid(spdat, byid=TRUE, id=spdat@data$GEOID)
  
  # add IDs to the centroids data.frame
  centroidnames <- dimnames(centroids@coords)[[1]]
  spdatnames <- as.character(spdat@data$GEOID)
  stopifnot(all(centroidnames == spdatnames)) # just confirming that the merge will be correct. is there a better way to do the merge?
  centroid_spdf <- sp::SpatialPointsDataFrame(centroids, spdat@data, match.ID=FALSE)
  
  # limit even more because centroids are a problem for our d3 projection?
  centroid_spdf <- centroid_spdf[centroid_spdf$STATEFP %in% '04',]

  # filter out Northern Mariana Island (STATEFP=='69'), Guam (STATEFP=='66'), and American Samoa (STATEFP=='60')
  centroid_spdf2 <- centroid_spdf[!(centroid_spdf$STATEFP %in% c('69','66','60')),]
  # limit to the necessary columns
  centroid_spdf3 <- centroid_spdf2[, c('GEOID')]
  
  # write to file
  geojsonio::topojson_write(centroid_spdf3, file=viz$location)
}
