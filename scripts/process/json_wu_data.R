process.json_wu_data <- function(viz) {
  deps <- readDepends(viz)
  wu_data_15_simple <- deps[["wu_data_15_simple"]]
  
  # write to file
  write(rjson::toJSON(wu_data_15_simple), file=viz[["location"]])
}