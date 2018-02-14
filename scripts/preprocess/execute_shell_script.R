execute_shell_script <- function(location, shell_script_fn){
  
  cmd <- paste("bash", shell_script_fn)
  system(cmd)
  
}
