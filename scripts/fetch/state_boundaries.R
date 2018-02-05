# Adapted from vizstorm.

fetchTimestamp.state_boundaries <- vizlab::alwaysCurrent

#' Gets data for state polygons.
#' @description Builds and executes a call to the get_map_data utility function.
#' 
#' @param viz a vizlab object including \code{viewbox_limits} and \code{fetch_args}
#' @details 
#' Depends on: \code{viewbox_limits}: an sf representation of the x and y 
#' (geographic coordinates) limits of the svg viewbox to be filled.
#' \code{fetch_args}: arguments to maps::map such as database, region, xlim and ylim.
#' 
#'  Coordinate reference systems are matched to the viewbox_limits for subsetting.
#'   
fetch.state_boundaries <- function(viz){
  deps <- readDepends(viz)
  checkRequired(deps, "viewbox")
  viewbox <- deps[["viewbox"]]
  
  viewbox_args <- list(crs=sf::st_crs(viewbox), within = viewbox)
  map_args <- append(viz$fetch_args, viewbox_args)
  map_data <- do.call(get_map_data, args = map_args)
  
  saveRDS(map_data, viz[['location']])
}
