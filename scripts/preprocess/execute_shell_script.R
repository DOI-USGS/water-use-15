execute_shell_script <- function(location, zipfilepath, shell_script_fn, statecsvpath){
  
  cmd <- paste("bash", shell_script_fn, zipfilepath, statecsvpath, location)
  system(cmd)
  
}
