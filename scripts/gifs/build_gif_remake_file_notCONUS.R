library(scipiper)
library(dplyr)

task_config <- data.frame(
  id = c("AK", "HI", "PR", "VI"),
  state_name = c("Alaska", "Hawaii", "Puerto Rico", "U.S. Virgin Islands"),
  map_database = c("world", "world", "world2Hires", "world2Hires"),
  stringsAsFactors = FALSE
)

map_names_list <- list(
  AK = "USA:alaska",
  HI = "USA:hawaii",
  PR = "Puerto Rico",
  VI = c("Virgin Islands:Saint Thomas", "Virgin Islands:Saint John", "Virgin Islands:Saint Croix")
)

step1 <- create_task_step(
  step_name = 'proj',

  command = function(task_name, step_name, ...) {
    state_name <- task_config[task_config$id == task_name, 'state_name']
    sprintf("get_proj(proj_data, I('%s'))", state_name)
  }
)
# step2 <- create_task_step(
#   step_name = 'counties',
#   command = function(target_name, task_name, ...) {
#     state_name <- task_config[task_config$id == task_name, 'state_name']
#     sprintf("to_sp(I('county'), I('%s'), proj.string = %s_proj)", state_name, task_name)
#   }
# )
step3 <- create_task_step(
  step_name = 'state',
  command = function(target_name, task_name, ...) {
    map_database <- task_config[task_config$id == task_name, 'map_database']
    map_names <- paste0("'", map_names_list[[task_name]], "'", collapse=", ")
    sprintf("to_sp(I('%s'), I(c(%s)), proj.string = %s_proj)", map_database, map_names, task_name)
  }
)
step4 <- create_task_step(
  step_name = 'state_totals',
  command = function(target_name, task_name, ...) {
    state_name <- task_config[task_config$id == task_name, 'state_name']
    sprintf("get_state_totals('cache/wu_state_data.json', I('%s'))", state_name)
  }
)
step5 <- create_task_step(
  step_name = 'plot_layout',
  command = function(target_name, task_name, ...) {
    sprintf("get_state_layout(%s_state, plot_metadata)", task_name)
  }
)
step6 <- create_task_step(
  step_name = 'county_dots',
  command = function(target_name, task_name, ...) {
    sprintf("get_state_dots('cache/county_centroids_USA.json', 
      'cache/county_centroids_wu.tsv',
      %s_proj, %s_state_totals)", task_name, task_name)
  }
)
step7 <- create_task_step(
  step_name = 'water_use',
  target = function(task_name, step_name, ...) {
    sprintf('gifs/%s_%s.gif.ind', task_name, step_name)
  },
  
  command = function(target_name, task_name, ...) {
    sprintf("build_wu_gif(state_sp = %s_state, dots_sp = %s_county_dots, state_totals = %s_state_totals, state_layout = %s_plot_layout, 
      watermark_file = 'images/usgs_logo_black.png', 
      ind_file = target_name, frames = I(5), I('pie'), I('irrigation'), I('thermoelectric'), I('publicsupply'))", 
            task_name, task_name, task_name, task_name, task_name)
  }
)
 
task_plan <- create_task_plan(task_config$id, list(step1, step3, step4, step5, step6, step7),
                              final_steps='water_use', ind_dir='gifs', add_complete=FALSE)
task_makefile <- create_task_makefile(
  task_plan, makefile='state_notCONUS_gifs.yml',
  sources = c('scripts/gifs/map_utils.R','scripts/gifs/data_utils.R','scripts/gifs/draw_utils.R'),
  include = 'gif_globals.yml',
  file_extensions=c('ind'), 
  packages=c('sp','maps','maptools','rgeos','readr','stringr','dataRetrieval','lubridate','dplyr','mapdata','jsonlite','scipiper'))