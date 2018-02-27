# This file only needs to be run one time, by one person, for the whole project.
# Including so it's easier to create buckets again in the future.

library(aws.signature)
message('check that credentials for dev profile at ', aws.signature::default_credentials_file(), " match those in get_dssecret('dev-owi-s3-access')")
aws.signature::use_credentials(profile='default', file=aws.signature::default_credentials_file())

library(aws.s3)
bucketlist() # to see which buckets are already there
new_bucket_name <- 'viz-water-use-15' # convention: 'viz-' followed by the github repo name for the vizzy
put_bucket(new_bucket_name, region='us-west-2', acl='private') # gives error if bucket already exists

# this command posted the data (took 1.5 hrs)
put_object(file='data/nhgis0002_shape.zip', object='IPUMS_NHGIS_counties.zip', bucket='viz-water-use-15')

# this command posts the USGS WU mock up data from Google Drive (see pinned items in water-use-fy18-viz Slack channel)
# had to delete the first row of info before uploading (version num + authors)
put_object(file='data/usco2015v2.0-dataviz.xlsx', object='usco2015v2.0-dataviz.xlsx', bucket='viz-water-use-15')

