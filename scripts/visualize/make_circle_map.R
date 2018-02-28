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
  
  png(viz[["location"]], width = 10, height = 6.0, res=450, units = 'in')

  par(mai=c(0,0,0,0), omi=c(0,0,0,0), xaxs = 'i', yaxs = 'i')
  plot(sf::st_geometry(map_data_usa), col = "#f1f1f1", border = "white")
  plot(sf::st_geometry(map_data_county), col = NA, border = "white", add=TRUE)
  points(circle_sp_transf, pch=21, 
         col = cols[["outline"]], bg = cols[["fill"]],
         cex = circle_sp_transf@data[[radius_col_name]])
  
  dev.off()
}

visualize.make_pie_map <- function(viz){
  deps <- readDepends(viz)
  circle_sp <- deps[["sp_circles"]]
  rad_multiplier <- 8500 # this is projection-specific. 
  
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
  
  
  png(viz[["location"]], width = 10, height = 6.0, res=450, units = 'in')
  
  par(mai=c(0,0,0,0), omi=c(0,0,0,0), xaxs = 'i', yaxs = 'i')
  plot(sf::st_geometry(map_data_usa), col = "#f1f1f1", border = "white")
  plot(sf::st_geometry(map_data_county), col = NA, border = "white", add=TRUE, lwd = 0.5)
  
  # start w/ irrigation, fill around the categories (make sure they add up!)
  # note: they don't add up because we aren't including all
  categories <- c("irrigation", "industrial", "thermoelectric", "publicsupply")
  
  for (j in seq_len(length(circle_sp_transf))){
    # this is in a loop because it is throwaway code: 
    r <- circle_sp_transf$radius_total[j] *rad_multiplier
    c.x <- coordinates(circle_sp_transf)[j, ][['x']]
    c.y <- coordinates(circle_sp_transf)[j, ][['y']]
    for (cat in categories){
      cat_angle <- circle_sp_transf[[cat]][j] / circle_sp_transf[['total']][j]*2*pi
      if (cat == head(categories, 1L)){
        # start the first category mirrorer relative to the top
        angle_from <- pi/2 - cat_angle/2
      } else {
        angle_from <- angle_to
      }
      angle_to <- angle_from + cat_angle
      if (!is.na(cat_angle) & cat_angle > 0.01){
        segments <- make_arc(c.x, c.y, r = r, angle_from, angle_to)
        polygon(c(c.x, segments$x, c.x), c(c.y, segments$y, c.y), 
                border = color_by_wu_type(cat)$outline, 
                col = color_by_wu_type(cat)$fill, lwd=0.25)
      }
    }
  }

  dev.off()
}

make_arc <- function(x0, y0, r, from_angle, to_angle){
  theta <- seq(from_angle, to_angle, by = 0.002)
  x_out <- rep(NA, length.out = length(theta))
  y_out <- rep(NA, length.out = length(theta))
  for (i in 1:length(theta)){
    x_out[i] = x0 + r*cos(theta[i])
    y_out[i] = y0 + r*sin(theta[i])
  }
  return(list(x = x_out, y = y_out))
}
# this will probably end up in CSS somehow?
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
