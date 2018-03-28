var epsilon = 1e-6;

// The projections must have mutually exclusive clip regions on the sphere,
// as this will avoid emitting interleaving lines and polygons.
function multiplex$1(streams) {
  var n = streams.length;
  return {
    point: function(x, y) { var i = -1; while (++i < n) streams[i].point(x, y); },
    sphere: function() { var i = -1; while (++i < n) streams[i].sphere(); },
    lineStart: function() { var i = -1; while (++i < n) streams[i].lineStart(); },
    lineEnd: function() { var i = -1; while (++i < n) streams[i].lineEnd(); },
    polygonStart: function() { var i = -1; while (++i < n) streams[i].polygonStart(); },
    polygonEnd: function() { var i = -1; while (++i < n) streams[i].polygonEnd(); }
  };
}


// A composite projection for the United States, configured by default for
// 960×500. Also works quite well at 960×600 with scale 1285. The set of
// standard parallels for each region comes from USGS, which is published here:
// http://egsc.usgs.gov/isb/pubs/MapProjections/projections.html#albers
function albersUsaTerritories() {
  var cache,
      cacheStream,
      lower48 = d3.geoAlbers(), lower48Point,
      alaska = d3.geoConicEqualArea().rotate([154, 0]).center([-2, 58.5]).parallels([55, 65]), alaskaPoint, // EPSG:3338
      hawaii = d3.geoConicEqualArea().rotate([157, 0]).center([-3, 19.9]).parallels([8, 18]), hawaiiPoint, // ESRI:102007
      puertoRico = d3.geoConicEqualArea().rotate([66, 0]).center([0, 18]).parallels([8, 18]), puertoRicoPoint, //Taken from https://bl.ocks.org/mbostock/5629120
      point, pointStream = {point: function(x, y) { point = [x, y]; }};

      /*
      var puertoRicoBbox = [[-68.3, 19], [-63.9, 17]];
      */

  function albersUsa(coordinates) {
    var x = coordinates[0], y = coordinates[1];

    return point = null, (lower48Point.point(x, y), point) ||
        (alaskaPoint.point(x, y), point)  ||
        (hawaiiPoint.point(x, y), point)  ||
        (puertoRicoPoint.point(x, y), point);
  }

  albersUsa.invert = function(coordinates) {

    var k = lower48.scale(),
        t = lower48.translate(),
        x = (coordinates[0] - t[0]) / k,
        y = (coordinates[1] - t[1]) / k;
        /*
        //How are the return values calculated:
        console.info("******");
        var c0 = puertoRico(puertoRicoBbox[0]);
        var x0 = (c0[0] - t[0]) / k;
        var y0 = (c0[1] - t[1]) / k;
        console.info("p0 puertoRico", x0 + ' - ' + y0);
        var c1 = puertoRico(puertoRicoBbox[1]);
        var x1 = (c1[0] - t[0]) / k;
        var y1 = (c1[1] - t[1]) / k;
        console.info("p1 puertoRico", x1 + ' - ' + y1);
        c0 = samoa(samoaBbox[0]);
        x0 = (c0[0] - t[0]) / k;
        y0 = (c0[1] - t[1]) / k;
        console.info("p0 samoa", x0 + ' - ' + y0);
        c1 = samoa(samoaBbox[1]);
        x1 = (c1[0] - t[0]) / k;
        y1 = (c1[1] - t[1]) / k;
        console.info("p1 samoa", x1 + ' - ' + y1);
        c0 = guam(guamBbox[0]);
        x0 = (c0[0] - t[0]) / k;
        y0 = (c0[1] - t[1]) / k;
        console.info("p0 guam", x0 + ' - ' + y0);
        c1 = guam(guamBbox[1]);
        x1 = (c1[0] - t[0]) / k;
        y1 = (c1[1] - t[1]) / k;
        console.info("p1 guam", x1 + ' - ' + y1);
        */

    return (y >= 0.120 && y < 0.234 && x >= -0.425 && x < -0.214 ? alaska
        : y >= 0.166 && y < 0.234 && x >= -0.214 && x < -0.115 ? hawaii
        : y >= 0.130 && y < 0.190 && x >= 0.270 && x < 0.410 ? puertoRico
        : lower48).invert(coordinates);

  };

  albersUsa.stream = function(stream) {
    return cache && cacheStream === stream ? cache : cache = multiplex$1([lower48.stream(cacheStream = stream), alaska.stream(stream), hawaii.stream(stream), puertoRico.stream(stream)]);
  };

  albersUsa.precision = function(_) {
    if (!arguments.length) {return lower48.precision();}
    lower48.precision(_);
    alaska.precision(_);
    hawaii.precision(_);
    puertoRico.precision(_);
    return reset();
  };

  albersUsa.scale = function(_) {
    if (!arguments.length) {return lower48.scale();}
    lower48.scale(_);
    alaska.scale(_ * 0.35);
    hawaii.scale(_);
    puertoRico.scale(_ * 3);
    return albersUsa.translate(lower48.translate());
  };

  albersUsa.translate = function(_) {
    if (!arguments.length) {return lower48.translate();}
    var k = lower48.scale(), x = +_[0], y = +_[1];

    /*
    var c0 = puertoRico.translate([x + 0.350 * k, y + 0.224 * k])(puertoRicoBbox[0]);
    var x0 = (x - c0[0]) / k;
    var y0 = (y - c0[1]) / k;
    var c1 = puertoRico.translate([x + 0.350 * k, y + 0.224 * k])(puertoRicoBbox[1]);
    var x1 = (x - c1[0]) / k;
    var y1 = (y - c1[1]) / k;
    console.info('puertoRico: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ' - ' + y1);
    console.info('.clipExtent([[x '+
     (x0<0?'+ ':'- ') + Math.abs(x0.toFixed(4))+
     ' * k + epsilon, y '+
     (y0<0?'+ ':'- ') + Math.abs(y0.toFixed(4))+
     ' * k + epsilon],[x '+
     (x1<0?'+ ':'- ') + Math.abs(x1.toFixed(4))+
     ' * k - epsilon, y '+
     (y1<0?'+ ':'- ') + Math.abs(y1.toFixed(4))+
     ' * k - epsilon]])');
      c0 = samoa.translate([x - 0.492 * k, y + 0.09 * k])(samoaBbox[0]);
      x0 = (x - c0[0]) / k;
      y0 = (y - c0[1]) / k;
      c1 = samoa.translate([x - 0.492 * k, y + 0.09 * k])(samoaBbox[1]);
      x1 = (x - c1[0]) / k;
      y1 = (y - c1[1]) / k;
     console.info('samoa: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ' - ' + y1);
     console.info('.clipExtent([[x '+
      (x0<0?'+ ':'- ') + Math.abs(x0.toFixed(4))+
      ' * k + epsilon, y '+
      (y0<0?'+ ':'- ') + Math.abs(y0.toFixed(4))+
      ' * k + epsilon],[x '+
      (x1<0?'+ ':'- ') + Math.abs(x1.toFixed(4))+
      ' * k - epsilon, y '+
      (y1<0?'+ ':'- ') + Math.abs(y1.toFixed(4))+
      ' * k - epsilon]])');
      c0 = guam.translate([x - 0.408 * k, y + 0.018 * k])(guamBbox[0]);
      x0 = (x - c0[0]) / k;
      y0 = (y - c0[1]) / k;
      c1 = guam.translate([x - 0.408 * k, y + 0.018 * k])(guamBbox[1]);
      x1 = (x - c1[0]) / k;
      y1 = (y - c1[1]) / k;
     console.info('guam: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ' - ' + y1);
     console.info('.clipExtent([[x '+
      (x0<0?'+ ':'- ') + Math.abs(x0.toFixed(4))+
      ' * k + epsilon, y '+
      (y0<0?'+ ':'- ') + Math.abs(y0.toFixed(4))+
      ' * k + epsilon],[x '+
      (x1<0?'+ ':'- ') + Math.abs(x1.toFixed(4))+
      ' * k - epsilon, y '+
      (y1<0?'+ ':'- ') + Math.abs(y1.toFixed(4))+
      ' * k - epsilon]])');
      */

    lower48Point = lower48
        .translate(_)
        .clipExtent([[x - 0.455 * k, y - 0.238 * k], [x + 0.455 * k, y + 0.238 * k]])
        .stream(pointStream);

    alaskaPoint = alaska
        .translate([x - 0.307 * k, y + 0.201 * k])
        .clipExtent([[x - 0.425 * k + epsilon, y + 0.120 * k + epsilon], [x - 0.214 * k - epsilon, y + 0.233 * k - epsilon]])
        .stream(pointStream);

    hawaiiPoint = hawaii
        .translate([x - 0.205 * k, y + 0.212 * k])
        .clipExtent([[x - 0.214 * k + epsilon, y + 0.166 * k + epsilon], [x - 0.115 * k - epsilon, y + 0.233 * k - epsilon]])
        .stream(pointStream);

    puertoRicoPoint = puertoRico
        .translate([x + 0.340 * k, y + 0.170 * k])
        .clipExtent([[x + 0.270 * k + epsilon, y + 0.130 * k + epsilon],[x + 0.410 * k - epsilon, y + 0.190 * k - epsilon]])
        .stream(pointStream);


    return reset();
  };

  albersUsa.fitExtent = function(extent, object) {
    return fitExtent(albersUsa, extent, object);
  };

  albersUsa.fitSize = function(size, object) {
    return fitSize(albersUsa, size, object);
  };

  function reset() {
    cache = cacheStream = null;
    return albersUsa;
  }

  albersUsa.drawCompositionBorders = function(context) {

    /*
    console.info("CLIP EXTENT hawaii: ", hawaii.clipExtent());
    console.info("UL BBOX:", lower48.invert([hawaii.clipExtent()[0][0], hawaii.clipExtent()[0][1]]));
    console.info("UR BBOX:", lower48.invert([hawaii.clipExtent()[1][0], hawaii.clipExtent()[0][1]]));
    console.info("LD BBOX:", lower48.invert([hawaii.clipExtent()[1][0], hawaii.clipExtent()[1][1]]));
    console.info("LL BBOX:", lower48.invert([hawaii.clipExtent()[0][0], hawaii.clipExtent()[1][1]]));
    console.info("CLIP EXTENT alaska: ", alaska.clipExtent());
    console.info("UL BBOX:", lower48.invert([alaska.clipExtent()[0][0], alaska.clipExtent()[0][1]]));
    console.info("UR BBOX:", lower48.invert([alaska.clipExtent()[1][0], alaska.clipExtent()[0][1]]));
    console.info("LD BBOX:", lower48.invert([alaska.clipExtent()[1][0], alaska.clipExtent()[1][1]]));
    console.info("LL BBOX:", lower48.invert([alaska.clipExtent()[0][0], alaska.clipExtent()[1][1]]));
    console.info("CLIP EXTENT puertoRico: ", puertoRico.clipExtent());
    console.info("UL BBOX:", lower48.invert([puertoRico.clipExtent()[0][0], puertoRico.clipExtent()[0][1]]));
    console.info("UR BBOX:", lower48.invert([puertoRico.clipExtent()[1][0], puertoRico.clipExtent()[0][1]]));
    console.info("LD BBOX:", lower48.invert([puertoRico.clipExtent()[1][0], puertoRico.clipExtent()[1][1]]));
    console.info("LL BBOX:", lower48.invert([puertoRico.clipExtent()[0][0], puertoRico.clipExtent()[1][1]]));
    console.info("CLIP EXTENT samoa: ", samoa.clipExtent());
    console.info("UL BBOX:", lower48.invert([samoa.clipExtent()[0][0], samoa.clipExtent()[0][1]]));
    console.info("UR BBOX:", lower48.invert([samoa.clipExtent()[1][0], samoa.clipExtent()[0][1]]));
    console.info("LD BBOX:", lower48.invert([samoa.clipExtent()[1][0], samoa.clipExtent()[1][1]]));
    console.info("LL BBOX:", lower48.invert([samoa.clipExtent()[0][0], samoa.clipExtent()[1][1]]));
    console.info("CLIP EXTENT guam: ", guam.clipExtent());
    console.info("UL BBOX:", lower48.invert([guam.clipExtent()[0][0], guam.clipExtent()[0][1]]));
    console.info("UR BBOX:", lower48.invert([guam.clipExtent()[1][0], guam.clipExtent()[0][1]]));
    console.info("LD BBOX:", lower48.invert([guam.clipExtent()[1][0], guam.clipExtent()[1][1]]));
    console.info("LL BBOX:", lower48.invert([guam.clipExtent()[0][0], guam.clipExtent()[1][1]]));
    */

    var ulhawaii = lower48([-110.4641, 28.2805]);
    var urhawaii = lower48([-104.0597, 28.9528]);
    var ldhawaii = lower48([-103.7049, 25.1031]);
    var llhawaii = lower48([-109.8337, 24.4531]);

    var ulalaska = lower48([ -124.4745, 28.1407]);
    var uralaska = lower48([ -110.931, 30.8844]);
    var ldalaska = lower48([-109.8337, 24.4531]);
    var llalaska = lower48([-122.4628, 21.8562]);

    var ulpuertoRico = lower48([-76.8579, 25.1544]);
    var urpuertoRico = lower48([-72.429, 24.2097]);
    var ldpuertoRico = lower48([-72.8265, 22.7056]);
    var llpuertoRico = lower48([-77.1852, 23.6392]);

    context.moveTo(ulhawaii[0], ulhawaii[1]);
    context.lineTo(urhawaii[0], urhawaii[1]);
    context.lineTo(ldhawaii[0], ldhawaii[1]);
    context.lineTo(ldhawaii[0], ldhawaii[1]);
    context.lineTo(llhawaii[0], llhawaii[1]);
    context.closePath();

    context.moveTo(ulalaska[0], ulalaska[1]);
    context.lineTo(uralaska[0], uralaska[1]);
    context.lineTo(ldalaska[0], ldalaska[1]);
    context.lineTo(ldalaska[0], ldalaska[1]);
    context.lineTo(llalaska[0], llalaska[1]);
    context.closePath();

    context.moveTo(ulpuertoRico[0], ulpuertoRico[1]);
    context.lineTo(urpuertoRico[0], urpuertoRico[1]);
    context.lineTo(ldpuertoRico[0], ldpuertoRico[1]);
    context.lineTo(ldpuertoRico[0], ldpuertoRico[1]);
    context.lineTo(llpuertoRico[0], llpuertoRico[1]);
    context.closePath();

  };
  albersUsa.getCompositionBorders = function() {
    var context = d3Path.path();
    this.drawCompositionBorders(context);
    return context.toString();

  };


  return albersUsa.scale(1070);
}
