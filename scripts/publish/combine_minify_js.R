publish.combine_minify_js <- function(viz) {
  args <- viz[["publish_args"]]
  
  # make sure to eliminate this one if it exists already
  if(file.exists(viz[["location"]])) { 
    file.remove(viz[["location"]])
  }
  
  # combine
  file_connection <- file(viz[["location"]])
  
  # first add vizlab resources
  for(lib in args[["lib_js"]]) {
    lib_viz <- as.viz(lib)
    publish(lib)
    # vizlab location puts these files in js/d3-modules/
    # so need to change just to js/
    lib_fp <- paste0(exportLocation(), "js/", basename(lib_viz[["location"]]))
    js_f <- readLines(lib_fp)
    write(js_f, viz[["location"]], append = TRUE)
    file.remove(lib_fp)
  }
  
  # then add custom js
  for(fp in args[["js_files"]]) {
    js_f <- readLines(fp)
    write(js_f, viz[["location"]], append = TRUE)
  }
  close(file_connection)
  
  # minify removes console.logs, so allow it to be turned off sometimes
  if(is.null(args[["troubleshoot"]]) || !args[["troubleshoot"]]) {
    # minify
    all_js <- readLines(viz[["location"]])
    minified_js <- js::uglify_optimize(all_js)
    file_connection_min <- file(viz[["location"]])
    writeLines(minified_js, file_connection_min)
    close(file_connection_min)
  }
  
  # publish single js file
  
  # create viz-like item to use in publish
  viz_js <- list(location = viz[["location"]], mimetype = "application/javascript")
  
  # use publisher to follow typical js publishing steps to get file to target
  vizlab::publish(viz_js)
  
  # delete file in js/ or it will never rebuild in remake when you change the other files
  #file.remove(viz[["location"]])
  # ^ can't do that in vizlab right now. Errors on vizmake because it needs to create a file.
}
