# copied most of this function from vizlab:::readData.shp. can't directly reuse
# that function here because it requires viz syntax. Also, we'll use this function to filter out territories for which we don't have water use data
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
  
  # filter out Northern Mariana Island (STATEFP=='69', ABBV='MP'), Guam
  # (STATEFP=='66', ABBV='GU'), and American Samoa (STATEFP=='60', ABBV='AS')
  data_out <- data_out[!(data_out@data$STATEFP %in% c('69','66','60')), ]
  
  # clean up and return
  unlink(shp_path, recursive = TRUE)
  return(data_out)  
}

#' @param sp the full spatial object to be altered, w/ STATEFP attribute
#' @param ... named character argument for fields in `sp` to be scaled
#' @param scale a scale factor to apply to fips
#' @return an `sp` similar to the input, but with the specified fips scaled according to `scale` parameter
scale_shifted_shps <- function(sp, ..., scale){
  
  args <- list(...)
  field <- names(args)
  if (length(field) != 1){
    stop(args, ' was not valid')
  }
  values <- args[[1]]
  toshift_sp <- sp[sp@data[[field]] %in% values, ]
  toshift_cent <- rgeos::gCentroid(toshift_sp, byid=F)@coords
  toshift_scale <- max(apply(bbox(toshift_sp), 1, diff)) * scale
  obj <- maptools::elide(toshift_sp, scale=toshift_scale, center=toshift_cent, bb = bbox(toshift_sp))
  new_cent <- rgeos::gCentroid(obj, byid=FALSE)@coords
  obj <- maptools::elide(obj, shift=c(toshift_cent-new_cent))
  proj4string(obj) <- proj4string(sp)
  sp_out <- rbind(sp[!(sp@data[[field]] %in% values), ], obj)
  return(sp_out)
}

geomcoll_to_poly <- function(sfg){
  classes <- sapply(seq_len(length(sfg)), function(x) class(sfg[x][[1]])[2])
  is_poly <- grepl("*POLYGON", classes)
  if (any(is_poly)){
    sfg[[which(is_poly)[1L]]]
  } else {
    NULL
  }
}


rescale_write_shps <- function(filename_out, topojson_filename, ..., scale){
  shps <- topojson_read(topojson_filename) %>% 
    st_as_sf() %>% 
    st_make_valid() 
  
  sfc_objects <- sf::st_geometry(shps)
  
  types <- vapply(sfc_objects, function(x) {
    class(x)[2]
  }, "")
  
  drop_counties <- grepl("*LINE", types) | grepl("*POINT", types)
  geo_col <- grepl("*GEOMETRYCOLLECTION", types) # test that there aren't others?
  
  for (j in which(geo_col)){
    sfg <- geomcoll_to_poly(sfg = sfc_objects[[j]])
    if (!is.null(sfg)){
      sfc_objects[[j]] <- geomcoll_to_poly(sfg = sfc_objects[[j]])
    } else {
      drop_counties[j] <- TRUE
    }
  }
  
  message('WARNING...dropping ', sum(drop_counties),' counties that were simplified to points or lines')
 
  sp_shp <- as_Spatial(sfc_objects[!drop_counties])
  st_geometry(shps) <- NULL
  data_in <- shps[!drop_counties,]
  row.names(data_in) <- row.names(sp_shp)
  spdf_shp <- SpatialPolygonsDataFrame(sp_shp, data = data_in)
  
 
  shifted_shps <- scale_shifted_shps(spdf_shp, ..., scale = scale)
  
  shifted_shps@data <- shifted_shps@data  %>%
    select(GEOID, STATE_ABBV, COUNTY_LONG)
  
  
  tmp <- tempdir()
  geo_raw <- file.path(tmp, 'county_boundaries_raw.geojson')
  
  writeOGR(shifted_shps, geo_raw, layer = "geojson", driver = "GeoJSON", check_exists=FALSE)
  system(sprintf('echo Topojsonifying...
    geo2topo counties=%s -o %s', geo_raw, filename_out))
  
}