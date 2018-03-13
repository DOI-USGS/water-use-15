process_counties_to_states <- function(outfile='cache/state_boundaries_USA.json', county_topojson='cache/county_boundaries_USA.json',
                                       script_file = 'scripts/preprocess/process_counties_to_states.js') {
  
  # execute the shell script
  cmd <- paste(
    'node',
    script_file,
    sprintf('--counties %s',county_topojson),
    sprintf('--states %s',outfile))
  # for the following line to work, the system environment variable PATH should
  # include paths to bash, dirname, etc. - for Alison, that required adding
  # C:\Program Files\Git\usr\bin to the windows system PATH variable
  system(sprintf('bash -c "source $USERPROFILE/.bash_profile && %s"', cmd))
}
