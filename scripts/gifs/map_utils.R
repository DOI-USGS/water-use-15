# mostly from gages-through-ages project

#' take map arguments and return a projected sp object
#' 
#' @param \dots arguments passed to \code{\link[maps]{map}} excluding \code{fill} and \code{plot}
#' 
to_sp <- function(..., proj.string = "+proj=laea +lat_0=45 +lon_0=-100 +x_0=0 +y_0=0 +a=6370997 +b=6370997 +units=m +no_defs"){
  library(mapdata)
  map <- maps::map(..., fill=TRUE, plot = FALSE)
  IDs <- sapply(strsplit(map$names, ":"), function(x) x[1])
  map.sp <- map2SpatialPolygons(map, IDs=IDs, proj4string=CRS("+proj=longlat +datum=WGS84"))
  map.sp.t <- spTransform(map.sp, CRS(proj.string))
  return(map.sp.t)
}


get_proj_sheet <- function(xls_file){
  read.xls(xls_file)
}

get_proj <- function(proj_data, state_name){
  
  utm <- filter(proj_data, STATE == state_name) %>% group_by(STATE) %>% summarize(UTM = median(UTM)) %>% .$UTM
  
  if (!length(utm) == 1){
    stop('failure to extract UTM zone')
  }
  
  proj <- sprintf("+proj=utm +zone=%s ellps=WGS84", utm)
  return(proj)
}

get_shifts <- function(shift = 'landscape'){
  if (shift == 'landscape'){
    return(list(AK = list(scale = 0.43, shift = c(100,-470), rotate = -50),
                HI = list(scale = 1.3, shift = c(505, -100), rotate = -35),
                PR = list(scale = 3.5, shift = c(-110, 90), rotate=20)))
  } else {
    return(list(AK = list(scale = 0.6, shift = c(140,-525), rotate = -50),
                HI = list(scale = 1.8, shift = c(590, -170), rotate = -35),
                PR = list(scale = 4, shift = c(-200, -40), rotate=20)))
  }
  
}

get_moves <- function(){
  list(
    AK = to_sp("world", "USA:alaska"),
    HI = to_sp("world", "USA:hawaii"),
    PR = to_sp("world2Hires", "Puerto Rico")
  )
}

shifted_topojson <- function(filename, proj.string = "+proj=laea +lat_0=45 +lon_0=-100 +x_0=0 +y_0=0 +a=6370997 +b=6370997 +units=m +no_defs"){
  states <- topojson_read(filename)
  proj4string(states) <- CRS("+proj=longlat +datum=WGS84")
  states_proj <- spTransform(states, CRS(proj.string))
  shifts <- get_shifts()
  moves <- get_moves()
  code.map <- list(AK = "AK", HI = "HI", PR = c("PR","VI"))
  shift_abbr <- code.map %>% unlist %>% unname
  states_out <- subset(states_proj, !STATE_ABBV %in% shift_abbr)
  
  for(region in names(code.map)){
    to_shift <- subset(states_proj, STATE_ABBV %in% code.map[[region]])
    shifted <- do.call(shift_sp, append(list(sp = to_shift, 
                                             ref = moves[[region]],
                                             proj.string = proj4string(states_out),
                                             row.names = row.names(to_shift)), shifts[[region]]))
    states_out <- rbind(shifted, states_out, makeUniqueIDs = TRUE)
  }
  return(states_out)
}

#' create the sp object 
#'
state_sp <- function(){
  
  shifts <- get_shifts()
  
  stuff_to_move <- get_moves()
  
  
  states.out <- to_sp('state')
  for(i in names(shifts)){
    shifted <- do.call(shift_sp, c(sp = stuff_to_move[[i]], 
                                   shifts[[i]],  
                                   proj.string = proj4string(states.out),
                                   row.names = i))
    states.out <- rbind(shifted, states.out, makeUniqueIDs = TRUE)
  }
  
  return(states.out)
}

shift_centroids <- function(centroids, proj.string = "+proj=laea +lat_0=45 +lon_0=-100 +x_0=0 +y_0=0 +a=6370997 +b=6370997 +units=m +no_defs"){
    
  shifts <- get_shifts()
  
  centroids <-  sp::spTransform(centroids, CRS(proj.string))
  stuff_to_move <- get_moves()
  
  sites.out <- subset(centroids, !state %in% c(names(shifts), 'VI'))
  
  for (region in names(shifts)){
    sites.tmp <- subset(centroids, state %in% region)
    
    sites.tmp <- do.call(shift_sp, c(sp = sites.tmp, ref = stuff_to_move[[region]], 
                                     shifts[[region]]))
    sites.out <- rbind(sites.out, sites.tmp)
  }
  return(sites.out)
}


shift_sp <- function(sp, scale = NULL, shift = NULL, rotate = 0, ref=sp, proj.string=NULL, row.names=NULL){
  if (is.null(scale) & is.null(shift) & rotate == 0){
    return(obj)
  }
  
  orig.cent <- rgeos::gCentroid(ref, byid=TRUE)@coords
  scale <- max(apply(bbox(ref), 1, diff)) * scale
  obj <- elide(sp, rotate=rotate, center=orig.cent, bb = bbox(ref))
  ref <- elide(ref, rotate=rotate, center=orig.cent, bb = bbox(ref))
  obj <- elide(obj, scale=scale, center=orig.cent, bb = bbox(ref))
  ref <- elide(ref, scale=scale, center=orig.cent, bb = bbox(ref))
  new.cent <- rgeos::gCentroid(ref, byid=TRUE)@coords
  obj <- elide(obj, shift=shift*10000+c(orig.cent-new.cent))

  if (is.null(proj.string)){
    proj4string(obj) <- proj4string(sp)
  } else {
    proj4string(obj) <- proj.string
  }
  
  if (!is.null(row.names)){
    row.names(obj) <- row.names
  }
  return(obj)
}