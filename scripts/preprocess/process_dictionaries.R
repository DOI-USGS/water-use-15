process_state_dictionary <- function(outfile, county_boundaries_census_sp) {
  # get unique FIPS both from the sp data and dataRetrieval
  unique_fips <- sort(unique(as.character(county_boundaries_census_sp@data$STATEFP)))
  dr_states <- dataRetrieval::stateCd %>%
    transmute(STATE_FIPS=STATE, STATE_ABBV=STUSAB, STATE_NAME=STATE_NAME)
  
  # check for unrecognized FIPS codes
  bad_fips <- unique_fips[!(unique_fips %in% dr_states$STATE_FIPS)]
  if(length(bad_fips) > 0) {
    stop('these state FIPS are unknown to dataRetrieval: ', paste(bad_fips, collapse=', '))
  }
  
  # filter dataRetrieval to just those FIPS in the sp data
  state_dict <- dr_states %>% filter(STATE_FIPS %in% unique_fips)
  
  jsonlite::write_json(state_dict, outfile)
}

process_county_dictionary <- function(outfile, county_boundaries_census_sp) {
  # get unique FIPS both from the sp data and dataRetrieval
  unique_fips <- county_boundaries_census_sp@data %>%
    select(GEOID, NAME) %>%
    distinct() %>%
    mutate(GEOID = as.character(GEOID),
           NAME = as.character(NAME))
  dr_counties <- dataRetrieval::countyCd %>%
    transmute(
      GEOID=paste0(STATE, COUNTY),
      STATE_FIPS=STATE,
      STATE_ABBV=STUSAB,
      COUNTY_FIPS=COUNTY,
      COUNTY_LONG=COUNTY_NAME) %>%
    bind_rows( # add counties added very recently; see https://www.cdc.gov/nchs/nvss/bridged_race/county_geography-_changes2015.pdf
      tribble(
        ~GEOID, ~STATE_FIPS, ~STATE_ABBV, ~COUNTY_FIPS,           ~COUNTY_LONG,
        '46102',        '46',        'SD',        '102', 'Oglala Lakota County',
        '02158',        '02',        'AK',        '158', 'Kusilvak Census Area'
      )
    )
  
  # check for unrecognized FIPS codes
  bad_fips <- unique_fips$GEOID[!(unique_fips$GEOID %in% dr_counties$GEOID)]
  if(length(bad_fips) > 0) {
    stop('these state-county FIPS are unknown to dataRetrieval: ', paste(bad_fips, collapse=', '))
  }
  
  # filter dataRetrieval to just those FIPS in the sp data
  county_dict <- dr_counties %>% filter(GEOID %in% unique_fips$GEOID)
  
  jsonlite::write_json(county_dict, outfile)
}
