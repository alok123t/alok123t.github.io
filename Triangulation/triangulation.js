
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

function triangulate() {
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
