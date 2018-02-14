## commands to run the preprocessing steps

# run the full preprocesing workflow
remake::make(remake_file = "preprocessing.yaml")

# run an individual target:
remake::make(target_names = "county_boundaries_topojson", 
             remake_file = "preprocessing.yaml")
