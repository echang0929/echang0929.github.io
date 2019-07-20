define(["https://ajax.googleapis.com/ajax/libs/d3js/5.7.0/d3.min.js"], function(d3) {
  "use strict";

  function KingdomSunburst() {}

  KingdomSunburst.prototype.draw = function(oControlHost) {

    var o = oControlHost.configuration,
      width = (o && o.Width) ? o.Width : 400,
      height = (o && o.Height) ? o.Height : 400,
      radius = (Math.min(width, height) / 2) - 10;

    var formatNumber = d3.format(",d"),
      x = d3.scaleLinear().range([0, 2 * Math.PI]),
      y = d3.scaleSqrt().range([0, radius]),
      color = d3.scaleOrdinal(d3.schemePaired);

    var partition = d3.partition();

    var arc = d3.arc()
      .startAngle(d => Math.max(0, Math.min(2 * Math.PI, x(d.x0))))
      .endAngle(d => Math.max(0, Math.min(2 * Math.PI, x(d.x1))))
      .innerRadius(d => Math.max(0, y(d.y0)))
      .outerRadius(d => Math.max(0, y(d.y1)));

    var svg = d3.select(oControlHost.container)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")");

    var grpFun = d3.nest()
      .key(d => 'All');
    for (var k = 0; k < this.m_colCount - 2; k++) {
      switch (k) {
        case 0:
          grpFun = grpFun.key(d => d.L0);
          break;
        case 1:
          grpFun = grpFun.key(d => d.L1);
          break;
        case 2:
          grpFun = grpFun.key(d => d.L2);
          break;
        case 3:
          grpFun = grpFun.key(d => d.L3);
          break;
        case 4:
          grpFun = grpFun.key(d => d.L4);
          break;
        case 5:
          grpFun = grpFun.key(d => d.L5);
          break;
        case 6:
          grpFun = grpFun.key(d => d.L6);
          break;
        case 7:
          grpFun = grpFun.key(d => d.L7);
          break;
        case 8:
          grpFun = grpFun.key(d => d.L8);
          break;
        case 9:
          grpFun = grpFun.key(d => d.L9);
          break;
      }
    }
    var nestedData = grpFun.entries(this.m_aData);

    var root = d3.hierarchy(nestedData[0], d => d.values)
      .sort((a, b) => a.data.key.localeCompare(b.data.key))
      .sum(d => d.count);

    svg.selectAll("path")
      .data(partition(root)
        .descendants())
      .enter()
      .append("path")
      .attr("d", arc)
      .style("fill", d => color((d.children ? d : d.parent)
        .data.key))
      .on("click", click)
      .append("title")
      .text(d => d.data.key + "\n" + formatNumber(d.value));

    function click(d) {
      svg.transition()
        .duration(750)
        .tween("scale", () => {
          var xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
            yd = d3.interpolate(y.domain(), [d.y0, 1]),
            yr = d3.interpolate(y.range(), [d.y0 ? 20 : 0, radius]);
          return function(t) {
            x.domain(xd(t));
            y.domain(yd(t))
              .range(yr(t));
          };
        })
        .selectAll("path")
        .attrTween("d", d => () => arc(d));
    }

  }

  KingdomSunburst.prototype.setData = function(oControlHost, oDataStore) {
    //this.m_oDataStore = oDataStore;
    this.m_aData = [];

    var iRowCount = oDataStore.rowCount;
    var jColCount = oDataStore.columnCount;
    var colNames = oDataStore.columnNames;

    for (var iRow = 0; iRow < iRowCount; iRow++) {
      let newObj = {};
      for (var jCol = 0; jCol < jColCount; jCol++) {
        if (jCol == jColCount - 1) {
          newObj.count = oDataStore.getCellValue(iRow, jCol);
        } else if (jCol == jColCount - 2) {
          newObj.key = oDataStore.getCellValue(iRow, jCol);
        } else {
          newObj['L' + jCol] = oDataStore.getCellValue(iRow, jCol);
        }
      }
      this.m_aData.push(newObj);
    }
    this.m_colNames = colNames;
    this.m_colCount = jColCount;
  };

  return KingdomSunburst;
});
