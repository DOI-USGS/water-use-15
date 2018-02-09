#' Cleans data for historical county polygons.
process.county_boundaries <- function(viz){
  deps <- readDepends(viz)
  
  # unzip the shapefiles, which are zip files within a zip file
  map_zip <- deps$county_boundaries_zip
  map_dir <- file.path(tempdir(), 'county_boundaries')
  unzip(map_zip, exdir=map_dir)
  map_shp_zips <- dir(dir(map_dir, full.names=TRUE), full.names=TRUE)
  map_shps <- lapply(map_shp_zips, function(zipname) {
    files <- unzip(zipname, exdir=map_dir) # list of vectors of dbf/prj/shp/shp.xml/etc filepaths, length = number of shapefiles
    base_no_ext <- gsub('\\.zip', '', basename(zipname))
    year <- substring(base_no_ext, nchar(base_no_ext)-3)
    list(files=files, year=year)
  })
  names(map_shps) <- sapply(map_shps, function(map_shp) map_shp$year)
  
  # load into R
  decade_shps <- lapply(map_shps, function(shapefile_files) {
    message("reading county data for year ", shapefile_files$year)
    shp_file <- grep("\\.shp$", shapefile_files$files, value=TRUE)
    layer <- sf::st_layers(shp_file)$name
    one_year_sf <- sf::st_read(shp_file, layer=layer, stringsAsFactors=FALSE, quiet=TRUE, check_ring_dir=TRUE)
    list(sf=one_year_sf, year=shapefile_files$year)
  })
  
  # harmonize each decadal dataset and combine them into 1
  all_shps_simple <- simplify_combine_shps(decade_shps)
  
  # supplement state info with names and abbreviations from dataRetrieval and
  # our made-up abbreviations for the territories of AK and HI
  states <- consolidate_state_info(all_shps_simple)
  
  # supplement county info with long names from dataRetrieval. 214 counties are
  # missing either a long or short name even after this merge, and 16 of those
  # have neither. fill these in as best we can - reuse long or short name if
  # available, otherwise use the county FIPS
  counties <- consolidate_county_info(all_shps_simple)
  
  # split the country-wide shapefiles into state-wide shapefiles
  split_shps <- lapply(setNames(nm=states$state_FIPS), function(state_fips) {
    # subset to just one state
    state_shp <- all_shps_simple %>%
      filter(state_FIPS == state_fips) %>%
      select(year, state_FIPS, county_FIPS, geometry)
    
    # # consolidate into a minimal number of non-duplicated county boundaries
    # message('consolidating ', states %>% filter(state_FIPS==state_fips) %>% pull(state_name))
    # distinct_shps <- consolidate_county_polygons(state_shp)
    # return(distinct_shps)
    
    return(state_shp)
  })
  
  geojsondir <- file.path(tempdir(), 'geojson')
  dir.create(geojsondir)
  lapply(setNames(nm=names(split_shps)), function(split_shp_nm) {
    split_shp <- split_shps[[split_shp_nm]]
    geojsonio::geojson_write(
      input=split_shp,
      file=file.path(geojsondir, sprintf('%s.geojson', split_shp_nm)),
      geometry='multipolygon',
      convert_wgs84=TRUE)
  })
  
    
  # saveRDS(map_data, viz[['location']])
}

bash <- paste(c(
  
  ), collapse='\n')

simplify_combine_shps <- function(decade_shps) {
  # attach IDs we can use to join across decades
  decade_shps_simple <- lapply(decade_shps, function(decade_shp) {
    year <- as.numeric(decade_shp$year)
    sf_simple <- mutate(decade_shp$sf, year=year)
    if(year < 1999) {
      # message(decade_shp$year,' is like 1990')
      sf_simple <- sf_simple %>%
        mutate(
          state_FIPS=ifelse(substr(NHGISST, 3, 3)=='0', substr(NHGISST, 1, 2), NHGISST),
          county_FIPS=ifelse(substr(NHGISCTY, 4, 4)=='0', substr(NHGISCTY, 1, 3), NHGISCTY),
          state_name=STATENAM,
          county_short=NHGISNAM,
          county_long=NA)
    } else if(year < 2001) {
      # message(decade_shp$year,' is like 2000')
      sf_simple <- sf_simple %>%
        mutate(
          state_FIPS=STATEFP00,
          county_FIPS=COUNTYFP00,
          state_name=NA,
          county_short=NAME00,
          county_long=NAMELSAD00)
    } else if(year < 2011) {
      # message(decade_shp$year,' is like 2010')
      sf_simple <- sf_simple %>%
        mutate(
          state_FIPS=STATEFP10,
          county_FIPS=COUNTYFP10,
          state_name=NA,
          county_short=NAME10,
          county_long=NAMELSAD10)
    } else if(year < 2016) {
      # message(decade_shp$year,' is like 2015')
      sf_simple <- sf_simple %>%
        mutate(
          state_FIPS=STATEFP,
          county_FIPS=COUNTYFP,
          state_name=NA,
          county_short=NAME,
          county_long=NAMELSAD)
    } else {
      stop('unexpected year: ', year)
    }
    # print(head(decade_shp$sf %>% st_set_geometry(NULL)))
    sf_simple %>% select(year, state_FIPS, county_FIPS, state_name, county_short, county_long, geometry)
  })
  
  # combine all years using rbind.sf
  all_shps_simple <- do.call(rbind, decade_shps_simple)
  
  # tidy up and return. use underscore_sep in FIPS because some state and county
  # codes are longer than the standard, so the _ is needed to disambigute
  rownames(all_shps_simple) <- NULL
  all_shps_simple <- all_shps_simple %>%
    mutate(FIPS_U = paste(state_FIPS, county_FIPS, sep='_'))
  return(all_shps_simple)
}

