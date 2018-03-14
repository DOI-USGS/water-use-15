process_counties <- function(outfile, county_sp, county_dict_file, script_file) {
  
  # edit the properties in the county_sp, removing unnecessary ones and adding
  # others from county_dict. this code should match similar lines in
  # process_compute_centroids.R
  county_dict <- jsonlite::fromJSON(county_dict_file)
  county_sp@data <- county_sp@data %>%
    mutate(GEOID=as.character(GEOID)) %>%
    left_join(county_dict, by='GEOID') %>%
    select(GEOID, STATE_ABBV, COUNTY_LONG)
  
  # define some file names
  tmp <- tempdir()
  geo_raw <- file.path(tmp, 'county_boundaries_raw.geojson')
  topo_raw <- file.path(tmp, 'county_boundaries_raw.json')
  topo_simple <- file.path(tmp, 'county_boundaries_simple.json')
  topo_quantized <- outfile
  
  # write to file
  # geojsonio::topojson_write(county_sp, file=topo_raw)
  writeOGR(county_sp, geo_raw, layer = "geojson", driver = "GeoJSON", check_exists=FALSE)
  
  # locate and set execute permissions on the script file
  Sys.chmod(script_file, '754')
  
  # execute the shell script
  cmd <- paste(
    script_file,
    geo_raw,
    topo_raw,
    topo_simple,
    topo_quantized)
  # for the following line to work, the system environment variable PATH should
  # include paths to bash, dirname, etc. - for Alison, that required adding
  # C:\Program Files\Git\usr\bin to the windows system PATH variable
  system(paste('bash', cmd))
  
}

