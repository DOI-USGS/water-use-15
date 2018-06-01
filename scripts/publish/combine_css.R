publish.combine_css <- function(viz) {
  args <- viz[["publish_args"]]
  
  # make sure to eliminate this one if it exists already
  if(file.exists(viz[["location"]])) { 
    file.remove(viz[["location"]])
  }
  
  # combine
  file_connection <- file(viz[["location"]])
  
  # first add vizlab resource css
  for(lib in args[["lib_css"]]) {
    lib_viz <- as.viz(lib)
    publish(lib)
    lib_fp <- paste0(exportLocation(), lib_viz[["location"]])
    css_f <- readLines(lib_fp)
    write(css_f, viz[["location"]], append = TRUE)
    file.remove(lib_fp)
  }
  
  # then add cutom css for this viz
  for(fp in args[["custom_css_files"]]) {
    css_f <- readLines(fp)
    write(css_f, viz[["location"]], append = TRUE)
  }
  
  close(file_connection)
  
  # minify css using node r.js
    # Couldn't get this to work inside of this framework and it only
    # decreased size by 1KB, so not pursuing any further.
  # cmd <- sprintf('node r.js -o cssIn=%s out=%s', viz[["location"]], viz[["location"]])
  # system(paste('bash', cmd))
  
  # publish single js file
  
  # create viz-like item to use in publish
  viz_css <- list(location = viz[["location"]], mimetype = "text/css")
  
  # use publisher to follow typical css publishing steps to get file to target
  vizlab::publish(viz_css)
  
}