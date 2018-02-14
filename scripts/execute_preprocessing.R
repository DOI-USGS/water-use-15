# This is the yaml that orchestrates the steps required for preprocessing the 
# county boundary and state/county fips data. This should not need to be executed 
# by every contributor because the results are stored in the S3 bucket. Most 
# should just worry about the viz.yaml. 

# This workflow assumes that you have the required R packages and appropriate 
# credentials (with the profile as "default") stored in:
aws.signature::default_credentials_file()

# required R packages:
#
# aws.s3:
#   repo: CRAN
#   version: 0.3.3
# aws.signature:
#   repo: CRAN
#   version: 0.3.5
# dplyr:
#   repo: CRAN
#   version: 0.7.4
# geojsonio:
#   repo: CRAN
#   version: 0.5.0
# jsonlite:
#   repo: CRAN
#   version: 1.5
# sf:
#   repo: CRAN
#   version: 0.6.0

# run the full preprocesing workflow
# this will take ~ 30 minutes, the longest step is fetching the data from s3
remake::make(target_names = "preprocess", 
             remake_file = "preprocessing_remake.yaml")

# run an individual target:
remake::make(target_names = "cache/county_boundaries_topojson.zip", 
             remake_file = "preprocessing_remake.yaml")
