#' Extract the min and max to use to scale circles in D3
#' 
process.find_range <- function(viz) {
  
  deps <- readDepends(viz)
  wu_data_15_simple <- deps[["wu_data_15_simple"]]
  col_names <- deps[["col_names"]][["new_names"]]
  
  water_use_df <- dplyr::select(wu_data_15_simple, col_names)
  wu_data_15_range <- range(water_use_df, na.rm = TRUE)
  
  jsonlite::write_json(wu_data_15_range, viz[["location"]])
  
}