consolidate_state_info <- function(all_shps_simple) {
  dr_states <- dataRetrieval::stateCd %>%
    transmute(state_FIPS=STATE, state_abbv=STUSAB, state_name=STATE_NAME)
  states <- all_shps_simple %>%
    sf::st_set_geometry(NULL) %>%
    select(state_FIPS, state_name)  %>%
    full_join(dr_states, by = c("state_FIPS", "state_name")) %>%
    distinct() %>%
    group_by(state_FIPS) %>%
    summarize(
      state_name = ifelse(length(na.omit(state_name)) == 1, na.omit(state_name), as.character(NA)),
      state_abbv = ifelse(length(na.omit(state_abbv)) == 1, na.omit(state_abbv), as.character(NA))) %>%
    filter(state_FIPS %in% unique(all_shps_simple$state_FIPS)) %>%
    mutate(state_abbv = ifelse(is.na(state_abbv), c('025'='AKT','155'='HIT')[state_FIPS], state_abbv))
  return(states)
}

consolidate_county_info <- function(all_shps_simple) {
  dr_counties <- dataRetrieval::countyCd %>%
    transmute(
      FIPS_U=paste(STATE, COUNTY, sep='_'),
      state_FIPS=STATE,
      county_FIPS=COUNTY,
      county_long=COUNTY_NAME)
  counties <- all_shps_simple %>%
    sf::st_set_geometry(NULL) %>%
    select(FIPS_U, state_FIPS, county_FIPS, county_short, county_long) %>%
    full_join(dr_counties, by=c("FIPS_U", "state_FIPS", "county_FIPS", "county_long")) %>%
    distinct() %>%
    group_by(FIPS_U) %>%
    summarize(
      state_FIPS = unique(na.omit(state_FIPS)),
      county_FIPS = unique(county_FIPS),
      county_short = {
        cs <- unique(na.omit(county_short))
        ifelse(length(cs) == 1, cs, as.character(NA))
      },
      county_long  = {
        cl <- unique(na.omit(county_long))
        ifelse(length(cl) == 1, na.omit(cl), as.character(NA))
      }) %>%
    filter(FIPS_U %in% unique(all_shps_simple$FIPS_U)) %>%
    mutate(
      county_short = ifelse(!is.na(county_short), county_short,
                            ifelse(!is.na(county_long), county_long,
                                   paste('County', county_FIPS))),
      county_long = ifelse(!is.na(county_long), county_long,
                           ifelse(!is.na(county_short), county_short,
                                  paste('County', county_FIPS)))) %>%
    select(-FIPS_U)
  return(counties)
}

consolidate_county_polygons <- function(state_shp) {
  # check shape validity and fix if needed/possible
  county_shps <- state_shp %>% mutate(validity=st_is_valid(geometry, reason=TRUE))
  bad_shps <- county_shps %>% filter(validity != 'Valid Geometry')
  if(nrow(bad_shps) > 0) {
    # try once to fix them all
    fixed_shps <- st_buffer(bad_shps, 0) %>% mutate(validity=st_is_valid(geometry, reason=TRUE))
    still_bad_shps <- fixed_shps %>% filter(validity != 'Valid Geometry')
    if(nrow(still_bad_shps) > 0) {
      # give up if that didn't work
      print(still_bad_shps %>% st_set_geometry(NULL) %>% arrange(county_FIPS, year))
      stop('Invalid and unfixable geometries')
    } else {
      # otherwise replace the invalid ones with the fixed ones
      county_shps <- rbind(
        county_shps %>% filter(validity == 'Valid Geometry'),
        fixed_shps
      )
    }
  }
  county_shps <- select(county_shps, -validity)
  
  # filter to just those counties whose polygons are unique, and add info on
  # which years use each polygon
  sparse_shp <- lapply(setNames(nm=county_shps$county_FIPS), function(county_fips) {
    county_shps <- county_shps %>%
      filter(county_FIPS == county_fips) %>%
      arrange(desc(year)) %>%
      mutate(users = '')
    message(sprintf('### %s %s ###', county_shps[[1,'state_FIPS']], county_fips))
    unique_years <- c()#county_shps[[1,'year']]
    for(i in seq_len(nrow(county_shps))) {
      iyear <- county_shps[[i,'year']]
      source_year <- NA
      for(jyear in rev(unique_years)) {
        j <- which(county_shps$year==jyear)
        need <- as(county_shps[i,], 'Spatial')
        got <- as(county_shps[j,], 'Spatial')
        if(rgeos::gEquals(need, got)) {
          source_year <- jyear
          break
        }
      }
      if(is.na(source_year)) {
        message(sprintf('new year: %d', iyear))
        unique_years <- c(unique_years, iyear)
        county_shps[i,'users'] <- as.character(iyear)
      } else {
        message(sprintf('old year: %d will use shp from %d', iyear, source_year))
        county_shps[j,'users'] <- paste(county_shps[[j,'users']], as.character(iyear), sep=',')
      }
    }
    sparse_counties <- county_shps %>%
      filter(users != '')
    return(sparse_counties)
  })
  
  # recombine into one sf object per state and return
  bound_shp <- do.call(rbind, sparse_shp)
  return(bound_shp)
}
