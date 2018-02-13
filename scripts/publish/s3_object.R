publish.s3_object <- function(viz) {
  deps <- readDepends(viz)
  
  s3_push <- put_object(file=deps[["file_location"]], 
                            object=deps[["object_name"]], 
                            bucket=deps[["bucket_name"]])

  return(s3_push)  
}
