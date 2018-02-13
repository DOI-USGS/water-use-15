fetch.s3_object <- function(viz){
  deps <- readDepends(viz)
  
  # download object from an s3 bucket
  object_fn <- aws.s3::get_object(object = deps[["object_name"]], 
                                  bucket = deps[["bucket_name"]],
                                  file = viz[["location"]])
  return(object_fn)
}
