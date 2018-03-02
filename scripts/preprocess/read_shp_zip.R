# copied most of this function from vizlab:::readData.shp. can't directly reuse
# that function here because it requires viz syntax.
read_shp_zip <- function(zipfile) {
  
  # unzip the file into a temporary location
  shp_path <- file.path(tempdir(), 'tmp')
  if (!dir.exists(shp_path)){
    dir.create(shp_path)
  }
  unzip(zipfile, exdir = shp_path)
  
  # identify the layer (assumes there's exactly one)
  layer <- tools::file_path_sans_ext(list.files(shp_path, pattern='*.shp'))[1]
  
  # read the layer from the shapefile
  data_out <- rgdal::readOGR(shp_path, layer=layer, verbose=FALSE)
  
  # clean up and return
  unlink(shp_path, recursive = TRUE)
  return(data_out)  
}

