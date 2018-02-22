#### Option 1: census.gov

# use fetch.url with remoteURL set to one of
# http://www2.census.gov/geo/tiger/GENZ2015/shp/cb_2015_us_county_500k.zip
# http://www2.census.gov/geo/tiger/GENZ2015/shp/cb_2015_us_county_5m.zip
# http://www2.census.gov/geo/tiger/GENZ2015/shp/cb_2015_us_county_20m.zip
# (see https://www.census.gov/geo/maps-data/data/cbf/cbf_counties.html for details)

# this file includes counties for Guam (STATEFP=='69') and American Samoa (STATEFP=='60)
# and also the territories we do want: Virgin Islands and Puerto Rico

#### Option 2: USAboundaries R package ####

# pros: available in R, might be cleaner (haven't looked).
# cons: data only available through 2000

#' fetchTimestamp.county_boundaries_USAb <- vizlab::alwaysCurrent
#' 
#' #' Gets data for county polygons.
#' fetch.county_boundaries_USAb <- function(viz=as.viz('county_boundaries_USAb')){
#'   deps <- readDepends(viz)
#'   
#'   map_data <- USAboundaries::us_counties(map_date=as.Date('2000-12-31'), resolution='low')
#'   
#'   saveRDS(map_data, viz[['location']])
#' }

#### Option 3: IPUMS ####

# pros: data available through 2015 and beyond.
# cons: boundaries are drawn inconsistently as clockwise/counterclockwise, need
#   smoothing; data must be downloaded from a GUI (documented in
#   ./data/IPUMS_metadata.txt)
