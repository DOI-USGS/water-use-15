#' Simplify original water use data to only what the viz needs
#'
process.simplify_wu_data <- function(viz) {
  
  deps <- readDepends(viz)
  wu_df <- deps[["rawdata"]]
  # wu_df <- read.csv("data/usco2015-MockData-dataviz.csv", stringsAsFactors = FALSE, skip = 1)
  
  # identify appropriate categories
  # county population in thousands: TP-TotPop
  # total: TO-WTotl
  # thermoelectric: PT-Wtotl
  # public supply: PS-Wtotl
  # irrigation: IR-WFrTo
  # industrial: IN-Wtotl
  wu_df_sel <- dplyr::select(wu_df,
                             STATE, STATEFIPS, COUNTY, COUNTYFIPS, FIPS, YEAR, 
                             countypop = `TP-TotPop`,
                             total = `TO-Wtotl`,
                             thermoelectric = `PT-Wtotl`,
                             publicsupply = `PS-Wtotl`,
                             irrigation = `IR-WFrTo`,
                             industrial = `IN-Wtotl`)
  
  saveRDS(wu_df, viz[["location"]])
}
