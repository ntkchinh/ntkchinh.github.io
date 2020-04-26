var point_location2d = (function() {

var origin = [150, 130], 
  j = 10, 
  scale = 10, 
  scatter = [], 
  xLine = [],
  yLine = [],
  expectedXLine = [],
  expectedYLine = [],
  beta = 0, alpha = 0, 
  key = function(d){ return d.id; }, 
  startAngleX = 0,
  startAngleY = 0,
  startAngleZ = Math.PI/8.;


d3.range(0, 13, 1).forEach(
    function(d){ 
      xLine.push([d, 0, 0]); 
    }
);

d3.range(0, 13, 1).forEach(
    function(d){ 
      yLine.push([0, d, 0]); 
    }
);


var svg    = d3.select("#svg_point_location2d")
               .call(d3.drag()
                       .on('drag', dragged)
                       .on('start', dragStart)
                       .on('end', dragEnd))
               .append('g');

var color  = d3.scaleOrdinal(d3.schemeCategory20);
var mx, my, mouseX, mouseY, mouseXaxis, mouseYaxis;
var axis_color = d3.scaleOrdinal(d3['schemeCategory20c']);

var point3d = d3._3d()
  .x(function(d){ return d.x; })
  .y(function(d){ return d.y; })
  .z(function(d){ return d.z; })
  .origin(origin)
  .scale(scale);

var xScale3d = d3._3d()
    .shape('LINE_STRIP')
    .origin(origin)
    .scale(scale);

var yScale3d = d3._3d()
    .shape('LINE_STRIP')
    .origin(origin)
    .scale(scale);


var toggle_val = 'everything';

function setToggle(val){
  toggle_val = val;
}


function plotaxis(data, axis, name, dim){
  var scale = svg
      .selectAll('path.'.concat(name, 'Scale'))
      .data(data);

  scale
      .enter()
      .append('path')
      .attr('class', '_3d '.concat(name, 'Scale'))
      .merge(scale)
      .attr('stroke', 'grey')
      .attr('stroke-width', 1.5)
      .attr('d', axis.draw);

  scale.exit().remove();  

  var text = svg
      .selectAll('text.'.concat(name, 'Text'))
      .data(data[0]);

  text
      .enter()
      .append('text')
      .attr('class', '_3d '.concat(name, 'Text'))
      .attr('dx', '.3em')
      .merge(text)
      .each(function(d){
          d.centroid = {x: d.rotated.x, 
                        y: d.rotated.y, 
                        z: d.rotated.z};
      })
      .attr('x', function(d){ return d.projected.x; })
      .attr('y', function(d){ return d.projected.y; })
      .text(function(d, i){ 
          // console.log('XXXXX', d);
          if (i % 5 == 0) {
            return i;
          } else if (i == 12) {
            return name;
          } else {
            return '';
          }
      })
  text.exit().remove();
}

function processData(data, tt){

  basis = {
      ex: data[1][0][1], 
      ey: data[2][0][1],
  };

  var points = svg.selectAll('circle').data(data[0], key);

 points
    .enter()
    .append('circle')
    .attr('class', '_3d point')
    .attr('cx', posPointX)
    .attr('cy', posPointY)
    .merge(points)
    .transition().duration(tt)
    .attr('r', 4)
    .attr('fill', function(d){ return color(d.id); })
    .attr('opacity', 1)
    .attr('cx', posPointX)
    .attr('cy', posPointY);

  var text = svg
      .selectAll('text.'.concat(name, 'Text'))
      .data(data[0]);
  text
      .enter()
      .append('text')
      .attr('class', '_3d '.concat(name, 'Text'))
      .attr('dx', '.4em')
      .merge(text)
      .transition().duration(tt)
      .each(function(d){
          d.centroid = {x: d.rotated.x, 
                        y: d.rotated.y, 
                        z: d.rotated.z};
      })
      .attr('x', function(d){ return d.projected.x; })
      .attr('y', function(d){ return d.projected.y; })
      .attr('z', function(d){ return d.projected.z; })
      .text(function(d){
          var coord = dot_basis(d, basis);
          return '['.concat(
              coord.x.toFixed(1),
              ', ',
              coord.y.toFixed(1),
              ']');
      })

  text.exit().remove();

  if (toggle_val == 'everything') {
    plotaxis(data[1], xScale3d, 'x', 0);
    plotaxis(data[2], yScale3d, 'y', 1);
  }

  svg.selectAll('._3d').sort(d3._3d().sort);
}


function dot_product(u, v){
  return u.x*v.x + u.y*v.y;
}


function dot_basis(d, basis){
  return {
      x: dot_product(d.rotated, basis.ex.rotated),
      y: dot_product(d.rotated, basis.ey.rotated),
  };
}

function posPointX(d){
  return d.projected.x;
}

function posPointY(d){
  return d.projected.y;
}


function init(){
  var cnt = 0;
  scatter = [];

  for (var z=0; z < 3; z++){
    scatter.push([
        d3.randomUniform(-j+1, j-2)(),
        d3.randomUniform(-j+1, j-2)(),
        0,
    ]);
  }

  gamma = startAngleZ;

  expectedScatter = rotatePoints(scatter, startAngleX, startAngleY, gamma);
  expectedXLine = rotatePoints(xLine, startAngleX, startAngleY, gamma);
  expectedYLine = rotatePoints(yLine, startAngleX, startAngleY, gamma);

  var data = [
      point3d(annotatePoint(expectedScatter)),
      xScale3d([expectedXLine]),
      yScale3d([expectedYLine]),
  ];

  processData(data, 1000);
}

function dragStart(){
  atan0 = Math.atan2(d3.event.y - origin[1],
                     d3.event.x - origin[0]);
}

function dragged(){
  atan1 = Math.atan2(d3.event.y - origin[1],
                     d3.event.x - origin[0]);
  
  gammaAxis = startAngleZ;
  gamma = startAngleZ + atan1 - atan0;

  if (toggle_val == 'everything') {
    gammaAxis = gamma;
  }

  expectedScatter = rotatePoints(scatter, startAngleX, startAngleY, gamma);
  expectedXLine = rotatePoints(xLine, startAngleX, startAngleY, gammaAxis);
  expectedYLine = rotatePoints(yLine, startAngleX, startAngleY, gammaAxis);

  var data = [
      point3d(annotatePoint(expectedScatter)),
      xScale3d([expectedXLine]),
      yScale3d([expectedYLine]),
  ];
  processData(data, 0);
}


function annotatePoint(points){
  result = [];
  points.forEach(function(d, i){
      result.push({x: d[0], 
                   y: d[1], 
                   z: d[2], 
                   id: 'point_' + i});
  });
  return result;
}

function rotatePoints(g, rx=0, ry=0, rz=0){
  var result = [];
  g.forEach(function(d){
    result.push(rotatePoint(d, rx, ry, rz));
  })
  return result;
}

function rotatePoint(p, rx=0, ry=0, rz=0){
  p = rotateX(p, rx);
  p = rotateY(p, ry);
  p = rotateZ(p, rz);
  return p;
}


function rotateX(p, a){
    var sa = Math.sin(a), ca = Math.cos(a);
    return [
        p[0],
        p[1] * ca - p[2] * sa,
        p[1] * sa + p[2] * ca
    ];
}

function rotateY(p, a){
    var sa = Math.sin(a), ca = Math.cos(a);
    return [
        p[2] * sa + p[0] * ca,
        p[1],
        p[2] * ca - p[0] * sa
    ];
}

function rotateZ(p, a){
    var sa = Math.sin(a), ca = Math.cos(a);
    return [
        p[0] * ca - p[1] * sa,
        p[0] * sa + p[1] * ca,
        p[2]
    ];
}


function dragEnd(){
  if (toggle_val != 'everything') {
      scatter = expectedScatter;
      xLine = expectedXLine;
      yLine = expectedYLine;
      startAngleX = 0;
      startAngleY = 0;
      startAngleZ = 0;
  } else {
    startAngleZ = gamma;
  }
}

init();

return {
  init: function(){init();},
  toggle: function(val){setToggle(val);}
};

})();