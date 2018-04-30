#' Summarize water use data to national totals
#'
process.state_wu_data <- function(viz) {
  
  deps <- readDepends(viz)
  wu_df <- deps[["rawdata"]]
  state_df <- deps[["state_boundaries"]]
  state_names <- state_df$objects[[1]][["geometries"]][["properties"]]

  state_data <- list()
  i <- 1
  for(state in unique(wu_df$STATE)){
    
    wu_df_state <- wu_df %>%
      dplyr::filter(STATE == state) %>%
      dplyr::summarise(total = signif(sum(total), digits = 3),
                       thermoelectric = signif(sum(thermoelectric), digits = 3),
                       publicsupply = signif(sum(publicsupply), digits = 3),
                       irrigation = signif(sum(irrigation), digits = 3),
                       industrial = signif(sum(industrial), digits = 3)) %>%
      tidyr::gather(category, wateruse) %>%
      mutate(fancynums = ifelse(wateruse>2,
                                format(round(wateruse), big.mark=",", scientific=FALSE),
                                format(wateruse, big.mark=",", scientific=FALSE)))
    
    wu_df_state$fancynums <- gsub(" ","",wu_df_state$fancynums)
    
    state_data[[i]] <- list(abrv = state,
                           open = state %in% viz[["process_args"]][["drag_states"]],
                           STATE_NAME = state_names$STATE_NAME[state_names$STATE_ABBV == state],
                           use = wu_df_state)
    i <- i + 1

  }
  totals <- sapply(state_data, function(x) x[["use"]]$wateruse[x[["use"]]$category == "total"])
  state_data <- state_data[order(totals, decreasing = FALSE)]
  
  jsonlite::write_json(state_data, viz[["location"]], auto_unbox=TRUE)
}
