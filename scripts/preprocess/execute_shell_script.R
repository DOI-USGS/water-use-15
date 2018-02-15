execute_shell_script <- function(location, zipfilepath, shell_script_fn){
  
  ## can only work with one fips code right now
  ## need to figure out how to make an array pass in as one arg
  statefips <- paste(c("01"), collapse = " ") 
  cmd <- paste("bash", shell_script_fn, zipfilepath, statefips, location)
  
  system(cmd)
  
}
