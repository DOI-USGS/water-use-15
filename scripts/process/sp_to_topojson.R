process.sp_to_topojson <- function(viz) {
  deps <- readDepends(viz)
  sp_object <- deps[["sp_object"]]
  
  # write to file
  geojsonio::topojson_write(sp_object, file=viz[["location"]])
}
