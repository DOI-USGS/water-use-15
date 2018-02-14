push_s3_object <- function(s3_fn, existing_fn, bucket_name) {
  
  aws.signature::use_credentials(profile='default', file=aws.signature::default_credentials_file())
  
  s3_push <- aws.s3::put_object(file = existing_fn, 
                                object = s3_fn, 
                                bucket = bucket_name)

  return(s3_push)  
}
