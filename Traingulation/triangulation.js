
var intViewportWidth = window.innerWidth;
var intViewportHeight = window.innerHeight;
var margin = {top: 20, right: 50, bottom: 30, left: 60};
var width = intViewportWidth - margin.left - margin.right;
var height = intViewportHeight - margin.top - margin.bottom;
// console.log("width", width, "height", height);

var svg_polygon = d3.select("#polygon")
  .attr("width", width + margin.right)
  .attr("height", height + margin.bottom);

var svg_line = d3.line();

var g_nodes = svg_polygon.append("g");
var g_edges = svg_polygon.append("g");
g_edges.append("path")
  .attr("id", "path_poly");
var tr_edges = svg_polygon.append("g");

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

function tooClose(p) {
  var i = points.length == 1 ? 0 : 1;
  for (; i < points.length; i++) {
    if (distance(points[i], p) < thresholdSamePoint) return true;
  }
  return false;
}

function closePolygon(pEnd) {
  var pStart = points[0];
  var d = distance(pStart, pEnd);
  return d < thresholdSamePoint;
}

function addPoint(p) {
  points.push(p);

  g_edges.select("#path_poly")
    .datum(points)
    .attr("d", svg_line);

  var curText = done ? 1 : points.length;
  var g_n = g_nodes.append("g")
    .attr("class", "vertex")
    .translate(p);
  g_n.append("circle")
    .attr("r", 20);
  g_n.append("text").text(curText.toString())
    .attr("dx", "-5px")
    .attr("dy", "5px");
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

svg_polygon.on("click", function() {
  if (done) return;
  var newPoint = adjust(d3.mouse(this));
  if (tooClose(newPoint)) return;
  if (points.length >= 3) {
    if (closePolygon(newPoint)) {
      done = true;
      newPoint = points[0];
    }
  }
  addPoint(newPoint);
  if (done) triangulate();
});
