save_state_fips <- function(location, zipfilepath, jsonfilepath) {
  
  # get states.json into cache/
  dir_name <- dirname(zipfilepath)
  unzip(zipfilepath, files = jsonfilepath, exdir = dir_name)
  
  # read json and create vector of just fips
  states_info <- jsonlite::fromJSON(file.path(dir_name, jsonfilepath))
  fips <- states_info[["state_FIPS"]]
  fips <- c("01", "04") # limit to AZ and AL for now
  
  # write.csv did not allow col.names to work
  write.table(fips, location, sep = ",", col.names = FALSE, row.names = FALSE, quote = FALSE)
}
