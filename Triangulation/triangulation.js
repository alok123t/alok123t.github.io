
var intViewportWidth = window.innerWidth;
var intViewportHeight = window.innerHeight;
var margin = {top: 20, right: 50, bottom: 30, left: 60};
var width = intViewportWidth - margin.left - margin.right;
var height = intViewportHeight - margin.top - margin.bottom;

d3.select("svg")
  .append("rect")
  .attr("width", width-50)
  .attr("height", height);

var svg_polygon = d3.select("#polygon")
  .attr("width", width + margin.right)
  .attr("height", height + margin.bottom);

var svg_line = d3.line();

var g_edges = svg_polygon.append("g");
g_edges.append("path")
  .attr("id", "path_poly");
var tr_edges = svg_polygon.append("g");
var g_nodes = svg_polygon.append("g");

var thresholdSamePoint = 2000;

var points = [];
var done = false;

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

function dist(p1, p2) {
  return distance(points[p1], points[p2]);
}

function cost(p1, p2, p3) {
  return Math.max(dist(p1, p2), dist(p2, p3), dist(p3, p1));
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
  var n = points.length-1;
  var dp_table = new Array(n);
  var pos_table = new Array(n);
  for (var i = 0; i < n; i++) {
    dp_table[i] = new Array(n);
    pos_table[i] = new Array(n);
  }

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
        var cur_cost = dp_table[i][k] + dp_table[k][j] + cost(i, k, j);
        if (cur_cost < dp_table[i][j]) {
          dp_table[i][j] = cur_cost;
          pos_table[i][j] = k;
        }
      }
    }
  }

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
