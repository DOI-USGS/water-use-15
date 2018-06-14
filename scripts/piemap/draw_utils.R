
make_arc <- function(x0, y0, r, from_angle, to_angle){
  theta <- seq(from_angle, to_angle, by = 0.002)
  x_out <- x0 + r*cos(theta)
  y_out <- y0 + r*sin(theta)
  
  return(list(x = x_out, y = y_out))
}


plot_national_pies <- function(us_states, us_dots, metadata, filename, watermark_file = NULL){
  
  if(is.null(metadata$units)) { metadata$units <- "px" }
  
  png(filename, width = metadata$width, height = metadata$height, res=metadata$res, units = metadata$units)
  par(mai=c(0,0,0,0), omi=c(0,0,0,0), bg = metadata$bg) 
  
  plot(us_states, col = metadata$countyfill, border = metadata$countyfill, lwd = metadata$height*0.0004)
  
  if(!is.null(watermark_file)) { add_watermark(watermark_file, metadata$watermark_bump_frac) }
  
  plot_dot(us_dots)
  
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
  cols <- c("total"='#b9edf9CC')#rgb(38, 140, 178, alpha = 200, maxColorValue = 255))
  cols[[cat]]
}

fill_col <- function(col){
  col#paste0(col, 'CC')
}


plot_dot <- function(dots, scale_const = 1500){
  
  categories <- categories()
  
  for (j in seq_len(length(dots))){
    
    dot <- dots[j, ]
    r <- sqrt(dot$total) * scale_const
    
    c.x <- dot@coords[1]
    c.y <- dot@coords[2]
    if (r > 0 & !is.na(r)){
      plot_slice(c.x, c.y, r = r, 0, 2*pi, 'total')
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
}

add_watermark <- function(watermark_file, watermark_bump_frac, ...){
  # --- watermark ---
  watermark_frac <- 0.15 # fraction of the width of the figure
  if(is.null(watermark_bump_frac)) { 
    watermark_bump_frac <- 0.01
  }
  coord_space <- par()$usr
  
  watermark_alpha <- 0.4
  d <- png::readPNG(watermark_file)
  
  which_image <- d[,,4] != 0 # transparency
  d[which_image] <- watermark_alpha
  
  coord_width <- coord_space[2]-coord_space[1]
  coord_height <- coord_space[4]-coord_space[3]
  watermark_width <- dim(d)[2]
  img_scale <- coord_width*watermark_frac/watermark_width
  
  x1 <- coord_space[2]-coord_width*watermark_bump_frac
  y1 <- coord_space[3]+coord_height*watermark_bump_frac
  
  rasterImage(d, x1-ncol(d)*img_scale, y1, x1, y1+nrow(d)*img_scale)
  
}
