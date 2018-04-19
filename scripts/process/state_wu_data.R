#' Summarize water use data to national totals
#'
process.state_wu_data <- function(viz) {
  
  deps <- readDepends(viz)
  wu_df <- deps[["rawdata"]]
  state_df <- deps[["state_boundaries"]]
  state_names <- state_df$objects[[1]][["geometries"]][["properties"]]

  # calculate national sums of each category
  wu_df_state <- wu_df %>%
    dplyr::group_by(STATE) %>%
    dplyr::summarise(total = signif(sum(total), digits = 6),
                     thermoelectric = signif(sum(thermoelectric), digits = 6),
                     publicsupply = signif(sum(publicsupply), digits = 6),
                     irrigation = signif(sum(irrigation), digits = 6),
                     industrial = signif(sum(industrial), digits = 6)) %>%
    dplyr::mutate(open = STATE %in% viz[["process_args"]][["drag_states"]])%>%
    dplyr::rename(abrv=STATE) %>% 
    dplyr::left_join(state_names, by=c("abrv"="STATE_ABBV")) %>%
    dplyr::arrange(total)
  
  # calculate other category value
  
  jsonlite::write_json(wu_df_state, viz[["location"]] )
}
