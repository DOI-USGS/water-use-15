
fetchTimestamp.s3_object <- vizlab::alwaysCurrent

fetch.s3_object <- function(viz){

  args <- viz[["fetch_args"]]
  
  aws.signature::use_credentials(profile='default', file=aws.signature::default_credentials_file())
  
  # download object from an s3 bucket
  object_fn <- aws.s3::save_object(object = args[["object_name"]], 
                                   bucket = args[["bucket_name"]],
                                   file = viz[["location"]])
  return(object_fn)
}
