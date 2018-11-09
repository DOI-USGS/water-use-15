readData.huc_data <- function(viz) {
  data.table::fread(viz[['location']], quote = "'", colClasses = list(character=1))
}
