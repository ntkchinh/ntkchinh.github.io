space_plot_lib = function(svg, 
                          origin, 
                          scale, 
                          is_2d) {

let 
  mx = 0,
  my = 0,
  atan0 = 0,
  atan1 = 0;

let domain = [-9, 9];


function _create_axis(axis, name, ord, 
                      axis_len=13) {
  d3.range(0, axis_len, 1).forEach(
      function(d){
        let text = '';
        if (d % 5 == 0) {
          text = d;
        } else if (d == axis_len-1) {
          text = name
        }
        let p1 = [0, 0, 0],
            p2 = [0, 0, 0];
        p1[ord] = d;
        p2[ord] = d+1;
        let segment = [
          {x: p1[0], y:p1[1], z:p1[2]},
          {x: p2[0], y:p2[1], z:p2[2]}
        ];
        if (is_2d && ord == 2) {
          segment.opacity = 0.0;
          segment.text_opacity = 0.0;
        }
        // segment.key = 'axis' + name + d;
        axis.push(segment); 
        if (text == '') {
          return;
        }
        if (d == axis_len-1) {
          segment[1].text = text;
        }
        else {
          segment[0].text = text
        }
      }
  );
}


function init_axis(axis_len=13) {
  set_ranges(axis_len);
  let axis = [];
  _create_axis(axis, 'x', 0, axis_len);
  _create_axis(axis, 'y', 1, axis_len);
  _create_axis(axis, 'z', 2, axis_len);
  return axis;
}

function _create_axis_float(
    axis, name, ord, axis_len=2, unit=0.2) {
  d3.range(0, axis_len, unit).forEach(
      function(d){
        let text = '';
        if (d == axis_len-unit) {
          text = name
        }
        let p1 = [0, 0, 0],
            p2 = [0, 0, 0];
        p1[ord] = d;
        p2[ord] = d+unit;
        let segment = [
          {x: p1[0], y:p1[1], z:p1[2]},
          {x: p2[0], y:p2[1], z:p2[2]}
        ]
        if (is_2d && ord == 2) {
          segment.opacity = 0.0;
          segment.text_opacity = 0.0;
        }
        axis.push(segment); 
        if (text == '') {
          return;
        }
        if (d == axis_len-unit) {
          segment[1].text = text;
        }
        else {
          segment[0].text = text
        }
      }
  );
}

function init_float_axis(axis_len=2.0, unit=0.2) {
  set_ranges(axis_len)
  let axis = [];
  _create_axis_float(axis, 'x', 0, axis_len, unit);
  _create_axis_float(axis, 'y', 1, axis_len, unit);
  _create_axis_float(axis, 'z', 2, axis_len, unit);
  return axis;
}


function norm(v) {
  return Math.sqrt(dot_product(v, v));
}


function norm2(v) {
  return dot_product(v, v);
}

function normalize(v) {
  let v_norm = norm(v);
  let r = Object.assign({}, v);
  r.x = v.x/v_norm;
  r.y = v.y/v_norm;
  r.z = v.z/v_norm;
  return r;
}


function get_duration(tt) {
  function duration(d) {
    if (d.hasOwnProperty('tt')) {
      return d.tt;
    }
    return tt;
  }
  return duration;
}


let  color  = d3.scaleOrdinal()
             .domain(d3.range(0, 20))
             .range(d3.schemeCategory20);


let z_to_size_scale,
    z_to_txt_size_scale,
    z_to_txt_opacity_scale,
    z_to_opacity_scale,
    z_to_stroke_width_scale;



function linear_scale_positive_range(domain, range) {
  let f = function(z) {
    let [db, de] = domain;
    let [rb, re] = range;
    t = (z - db) / (de - db);
    return Math.max(0.0, t * (re - rb) + rb);
  }
  return f;
}




function set_ranges(axis_len) {
  domain = [-axis_len, axis_len];
  z_to_size_scale = linear_scale_positive_range(domain, [4, 5.5]);
  z_to_txt_size_scale = linear_scale_positive_range(domain, [9, 14]);
  z_to_txt_opacity_scale = linear_scale_positive_range(domain, [0.2, 1.0]);
  z_to_opacity_scale = linear_scale_positive_range(domain, [0.5, 1.0]);
  z_to_stroke_width_scale = linear_scale_positive_range(domain, [0.5, 3.0]);
}


function get_size(d) {
  if (d.hasOwnProperty('r')) {
    return d.r;
  }
  if (is_2d) {
    return 4.5;
  }
  if (d.centroid.z != undefined) {
    return z_to_size_scale(d.centroid.z);
  }
  return 4.5;
}


function get_txt_size(d) {
  if (d.hasOwnProperty('font_size')) {
    return d.font_size + 'px';
  }
  if (is_2d) {
    return '14px';
  }
  if (d.centroid.z != undefined) {
    return z_to_txt_size_scale(d.centroid.z) + 'px';
  }
  return '14px';
}


function get_font_family(d) {
  if (d.hasOwnProperty('font_family')) {
    return d.font_family;
  }
}


function get_txt_opacity(d) {
  if (d.hasOwnProperty('text_opacity')){
    return d.text_opacity;
  }
  if (is_2d) {
    return 1.0;
  }
  if (d.centroid.z != undefined) {
    return z_to_txt_opacity_scale(d.centroid.z);
  }
  return 1.0;
}

function get_opacity(d) {
  if (d.hasOwnProperty('opacity')) {
    return d.opacity;
  }
  if (is_2d) {
    return 1.0;
  }
  if (d.centroid.z != undefined) {
    return z_to_opacity_scale(d.centroid.z)
  }
  return 1.0;
}


function get_stroke_width(d){
  if (d.hasOwnProperty('stroke_width')) {
    return d.stroke_width;
  }
  if (is_2d) {
    return 1.5;
  }
  if (d.centroid.z != undefined) {
    return z_to_stroke_width_scale(d.centroid.z)
  }
  return 1.5;
}

function get_width(d) {
  if (d.hasOwnProperty('width')) {
    return d.width;
  }
  return;
}


function get_height(d) {
  if (d.hasOwnProperty('height')) {
    return d.height;
  }
  return;
}


function project(d, with_origin){
  if (with_origin == null) {
    with_origin = origin;
  }
  return {
      x: with_origin[0] + scale * d.x,
      y: with_origin[1] + scale * d.y
  };
}

function get_color(default_color='black'){
  function get_color_fn(d) {
    if (!d.hasOwnProperty('color')) {
      return default_color;
    }
    if (typeof d.color == 'number') {
      return color(d.color);
    }
    return d.color;
  }
  return get_color_fn;
}

function get_txt_color(d) {
  if (!d.hasOwnProperty('text_color')) {
    return 'black';
  }
  if (typeof d.text_color == 'number') {
    return color(d.text_color);
  }
  return d.text_color;
}


function get_line_color(d) {
  if (!d[1].hasOwnProperty('color')) {
    return 'grey';
  }
  if (typeof d[1].color == 'number') {
    return color(d[1].color);
  }
  return d[1].color;
}


function add_keys(name, data) {
  data.forEach(function(d, j){
    if (!d.hasOwnProperty('key')){
      d.key = name + j.toString();
    }
  })
}


function sort_centroid_z(a, b){
  let 
    _a = a.hasOwnProperty('centroid_z') ? a.centroid_z : a.centroid.z,
    _b = b.hasOwnProperty('centroid_z') ? b.centroid_z : b.centroid.z;
  return _a < _b ? -1 : _a > _b ? 1 : _a >= _b ? 0 : NaN;
}


function plot_lines(data,
                    tt,
                    name='line',
                    drag_line_fn=null,
                    drag_start_fn=null,
                    drag_end_fn=null,
                    with_origin=null){
  add_keys(name, data);

  let lines = svg
      .selectAll('line.' + name)
      .data(data, function(d){ return d.key; })
      .each(function(d){})
      .call(d3.drag()
              .on('drag', drag_line_fn)
              .on('start', drag_start_fn)
              .on('end', drag_end_fn));
  lines
      .enter()
      .append('line')
      .attr('class', '_3d ' + name)
      .merge(lines)
      .transition().duration(get_duration(tt))
      .each(function(d){
        d.centroid = {
          x: (d[1].x+d[0].x)/2.,
          y: (d[1].y+d[0].y)/2.,
          z: (d[1].z+d[0].z)/2.
        };
        if (!d.hasOwnProperty('color')) {
          if (d[1].hasOwnProperty('color')) {
            d.color = d[1].color;
          } else if (d[0].hasOwnProperty('color')) {
            d.color = d[0].color;
          }
        }
      })
      .style('stroke-dasharray', function(d) {
        if (d.hasOwnProperty('dash')) {
          return ('3, 3');
        }
      })
      .attr('x1', function(d){ return project(d[0], with_origin).x; })
      .attr('y1', function(d){ return project(d[0], with_origin).y; })
      .attr('x2', function(d){ return project(d[1], with_origin).x; })
      .attr('y2', function(d){ return project(d[1], with_origin).y; })
      .attr('fill', get_color('grey'))
      .attr('stroke', get_color('grey'))
      .attr('stroke-width', get_stroke_width)
      .attr('opacity', get_opacity);
  lines.exit().remove();

  let text = svg
      .selectAll('text.' + name)
      .data(data, function(d){ return d.key; });

  text
      .enter()
      .append('text')
      .attr('class', '_3d ' + name)
      .attr('dx', '.1em')
      .merge(text)
      .each(function(d){
        d.centroid = {
          x: (d[1].x+d[0].x)/2.,
          y: (d[1].y+d[0].y)/2.,
          z: (d[1].z+d[0].z)/2.
        };
        if (d.hasOwnProperty('text')) {
          d.text_position = project(d.centroid, with_origin);
        } else if (d[0].hasOwnProperty('text')) {
          d.text_position = project(d[0], with_origin);
        }
        else {
          d.text_position = project(d[1], with_origin);
        }
      })
      .transition().duration(get_duration(tt))
      .style('font-size', get_txt_size)
      .style('fill', get_txt_color)
      .attr('font-family', get_font_family)
      .attr('x', function(d){ return d.text_position.x+3; })
      .attr('y', function(d){ return d.text_position.y-3; })
      .text(function(d){
        if (d.hasOwnProperty('text')) {
          return d.text;
        } else if (d[0].hasOwnProperty('text')) {
          return d[0].text;
        } else if (d[1].hasOwnProperty('text')){
          return d[1].text;
        }
      })
      .attr('opacity', get_txt_opacity);
  text.exit().remove();
}


function plot_points(data, 
                     tt,
                     drag_point_fn=null,
                     drag_start_fn=null,
                     drag_end_fn=null,
                     name='point',
                     with_origin=null){
  add_keys(name, data);

  let points = svg.selectAll('circle.' + name)
                  .data(data, function(d){ return d.key; })
                  .each(function(d){})
                  .call(d3.drag()
                          .on('drag', drag_point_fn)
                          .on('start', drag_start_fn)
                          .on('end', drag_end_fn));

  points
    .enter()
    .append('circle')
    .attr('class', '_3d ' + name)
    .merge(points)
    .transition().duration(get_duration(tt))
    .each(function(d){
        d.centroid = {x: d.x, 
                      y: d.y, 
                      z: d.z};
    })
    .attr('cx', function(d){return project(d, with_origin).x})
    .attr('cy', function(d){return project(d, with_origin).y})
    .attr('r', get_size)
    .attr('fill', get_color())
    .attr('opacity', get_opacity);
  points.exit().remove();

  let text = svg
      .selectAll('text.' + name)
      .data(data, function(d){ return d.key; });
  text
      .enter()
      .append('text')
      .attr('class', '_3d ' + name)
      .attr('dx', '.4em')
      .merge(text)
      .transition().duration(get_duration(tt))
      .each(function(d){
          d.centroid = {x: d.x, 
                        y: d.y, 
                        z: d.z};
      })
      .style('font-size', get_txt_size)
      .style('fill', get_txt_color)
      .attr('font-family', get_font_family)
      .attr('x', function(d){ return project(d, with_origin).x; })
      .attr('y', function(d){ return project(d, with_origin).y+3; })
      .attr('opacity', get_txt_opacity)
      .text(function(d){ return d.text; });
  text.exit().remove();
}


function plot_texts(data, tt, name='text', with_origin=null){
  add_keys(name, data);

  let text = svg
      .selectAll('text.'+name+'Text')
      .data(data, function(d){ return d.key; });
  text
      .enter()
      .append('text')
      .attr('class', '_3d '+name+'Text')
      .attr('dx', '.4em')
      .merge(text)
      .each(function(d){
          d.centroid = {x: d.x, 
                        y: d.y,
                        z: d.z};
      })
      .transition().duration(get_duration(tt))
      .style('font-size', get_txt_size)
      .style('fill', get_txt_color)
      .attr('font-family', get_font_family)
      .attr('x', function(d){ return project(d, with_origin).x; })
      .attr('y', function(d){ return project(d, with_origin).y; })
      .attr('opacity', get_txt_opacity)
      .text(function(d){ return d.text; });
  text.exit().remove();
}


function plot_images(data, tt, name='image', with_origin=null){
  add_keys(name, data);

  let image = svg
      .selectAll('image.'+name+'Image')
      .data(data, function(d){ return d.key; });
  image
      .enter()
      .append('image')
      .attr('class', '_3d '+name+'Image')
      .merge(image)
      .each(function(d){
          d.centroid = {x: d.x, 
                        y: d.y,
                        z: d.z};
      })
      .transition().duration(get_duration(tt))
      .style('font-size', get_txt_size)
      .attr('x', function(d){ return project(d, with_origin).x; })
      .attr('y', function(d){ return project(d, with_origin).y; })
      .attr('opacity', get_opacity)
      .attr('xlink:href', function(d) {return d.path;})
      .attr('width', get_width)
      .attr('height', get_height)
  image.exit().remove();
}


function sort(){
  svg.selectAll('._3d').sort(sort_centroid_z);
}


function dot_product(u, v){
  let uTv = u.x*v.x + u.y*v.y;
  if (!is_2d) {
    uTv += u.z * v.z;
  } 
  return uTv;
}


function dot_basis(d, basis){
  return {
      x: dot_product(d, basis.ex),
      y: dot_product(d, basis.ey),
      z: dot_product(d, basis.ez),
  };
}


function rotate_lines(l, rx=0, ry=0, rz=0){
  let result = [];
  l.forEach(function(d){
    let s = Object.assign({}, d);
    s[0] = rotate_point(d[0], rx, ry, rz);
    s[1] = rotate_point(d[1], rx, ry, rz);
    result.push(s);
  })
  return result;
}


function rotate_points(g, rx=0, ry=0, rz=0){
  let result = [];
  g.forEach(function(d){
    result.push(rotate_point(d, rx, ry, rz));
  })
  return result;
}


function rotate_point(p, rx=0, ry=0, rz=0){
  p = rotate_x(p, rx);
  p = rotate_y(p, ry);
  p = rotate_z(p, rz);
  return p;
}


function rotate_x(p, a){
    let sa = Math.sin(a), ca = Math.cos(a);
    let r = Object.assign({}, p)
    r.x = p.x;
    r.y = p.y * ca - p.z * sa;
    r.z = p.y * sa + p.z * ca;
    return r;
}


function rotate_y(p, a){
    let sa = Math.sin(a), ca = Math.cos(a);
    let r = Object.assign({}, p)
    r.x = p.z * sa + p.x * ca;
    r.y = p.y;
    r.z = p.z * ca - p.x * sa;
    return r;
}


function rotate_z(p, a){
    let sa = Math.sin(a), ca = Math.cos(a);
    let r = Object.assign({}, p)
    r.x = p.x * ca - p.y * sa;
    r.y = p.x * sa + p.y * ca;
    r.z = p.z;
    return r;
}


function drag_start(){
  mx = d3.event.x;
  my = d3.event.y;
}


function get_drag_angles(){
  dx = d3.event.x - mx;
  dy = d3.event.y - my;

  alpha  = -dy * Math.PI / 230;
  beta   = dx * Math.PI / 230;
  return [alpha, beta];
}


function getMouse(){
  let [x, y] = d3.mouse(svg.node());
  return {x: x, y: y, z: 0.};
}


function getMouseAtan2(with_origin){
  if (with_origin == null) {
    with_origin = origin;
  }
  let m = getMouse();
  return Math.atan2(m.y - with_origin[1],
                    m.x - with_origin[0]);
}


function drag_start2d(with_origin=null){
  atan0 = getMouseAtan2(with_origin);
}


function get_drag_angle_2d(with_origin=null){
  return getMouseAtan2(with_origin) - atan0;
}


function mouse_to_point_position(with_origin=null){
  if (with_origin == null) {
    with_origin = origin;
  }
  m = getMouse();
  [x, y] = [m.x - with_origin[0], m.y - with_origin[1]];
  [x, y] = [x/scale, y/scale];
  return {x: x, y: y, z:0.};
}


function update_point_position_from_mouse(d, with_origin=null){
  mouse_pos = mouse_to_point_position(with_origin);
  let r = Object.assign({}, d)
  r.x = mouse_pos.x;
  r.y = mouse_pos.y;
  r.z = 0.
  return r
}


function distance(u, v) {
  let d = {
          x: to.x - from.x,
          y: to.y - from.y,
          z: to.z - from.z,
      };
  return Math.sqrt(dot_product(d, d));
}

function create_dash_segments(from, to, unit=0.07) {
  let r = [];
      d = {
          x: to.x - from.x,
          y: to.y - from.y,
          z: to.z - from.z,
      };

  let norm = Math.sqrt(dot_product(d, d));
  let n = Math.floor(norm/unit);

  let dx = d.x*unit/norm,
      dy = d.y*unit/norm,
      dz = d.z*unit/norm;

  for (let i = 0; i < n; i++) {
    if (i % 2 == 0) {
      continue;
    }
    let r1 = Object.assign({}, from);
    let r2 = Object.assign({}, to);
    r1.x = from.x + i * dx;
    r1.y = from.y + i * dy;
    r1.z = from.z + i * dz;
    r2.x = r1.x + dx;
    r2.y = r1.y + dy;
    r2.z = r1.z + dz;
    r.push([r1, r2]);
  };
  return r;
}


function create_segments(d, k=10) {
  let r = [];
  for (let i = 0; i < k; i++) {
    let j = i + 1;
    let r1 = Object.assign({}, d);
    let r2 = Object.assign({}, d);
    r1.x = i * d.x / k
    r1.y = i * d.y / k
    r1.z = i * d.z / k
    r2.x = j * d.x / k
    r2.y = j * d.y / k
    r2.z = j * d.z / k
    r.push([r1, r2]);
  };
  return r;
}


function text_table_to_list(texts, 
                            start_coord_x, start_coord_y,
                            w_unit, h_unit,
                            dws_array, dhs_array){
  let nrow = texts.length,
      ncol = dws_array.length + 1,
      col_coords = [start_coord_x],
      row_coords = [start_coord_y];

  for (let j = 1; j < ncol; j++) {
    col_coords.push(col_coords[j-1] +
                    w_unit * dws_array[j-1]);
  };

  for (let i = 1; i < nrow; i++) {
      row_coords.push(row_coords[i-1] +
                      h_unit * dhs_array[i-1]);
  }

  let list_of_texts = [];

  for (let i = 0; i < nrow; i++) {
    for (let j = 0; j < ncol; j++) {
      text_to_plot = texts[i][j];
      text_to_plot.x = col_coords[j];
      text_to_plot.y = row_coords[i];
      list_of_texts.push(text_to_plot);
    };
  }

  return list_of_texts;
}



return {
  color: color,
  normalize: normalize,
  norm: norm,
  norm2: norm2,
  dot_product: dot_product,
  plot_points: plot_points,
  plot_lines: plot_lines,
  plot_texts: plot_texts,
  plot_images: plot_images,
  dot_basis: dot_basis,
  rotate_point: rotate_point,
  rotate_points: rotate_points,
  rotate_lines: rotate_lines,
  init_axis: init_axis,
  init_float_axis: init_float_axis,
  drag_start: drag_start,
  get_drag_angles: get_drag_angles,
  drag_start2d: drag_start2d,
  get_drag_angle_2d: get_drag_angle_2d,
  get_mouse_position: getMouse,
  update_point_position_from_mouse: update_point_position_from_mouse,
  mouse_to_point_position: mouse_to_point_position,
  create_segments: create_segments,
  create_dash_segments: create_dash_segments,
  distance: distance,
  sort: sort,
  text_table_to_list: text_table_to_list,
}

};