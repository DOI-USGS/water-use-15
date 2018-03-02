fetch_url <- function(outfile, url) {
  httr::GET(url, httr::write_disk(outfile, overwrite=TRUE))
}
