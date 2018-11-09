#' Keep only one year of data for now, 2015
#' 
process.simplify_huc_data <- function(viz) {
  deps <- readDepends(viz)
  wu_df <- deps[["rawdata"]]
  yr <- deps[["year"]][["year"]]
  
  wu_df_one_year <- dplyr::filter(wu_df, Year == yr)
  wu_df_new_name <- dplyr::rename(wu_df_one_year, HUC = starts_with("HUC"))
  wu_df_merge <- dplyr::mutate(wu_df_new_name,
                               total = Total_WaterUse,
                               thermoelectric = Hydroelectric_Power,
                               irrigation = Irrigation,
                               publicsupply = PublicSupply,
                               industrial = SS_Industrial)
  wu_df_simplify <- dplyr::select(wu_df_merge, HUC, total, thermoelectric, 
                                  irrigation, publicsupply, industrial)  
  
  jsonlite::write_json(wu_df_simplify, viz[["location"]])
}
