#' Summarize water use data to national totals
#'
process.summarize_wu_data <- function(viz) {
  
  deps <- readDepends(viz)
  wu_df <- deps[["rawdata"]]
  new_wu_type_col <- deps[["col_names"]][["new_names"]]
  
  # calculate national sums of each category
  wu_df_national <- dplyr::summarize_at(wu_df, vars(new_wu_type_col), sum)
  
  # calculate other category value
  total_i <- which(names(wu_df_national) == "total")
  
  wu_df_national <- wu_df_national %>% 
    dplyr::mutate(sum_cats = rowSums(.[-total_i]), 
                  other = .[[total_i]] - sum_cats) %>%
    select(-sum_cats)

  wu_df_national_transf <- tidyr::gather(wu_df_national, key = "category", value = "wateruse")

  wu_df_national_transf$fancynums <- format(round(wu_df_national_transf$wateruse), big.mark=",", scientific=FALSE)
  wu_df_national_transf$fancynums <- gsub(" ","",wu_df_national_transf$fancynums)
  
  jsonlite::write_json(wu_df_national_transf, viz[["location"]])
}
