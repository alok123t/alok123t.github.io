
var intViewportWidth = window.innerWidth;
var intViewportHeight = window.innerHeight;
var margin = {top: 20, right: 10, bottom: 30, left: 10};
var width = (intViewportWidth - margin.left - margin.right)*0.75;
var height = (intViewportHeight - margin.top - margin.bottom)*0.90;
// var width = intViewportWidth * 0.75;
// d3.select("svg")
//   .append("rect");
  // .attr("width", width-50)
  // .attr("height", height);

var svg_polygon = d3.select("#polygon")
  .attr("width", width)
  .attr("height", height);

var svg_line = d3.line();

var g_edges = svg_polygon.append("g");
g_edges.append("path")
  .attr("id", "path_poly");
var tr_edges = svg_polygon.append("g");
var g_nodes = svg_polygon.append("g");

var thresholdSamePoint = 2000;

var points = [];
var done = false;

var tr_type = 1;

d3.selection.prototype.translate = function(a) {
  return this.attr("transform", "translate(" + a + ")");
};

function adjust(p) {
  return [Math.round(p[0]), Math.round(p[1])];
}

function distance(p0, p1) {
  var dx = p1[0] - p0[0];
  var dy = p1[1] - p0[1];
  return (dx*dx) + (dy*dy);
}

function closePolygon(pEnd) {
  var pStart = points[0];
  var d = distance(pStart, pEnd);
  return d < thresholdSamePoint;
}

function updatePoint(p) {
  var cur = g_nodes.select("#latest");
  if (cur.size()) {
    cur.translate(p).datum(p);
  }
  points[points.length-1] = p;
  return cur;
}

function addPoint(p) {
  updatePoint(p).attr("id", null);

  var l = d3.select("#last");
  if (done) {
    l.text("1");
  }
  l.attr("id", null);
}

function displayPoint(p) {
  var curPoint = g_nodes.select("#latest");
  if (curPoint.size()) {
    updatePoint(p);
  }
  else {
    points.push(p);
    var curText = done ? 1 : points.length;
    var g_n = g_nodes.append("g")
      .attr("class", "vertex")
      .attr("id", "latest")
      .translate(p);
      g_n.append("circle")
        .attr("r", 20);
      g_n.append("text").text(curText.toString())
        .attr("dx", "-5px")
        .attr("dy", "5px")
        .attr("id", "last");
  }
}

function displayLine() {
  g_edges.select("#path_poly")
    .datum(points)
    .attr("d", svg_line);
}

function intersects(a,b,c,d,p,q,r,s) {
  var det, gamma, lambda;
  det = (c - a) * (s - q) - (r - p) * (d - b);
  if (det === 0) {
    return false;
  } else {
    lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
    gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
    return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
  }
};

function checkLineIntersection(p1, p2, p3, p4) {
  if (intersects(p1[0], p1[1], p2[0], p2[1], p3[0], p3[1], p4[0], p4[1]))
    return true;
  else 
    return false;
}

function checkIntersection(p1, p2) {
  var n = points.length-1;
  for (var i = p1+1; i <= p2-2; i++) {
    if (checkLineIntersection(points[p1], points[p2], points[i], points[i+1])) {
      return false;
    }
  }
  for (var i = p2+1; i <= n-1; i++) {
    if (checkLineIntersection(points[p1], points[p2], points[i], points[i+1])) {
      return false;
    }
  }
  for (var i = 0; i <= p1-2; i++) {
    if (checkLineIntersection(points[p1], points[p2], points[i], points[i+1])) {
      return false;
    }
  }
  return true;
}

function dist(p1, p2) {
  return distance(points[p1], points[p2]);
}

function cost(p1, p2, p3) {
  if (tr_type == 1) {
    return dist(p1, p2) + dist(p2, p3) + dist(p3, p1);
  }
  else if (tr_type == 2) {
    return Math.max(dist(p1, p2), dist(p2, p3), dist(p3, p1));
  }
}

