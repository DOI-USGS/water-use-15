process.simplify_topojson <- function(viz) {
  
  deps <- readDepends(viz)
  sp_object <- deps[["sp_object"]]
  
  # define some variable names
  tmp <- tempdir()
  geo_raw <- file.path(tmp, 'county_boundaries_raw.geojson')
  topo_raw <- file.path(tmp, 'county_boundaries_raw.json')
  topo_simple <- file.path(tmp, 'county_boundaries_simple.json')
  topo_quantized <- viz[['location']]
  
  # write to file
  # geojsonio::topojson_write(sp_object, file=topo_raw)
  writeOGR(sp_object, geo_raw, layer = "geojson", driver = "GeoJSON", check_exists=FALSE)
  
  # locate adn set execute permissions on the script file
  script_file <- viz$process_args$script_file
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

