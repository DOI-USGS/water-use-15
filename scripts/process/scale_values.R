process.scale_values <- function(viz) {
  deps <- readDepends(viz)
  centroid_sp <- deps[["sp_data"]]
  wu_df <- deps[["wu_data"]]
  wu_type_names <- deps[["wu_type_names"]][["new_names"]]
  
  centroid_df <- centroid_sp@data %>% 
    dplyr::mutate(GEOID = as.character(GEOID)) %>% 
    dplyr::left_join(wu_df, by = c("GEOID" = "FIPS")) 
  
  # only doing this for irrigation right now
  for(wu_type in wu_type_names) {
    max_val <- max(centroid_df[[wu_type]], na.rm = TRUE)
    min_val <- min(centroid_df[[wu_type]], na.rm = TRUE)
    
    # centroid_df2 <- dplyr::rowwise(centroid_df) %>% 
    #   dplyr::mutate(circle_radius = newscale(publicsupply, max_val, min_val))
    new_col_name <- paste0("radius_", wu_type)
    centroid_df[[new_col_name]] <- newscale(centroid_df[[wu_type]], max_val, min_val)
  }
  
  centroid_sp@data <- centroid_df
  
  saveRDS(centroid_sp, viz[["location"]])
}

#' x is a vector of water use volumes
#' max_vol and min_vol are single values
#' 
newscale <- function(x, max_vol, min_vol){
  
  max_cex <- 8
  min_cex <- 0.2
  
  x_cex <- sqrt(x)/pi * (max_cex/(sqrt(max_vol)/pi))
  toosmall_i <- which(x_cex < min_cex)
  
  if(length(toosmall_i) > 0) {
    x_cex[toosmall_i] <- NA
  }
  
  return(x_cex)
}
