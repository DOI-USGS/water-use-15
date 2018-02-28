process.json_wu_data <- function(viz) {
  deps <- readDepends(viz)
  wu_data_15_simple <- deps[["wu_data_15_simple"]]
  browser()
  # write to file
  state_names <- unique(wu_data_15_simple$STATE)
  wu_list_for_json <- lapply(state_names, function(s) {
    state_df <- dplyr::filter(wu_data_15_simple, STATE == s)
    county_names <- unique(state_df$COUNTY)
    state_list <- lapply(county_names, function(c) {
      county_df <- dplyr::filter(state_df, COUNTY == c)
      county_df <- dplyr::select(county_df, -YEAR, -STATE, -STATEFIPS)
      return(county_df)
    })
    names(state_list) <- county_names
    return(state_list)
  })
  names(wu_list_for_json) <- state_names
  write(jsonlite::toJSON(wu_list_for_json), file=viz[["location"]])
}