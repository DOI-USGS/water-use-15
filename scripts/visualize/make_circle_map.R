visualize.make_circle_map <- function(viz){
  deps <- readDepends(viz)
  circle_sp <- deps[["sp_circles"]]
  
  crs <- viz[["visualize_args"]][["crs"]]
  wu_type <- viz[["visualize_args"]][["wu_type"]]
  radius_col_name <- paste0("radius_", wu_type)
  
  # reorder to plot biggest circles in the back
  # need na.last as either T or F or they are dropped!!!
  ordered_i <- sort(circle_sp@data[[radius_col_name]], decreasing = TRUE, 
                    index.return = TRUE, na.last=FALSE)$ix
  circle_sp <- circle_sp[ordered_i,]
  
  # transform map data
  circle_sp_transf <- sp::spTransform(circle_sp, sp::CRS(crs))
  map_data_usa <- sf::st_as_sf(maps::map('usa', fill=TRUE, plot = FALSE))
  map_data_usa <- sf::st_transform(map_data_usa, crs)
  map_data_county <- sf::st_as_sf(maps::map('county', fill=TRUE, plot = FALSE))
  map_data_county <- sf::st_transform(map_data_county, crs)
  
  cols <- color_by_wu_type(wu_type)
  
  png(viz[["location"]], width = 1200, height = 800, res=100)

  par(mar = c(0,0,0,0))
  plot(sf::st_geometry(map_data_usa), col = "#f1f1f1", border = "white")
  plot(sf::st_geometry(map_data_county), col = NA, border = "white", add=TRUE)
  points(circle_sp_transf, pch=21, 
         col = cols[["outline"]], bg = cols[["fill"]],
         cex = circle_sp_transf@data[[radius_col_name]])
  
  dev.off()
}

# irrigation
# outline_col <- rgb(124/255, 157/255, 48/255)
# fill_col <- rgb(155/255, 197/255, 61/255, 0.8)
# industrial
# outline_col <- rgb(110/255, 90/255, 84/255)
# fill_col <- rgb(138/255, 113/255, 106/255, 0.8)
# total
# outline_col <- rgb(36/255, 107/255, 136/255)
# fill_col <- rgb(46/255, 134/255, 171/255, 0.8)
# thermoelectric
# outline_col <- rgb(201/255, 148/255, 3/255)
# fill_col <- rgb(252/255, 186/255, 4/255, 0.8)
# public supply
# outline_col <- rgb(148/255, 40/255, 32/255)
# fill_col <- rgb(186/255, 50/255, 40/255, 0.8)
color_by_wu_type <- function(wu_type) {
  switch(wu_type,
         "total" = list(outline = rgb(36/255, 107/255, 136/255),
                        fill = rgb(46/255, 134/255, 171/255, 0.8)),
         "thermoelectric" = list(outline = rgb(201/255, 148/255, 3/255),
                                 fill = rgb(252/255, 186/255, 4/255, 0.8)),
         "publicsupply" = list(outline = rgb(148/255, 40/255, 32/255),
                               fill = rgb(186/255, 50/255, 40/255, 0.8)),
         "irrigation" = list(outline = rgb(124/255, 157/255, 48/255),
                             fill = rgb(155/255, 197/255, 61/255, 0.8)),
         "industrial" = list(outline = rgb(110/255, 90/255, 84/255),
                             fill = rgb(138/255, 113/255, 106/255, 0.8)))
}