function triangulate() {
  /*
  for (var i = 0; i < points.length; i+=2) {
    var tr_nodes = [];
    if (i+2 < points.length) {
      tr_nodes.push(points[i]);
      tr_nodes.push(points[i+2]);
      tr_edges.append("path")
        .datum(tr_nodes)
        .attr("id", "path_tr")
        .attr("d", svg_line);
    }
  }
  */
  console.log(tr_type);

  var n = points.length-1;
  var dp_table = new Array(n);
  var pos_table = new Array(n);
  var visible_table = new Array(n);
  for (var i = 0; i < n; i++) {
    dp_table[i] = new Array(n);
    pos_table[i] = new Array(n);
    visible_table[i] = new Array(n);
  }

  for (var i = 0; i < n; i++) {
    for (var j = 0; j < n; j++) {
      visible_table[i][j] = false;
      if (i == j) continue;
      var prv = (i-1+n)%n;
      var nxt = (i+1)%n;
      if (j == prv || j == nxt) continue;
      visible_table[i][j] = checkIntersection(i, j);
    }
  }

  // for (var i = 0; i < n; i++) {
  //   console.log(visible_table[i]);
  // }

  for (var gap = 0; gap < n; gap++) {
    for (var i = 0, j = gap; j < n; i++, j++) {
      if (j < i+2) {
        dp_table[i][j] = 0.0;
        pos_table[i][j] = -1;
        continue;
      }
      dp_table[i][j] = Infinity;
      pos_table[i][j] = -1;
      for (var k = i+1; k < j; k++) {
        // console.log([i,k,j,cost(i,k,j)]);
        var cur_cost = 0;
        if (tr_type == 1) {
          cur_cost = dp_table[i][k] + dp_table[k][j] + cost(i, k, j);
        }
        else if (tr_type == 2) {
          cur_cost = Math.max(dp_table[i][k], dp_table[k][j], cost(i, k, j));
        }
        // console.log(cur_cost);
        if (cur_cost < dp_table[i][j]) {
          dp_table[i][j] = cur_cost;
          pos_table[i][j] = k;
        }
      }
    }
  }
  console.log(dp_table[0][n-1]);

  // for (var i = 0; i < n; i++) {
  //   console.log(dp_table[i]);
  // }
  var queue = [];
  queue.push([0, n-1]);
  while (queue.length != 0) {
    var top = queue.shift();
    a = top[0];
    b = top[1];
    c = pos_table[a][b];
    console.log(a+1, c+1, b+1)

    if (a != c-1) {
      var tr_nodes = [];
      tr_nodes.push(points[a]);tr_nodes.push(points[c]);
      tr_edges.append("path")
        .datum(tr_nodes)
        .attr("id", "path_tr")
        .attr("d", svg_line);
    }
    if (c != b-1) {
      var tr_nodes = [];
      tr_nodes.push(points[c]);tr_nodes.push(points[b]);
      tr_edges.append("path")
        .datum(tr_nodes)
        .attr("id", "path_tr")
        .attr("d", svg_line);
    }
    if (a != c-1) queue.push([a, c]);
    if (c != b-1) queue.push([c, b]);
  }
}

function type1() {
  tr_type = 1;
  if (done) triangulate();
}
function type2() {
  tr_type = 2;
  if (done) triangulate();
}
// function refresh() {
//   location.reload();
//   // svg_polygon.selectAll("*").remove();
//   // svg_polygon = d3.select("#polygon")
//     // .attr("width", width)
//     // .attr("height", height);
//   // d3.select("g").remove();
//   // svg_polygon.selectAll("*").remove();
// }

var onClick = function() {
  if (done) return;
  var newPoint = adjust(d3.mouse(this));
  if (points.length >= 3) {
    if (closePolygon(newPoint)) {
      done = true;
      newPoint = points[0];
    }
  }
  addPoint(newPoint);
  displayLine();
  if (done) triangulate();
}

var mouseMove = function() {
  if (done) return;
  var newPoint = adjust(d3.mouse(this));
  displayPoint(newPoint);
  displayLine();
}

svg_polygon.on("click", onClick);
svg_polygon.on("mousemove", mouseMove);
