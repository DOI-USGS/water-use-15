fetch.s3_object <- function(viz){
  deps <- readDepends(viz)
  
  aws.signature::use_credentials(profile='default', file=aws.signature::default_credentials_file())
  
  # download object from an s3 bucket
  object_fn <- aws.s3::save_object(object = deps[["object_name"]], 
                                   bucket = deps[["bucket_name"]],
                                   file = viz[["location"]])
  return(object_fn)
}
