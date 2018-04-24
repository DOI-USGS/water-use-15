
make_arc <- function(x0, y0, r, from_angle, to_angle){
  theta <- seq(from_angle, to_angle, by = 0.002)
  x_out <- x0 + r*cos(theta)
  y_out <- y0 + r*sin(theta)
  
  return(list(x = x_out, y = y_out))
}


plot_national_pies <- function(us_states, us_counties, us_dots, metadata, filename){
  png(filename, width = metadata[1], height = metadata[2], res=metadata[3], units = 'in')
  par(mai=c(0,0,0,0), omi=c(0,0,0,0)) #, xaxs = 'i', yaxs = 'i'
  
  plot(us_states, col = NA, border = "grey50", lwd = 0.2)

  plot(us_counties, col = "grey90", border = "grey94", lwd = 0.5, add = TRUE)
  
  # don't plot state/terr border if it is a shifted state
  plot(us_states[!names(us_states) %in% c('PR','AK','HI')], col = NA, border = "white", lwd = 0.8, add = TRUE)
  
  dot_to_pie(us_dots)
  
  dev.off()
}

categories <- function(){
  c("irrigation", "industrial", "thermoelectric", "publicsupply")
}

cat_title <- function(cat){
  titles <- c("irrigation" = "Irrigation", "industrial"="Industrial", 
            "thermoelectric"="Thermoelectric", "publicsupply"="Public supply", "other"="Other")
  titles[[cat]]
}

cat_col <- function(cat){
  cols <- c("irrigation" = "#59a14f", "industrial"="#e15759", 
            "thermoelectric"="#edc948", "publicsupply"="#76b7b2", "other"="#A9A9A9", 
            "dead"='#dcdcdc', 'text'= '#A9A9A9')
  cols[[cat]]
}

fill_col <- function(col){
  paste0(col, 'CC')
}


dot_to_pie <- function(dots, scale_const = 1200){
  
  categories <- categories()
  
  for (j in seq_len(length(dots))){
    
    dot <- dots[j, ]
    r <- sqrt(dot$total) * scale_const
    
    c.x <- dot@coords[1]
    c.y <- dot@coords[2]
    
    #stole code from water-use-15
    for (cat in categories){
      cat_angle <- dot[[cat]] / dot[['total']]*2*pi
      if (cat == head(categories, 1L)){
        # start the first category mirror relative to the top
        angle_from <- pi/2 - cat_angle/2
        orig_ang <- angle_from
      } else {
        angle_from <- angle_to
      }
      angle_to <- angle_from + cat_angle
      if (!is.na(cat_angle) & cat_angle > 0.01){
        plot_slice(c.x, c.y, r = r, angle_from, angle_to, cat)
      }
    }
    
    if (r > 0 & !is.na(r) & cat == tail(categories, 1L) & angle_to < 2*pi + orig_ang){
      plot_slice(c.x, c.y, r = r, angle_to, 2*pi + orig_ang, 'other')
    }
  }
}

plot_slice <- function(x,y,r,angle_from, angle_to, cat, col = NULL){
  segments <- make_arc(x, y, r = r, angle_from, angle_to)
  if (is.null(col)){
    col <- cat_col(cat)
  }
  polygon(c(x, segments$x, x), c(y, segments$y, y), 
          border = NA,
          col = fill_col(col))
  lines(segments$x, segments$y, lwd=0.4, col = col)
}
