#' Simplify original water use data to only what the viz needs
#'
process.simplify_wu_data <- function(viz) {
  
  deps <- readDepends(viz)
  wu_df <- deps[["rawdata"]]
  orig_wu_type_col <- deps[["col_names"]][["orig_names"]]
  new_wu_type_col <- deps[["col_names"]][["new_names"]]
  
  columns_to_keep <- c("STATE", "STATEFIPS", "COUNTY", "COUNTYFIPS", "FIPS", "YEAR")
  columns_to_rename <- c("TP-TotPop", orig_wu_type_col)
  new_names <- c("countypop", new_wu_type_col)
  
  wu_df_sel <- wu_df[, c(columns_to_keep, columns_to_rename)]
  names(wu_df_sel) <- c(columns_to_keep, new_names)
  
  saveRDS(wu_df_sel, viz[["location"]])
}
