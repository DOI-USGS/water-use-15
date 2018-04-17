#' Summarize water use data to national totals
#'
process.state_wu_data <- function(viz) {
  
  deps <- readDepends(viz)
  wu_df <- deps[["rawdata"]]

  # calculate national sums of each category
  wu_df_state <- dplyr::select(wu_df, STATE, total) %>%
    dplyr::group_by(STATE) %>%
    dplyr::summarise(wu = round(sum(total))) %>%
    dplyr::mutate(open = STATE %in% viz[["process_args"]][["drag_states"]])%>%
    dplyr::rename(abrv=STATE)
  
  # calculate other category value
  
  jsonlite::write_json(wu_df_state, viz[["location"]] )
}
