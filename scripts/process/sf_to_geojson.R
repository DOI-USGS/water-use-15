# Adapted from vizstorm.

fetchTimestamp.sf_to_geojson <- vizlab::alwaysCurrent

#' Saves sf data as geojson.
#' @description Converts sf data to sp, then saves as geojson for use in d3.
#' 
#' @param viz a vizlab object including \code{viewbox_limits} and \code{fetch_args}
#' @details 
#' Depends on: \code{map_data}: an sf representation of the x and y 
#' (geographic coordinates) values of map_data shapes (counties, states, countries, etc).
#'   
process.sf_to_geojson <- function(viz){
  deps <- readDepends(viz)
  checkRequired(deps, "map_data")
  map_data <- deps[["map_data"]]
  
  # spatial data needs to be sp to use writeOGR
  # saves empty file if there is not any map features
  if(nrow(map_data) > 0){
    map_data_sp <- as(map_data, "Spatial") 
    # precip cells were missing data, causing writeOGR to fail
    # added the rowname ("cell 1") as an ID, and it works (Hack?)
    if(any(dim(map_data_sp@data) == 0)){
      map_data_sp@data <- data.frame(ID = row.names(map_data_sp@data), stringsAsFactors = FALSE)
    }
    rgdal::writeOGR(map_data_sp, viz[['location']], 
                    layer="map_data_sp", driver="GeoJSON",
                    check_exists=TRUE, overwrite_layer=TRUE)
  } else {
    write.table(data.frame(), viz[["location"]])
  }
  
}
