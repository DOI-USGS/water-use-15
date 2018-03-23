push_SB_object <- function(sb_id, existing_fn, rename_fn) {
  
  vizlab::authRemote('sciencebase')
  
  sbtools::item_rm_files(sb_id, files = rename_fn)
  
  SBout <- sbtools::item_append_files(files = existing_fn, 
                                      sb_id = sb_id)
  
  existing_fn_plain <- gsub(pattern = "cache/", x = existing_fn, replacement = "")
  file_index <- which(sapply(SBout$files, function(x) x$name == existing_fn_plain))
  
  SBout <- sbtools::item_rename_files(sb_id = SBout$id, 
                             names = SBout$files[[file_index]][["name"]],
                             new_names = rename_fn)
  
  return(SBout)  
}
