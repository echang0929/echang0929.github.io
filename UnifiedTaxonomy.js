define(["https://ajax.googleapis.com/ajax/libs/d3js/5.7.0/d3.min.js"], function(d3) {
  "use strict";

  function UTRadialTree() {};

  UTRadialTree.prototype.draw = function(oControlHost) {
    var width = 1640;
    var height = 1640;

    var svg = d3.select(oControlHost.container)
      .append("svg")
      .attr("width", width)
      .attr("height", height);
    var g = svg.append("g")
      .attr("transform", "translate(" + (width / 2 + 0) + "," + (height / 2 + 0) + ")");

    var tree = d3.tree()
      .size([2 * Math.PI, 800])
      .separation((a, b) => (a.parent == b.parent ? 1 : 2) / a.depth);

    var nestedData = d3.nest()
      .key(d => 'Unified Taxonomy')
      .key(d => d.L10)
      .key(d => d.L15)
      .key(d => d.L17)
      .key(d => d.L20)
      .entries(this.m_aData.map(d => ({
        L10: d["L10 Description"],
        L15: d["L15 Description"],
        L17: d["L17 Description"],
        L20: d["L20 Description"],
        key: d["L30 Description"]
      })));

    var root = d3.hierarchy(nestedData[0], d => d.values)
      .sort((a, b) => a.data.key.localeCompare(b.data.key));
    tree(root);

    var link = g.selectAll(".link")
      .data(root.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", d3.linkRadial()
        .angle(d => d.x)
        .radius(d => d.y));

    var node = g.selectAll(".node")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("class", d => "node" + (d.children ? " node--internal" : " node--leaf"))
      .attr("transform", d => "translate(" + radialPoint(d.x, d.y) + ")");

    node.append("circle")
      .attr("r", 2.5);

    node.append("text")
      .attr("dy", "0.31em")
      .attr("x", d => d.x < Math.PI === !d.children ? 6 : -6)
      .attr("text-anchor", d => d.x < Math.PI === !d.children ? "start" : "end")
      .attr("transform", d => "rotate(" + (d.x < Math.PI ? d.x - Math.PI / 2 : d.x + Math.PI / 2) * 180 / Math.PI + ")")
      .text(d => (d.height == 0 ? '' : d.data.key));

    function radialPoint(x, y) {
      return [(y = +y) * Math.cos(x -= Math.PI / 2), y * Math.sin(x)];

    }

  };

  UTRadialTree.prototype.setData = function(oControlHost, oDataStore) {
    //this.m_oDataStore = oDataStore;
    this.m_aData = [];

    var iRowCount = oDataStore.rowCount;
    var jColCount = oDataStore.columnCount;
    var colNames = oDataStore.columnNames;
    for (var iRow = 0; iRow < iRowCount; iRow++) {
      let newObj = {};
      for (var jCol = 0; jCol < jColCount; jCol++)
        newObj[colNames[jCol]] = oDataStore.getCellValue(iRow, jCol);
      this.m_aData.push(newObj);
    }

  };

  return UTRadialTree;

});
