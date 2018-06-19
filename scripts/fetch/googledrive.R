fetchTimestamp.googledrive <- vizlab::alwaysCurrent

#' Download file from google drive
#' 
fetch.googledrive <- function(viz) {
  googledrive::drive_download(
    file=googledrive::as_id(viz[["fetch_args"]][["google_file_id"]]),
    path=viz[["location"]])
}