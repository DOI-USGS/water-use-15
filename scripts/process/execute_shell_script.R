process.execute_shell_script <- function(viz){
  deps <- readDepends(viz)
  
  cmd <- paste("bash", deps[["shell_script"]])
  system(cmd)
  
}
