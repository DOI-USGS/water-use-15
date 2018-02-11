#' Extract a JSON dictionary file from a zipfile
#'
#' viz should contain a `zipfile` dependency that's the name of the .zip file,
#' and a `process_args$dict` argument that's the name of the JSON file to
#' extract
process.extract_dict <- function(viz) {
  zipfile <- readDepends(viz)$zipfile
  dictname <- viz$process_args$dict
  exdir <- dirname(viz$location)
  exfile <- basename(viz$location)
  if(exfile != dictname) {
    # be rigid for now. we could make this function more flexible to allow for
    # renaming, but I don't [yet] see the point
    stop('viz$location and viz$process_args$dict must be identical')
  }
  unzip(zipfile=zipfile, files=dictname, exdir=exdir, overwrite=TRUE)
}
