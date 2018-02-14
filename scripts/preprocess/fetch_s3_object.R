fetch_s3_object <- function(obj_name, bucket_name, location){
  
  aws.signature::use_credentials(profile='default', file=aws.signature::default_credentials_file())
  
  # download object from an s3 bucket
  object_fn <- aws.s3::save_object(object = obj_name, 
                                   bucket = bucket_name,
                                   file = location)
  return(object_fn)
}
