#' Extract a JSON dictionary file from a zipfile
#'
#' viz should contain a `zipfile` dependency that's the name of the .zip file,
#' and a `process_args$pattern` argument that represents the pattern in filenames to 
#' extract with grep
process.extract_boundary_files <- function(viz) {
  zipfile <- readDepends(viz)$zipfile
  pattern <- viz$process_args$pattern
  exdir <- viz$location
  
  allfiles <- unzip(zipfile=zipfile, list=TRUE)[["Name"]]
  boundaryfiles <- allfiles[grep(pattern, allfiles)]
  
  unzip(zipfile=zipfile, files=boundaryfiles, exdir=exdir, overwrite=TRUE)
}
