process.sp_to_topojson <- function(viz) {
  deps <- readDepends(viz)
  centroid_spdf <- deps[["sp_object"]]
  
  # write to file
  geojsonio::topojson_write(centroid_spdf, file=viz[["location"]])
}