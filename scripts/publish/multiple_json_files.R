publish.multiple_json_files <- function(viz) {
  deps <- readDepends(viz)
  args <- viz[["publish_args"]]
  file_pattern <- args[["pattern"]]
  
  # unzip if it's a zip file
  if(grepl(".zip", deps[["files_location"]])) {
    # unzip and cache in a folder before publishing
    extract_boundary_files(deps[["files_location"]], file_pattern, viz[["location"]])
    paths_to_use <- list.files(viz[["location"]], full.names = TRUE)
    
  } else {
    # paths are just the files in the passed in location if they aren't zipped
    paths_to_use <- list.files(deps[["files_location"]], full.names = TRUE)
  }
  
  for(fp in paths_to_use) {
    
    # create viz-like item to use in publish
    viz_json <- vizlab::as.viz(list(location = fp, mimetype = "application/json"))
    
    # use publisher to follow typical json publishing steps to get file to target
    vizlab::publish(viz_json)
  }
  
}

#' Extract files from a zipfile
#'
#' @filepath the name of the .zip file
#' @pattern argument that represents the pattern in filenames to 
#' extract with grep
#' @exdir where to extract the zipfiles
extract_boundary_files <- function(zipfile, pattern, exdir) {

  allfiles <- unzip(zipfile=zipfile, list=TRUE)[["Name"]]
  boundaryfiles <- allfiles[grep(pattern, allfiles)]
  
  unzip(zipfile=zipfile, files=boundaryfiles, exdir=exdir, overwrite=TRUE)
}
