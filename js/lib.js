function D3xter(config) {
  var self = this;
  var config = config || {};

  var height = config.height || 500,
      width = config.width || 500;

  var margin = {
    top: height * 0.05,
    bottom: height * 0.2,
    left: width * 0.2,
    right: width * 0.05
  };

  function buildCanvas() {
    self.canvas = d3.select(config.selector || 'body')
                  .append('svg')
                  .attr('height', height)
                  .attr('width', width);
  };

  function buildMapping(datasets) {
    buildXMap(datasets);
    buildYMap(datasets);
  };

  function buildXMap(datasets) {
    var values = datasets.map(function(d) { return d.x }).reduce(function(a, b) { return a.concat(b) });
    var ordinalValues = (typeof values[0] == 'string');

    if (ordinalValues) {
      var xDomain = getUniqueValues(values);
      self.xMap = d3.scale.ordinal()
    }
    else {
      var xDomain = getBoundaries(values);
      self.xMap = d3.scale.linear()
    };

    self.xMap.domain(xDomain)
        .range([
          margin.left,
          width - margin.right
        ]);

  };

  function buildYMap(datasets) {
    var values = datasets.map(function(d) { return d.y }).reduce(function(a, b) { return a.concat(b) }, []);

    var yDomain = getBoundaries(values);
    self.yMap = d3.scale.linear()
               .domain(yDomain)
               .range([
                  height - margin.bottom,
                  margin.top
                ]);
  };

  function buildZMap(datasets) {
    var basePointSize = 3;
    var values = datasets.map(function(d) { return d.z })
                .reduce(function(a, b) { return a.concat(b) }, [])
                .filter(function(a) { return (typeof a !== 'undefined') });

    if (values.length == 0) {
      self.zMap = function() {
        return basePointSize;
      };
    }
    else {
      var zDomain = getBoundaries(values);
      self.zMap = function(value) {
        sizeBonus = 9 * (value - zDomain[0]) / (zDomain[1] - zDomain[0]);
        return basePointSize * (1 + sizeBonus);
      };
    };
  };

  function buildAxes() {
    var xAxis = d3.svg.axis()
                .scale(self.xMap);

    var yAxis = d3.svg.axis()
                .scale(self.yMap)
                .orient('left');

    self.canvas.append('g')
          .attr('transform','translate(0,' + (height - margin.bottom) + ')')
          .call(xAxis);

    self.canvas.append('g')
          .attr('transform','translate(' + margin.left + ', 0)')
          .call(yAxis);
  };

  function buildAxisLabels() {
    var xLabel = self.canvas.append('text')
                .attr('x', width / 2)
                .attr('y', height + margin.bottom / 2)
                .text(config.xLab)
                .attr('text-anchor','middle');

    var yLabel = self.canvas.append('text')
                .attr('x', height / 2)
                .attr('y', margin.left / 2)
                .attr('transform','rotate(90)')
                .text(config.yLab)
                .attr('text-anchor','middle');
  };

  function build(datasets) {
    buildCanvas();
    buildXMap(datasets);
    buildYMap(datasets);
    buildZMap(datasets);
    buildAxes();
    buildAxisLabels();
  };

  function getBoundaries(data) {
    var min = Math.min.apply(null, data);
    var max = Math.max.apply(null, data);
    return [min, max];
  };

  function getUniqueValues(data) {
    var seenValues = {}, uniques = [];
    data.forEach(function(val) {
      if (seenValues[val] != 1) {
        seenValues[val] = 1;
        uniques.push(val);
      };
    });
    return uniques;
  };

  function plotDataSet(dataset) {
    for (var i = 0; i < dataset.x.length; i++) {
      self.canvas.append('circle')
          .attr('cx', self.xMap(dataset.x[i]))
          .attr('cy', self.yMap(dataset.y[i]))
          .attr('r', function() {
            if (dataset.hasOwnProperty('z')) return self.zMap(dataset.z[i]);
            return self.zMap();
          })
          .attr('opacity', 0.5)
          .attr('fill', function() {
            if (dataset.hasOwnProperty('colors')) return dataset.colors[i];
            return 'steelBlue';
          });
    };
  };

  self.plot = function(datasets) {
    build(datasets);
    datasets.forEach(function(dataset) {
      plotDataSet(dataset);
    });
  };
};

