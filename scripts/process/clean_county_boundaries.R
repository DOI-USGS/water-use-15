#' Cleans data for historical county polygons.
process.county_boundaries <- function(viz=as.viz('county_boundaries')){
  deps <- readDepends(viz)
  
  # unzip the shapefiles, which are zip files within a zip file
  map_zip <- deps$county_boundaries_zip
  map_dir <- file.path(tempdir(), 'county_boundaries')
  unzip(map_zip, exdir=map_dir)
  map_shp_zips <- dir(dir(map_dir, full.names=TRUE), full.names=TRUE)
  map_shps <- lapply(map_shp_zips, function(zipname) {
    files <- unzip(zipname, exdir=map_dir) # list of vectors of dbf/prj/shp/shp.xml/etc filepaths, length = number of shapefiles
    base_no_ext <- gsub('\\.zip', '', basename(zipname))
    year <- substring(base_no_ext, nchar(base_no_ext)-3)
    list(files=files, year=year)
  })
  
  map_data <- lapply(map_shps, function(shapefile_files) {
    message("reading county data for year ", shapefile_files$year)
    shp_file <- grep("\\.shp$", shapefile_files$files, value=TRUE)
    one_year_sf <- sf::st_read(shp_file)
  })
    
  saveRDS(map_data, viz[['location']])
}
