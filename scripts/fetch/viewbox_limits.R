# Adapted from vizstorm.

fetchTimestamp.viewbox_limits <- vizlab::alwaysCurrent

#' @title Fetch viz view limits
#' @param viz a vizlab object including a \code{spatial_metadata} parameter input, and
#' optionally, a \code{"plot_metadata"} parameter input
#' @details \code{spatial_metadata} must include:
#' /describe{
#'   \item{bbox}{numeric in xmin, ymin, xmax, ymax order}
#'}
#' and optionally: 
#' /describe{
#'   \item{crs}{valid crs for \pkg{sf}}
#' }
fetch.viewbox_limits <- function(viz){
  
  deps <- readDepends(viz)
  checkRequired(deps, "spatial_metadata")
  spatial_meta <- deps[["spatial_metadata"]]
  
  # if missing, `crs` will be NULL and used the `bbox_to_polygon` 
  # return_crs default of bbox_crs, which will be WGS84
  bbox_polygon <- bbox_to_polygon(spatial_meta$bbox, 
                                  return_crs = spatial_meta$crs)
  
  saveRDS(bbox_polygon, viz[['location']])
}
