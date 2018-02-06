#### Option 1: USAboundaries R package ####

# pros: available in R, might be cleaner (haven't looked).
# cons: data only available through 2000

fetchTimestamp.county_boundaries_USAb <- vizlab::alwaysCurrent

#' Gets data for county polygons.
fetch.county_boundaries_USAb <- function(viz=as.viz('county_boundaries_USAb')){
  deps <- readDepends(viz)
  
  map_data <- USAboundaries::us_counties(map_date=as.Date('2000-12-31'), resolution='low')
  
  saveRDS(map_data, viz[['location']])
}

#### Option 2: IPUMS ####

# pros: data available through 2015 and beyond.
# cons: boundaries are drawn inconsistently as clockwise/counterclockwise, need
#   smoothing; data must be downloaded from a GUI (documented in
#   ./data/IPUMS_metadata.txt)
