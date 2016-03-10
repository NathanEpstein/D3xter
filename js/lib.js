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

  function buildXMap(datasets) {
    var values = datasets.map(function(d) { return d.x }).reduce(function(a, b) { return a.concat(b) });
    var ordinalValues = (typeof values[0] == 'string');

    if (ordinalValues) {
      var xDomain = getUniqueValues(values);
      self.xMap = d3.scale.ordinal()
                  .domain(xDomain)
                  .rangePoints([margin.left, width - margin.right]);
    }
    else {
      var xDomain = getBoundaries(values);
      self.xMap = d3.scale.linear()
                  .domain(xDomain)
                  .range([margin.left, width - margin.right]);
    };
  };

  function buildYMap(datasets) {
    var values = datasets.map(
      function(d) { return d.y }
    ).reduce(function(a, b) { return a.concat(b) }, []);

    var yDomain = getBoundaries(values);
    self.yMap = d3.scale.linear()
               .domain(yDomain)
               .range([height - margin.bottom, margin.top]);
  };

  function buildZMap(datasets) {
    var basePointSize = 3;
    var values = datasets.map(function(d) { return d.z })
                .reduce(function(a, b) { return a.concat(b) }, [])
                .filter(function(a) { return (typeof a !== 'undefined') });

    if (values.length == 0) {
      self.zMap = function() { return basePointSize };
    }
    else {
      var zDomain = getBoundaries(values);
      self.zMap = function(value) {
        if (typeof value === 'undefined') return basePointSize;
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
                .attr('x', (width + margin.left + margin.right) / 2)
                .attr('y', height - margin.bottom / 2)
                .text(config.xLab)
                .attr('text-anchor', 'middle');

    var yLabel = self.canvas.append('text')
                .attr('x', - height / 2)
                .attr('y', margin.left / 2)
                .attr('transform', 'rotate(-90)')
                .text(config.yLab)
                .attr('text-anchor', 'middle');
  };

  function buildPlot(datasets) {
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

  function plotPoints(dataset) {
    for (var i = 0; i < dataset.x.length; i++) {
      self.canvas.append('circle')
          .attr('cx', self.xMap(dataset.x[i]))
          .attr('cy', self.yMap(dataset.y[i]))
          .attr('r', function() {
            if (dataset.hasOwnProperty('z')) return self.zMap(dataset.z[i]);
            return self.zMap();
          })
          .attr('opacity', 0.5)
          .attr('fill', dataset.color || 'steelBlue');
    };
  };

  function plotLine(dataset) {
    var color = dataset.color || 'black';
    for (var i = 1; i < dataset.x.length; i++) {
      self.canvas.append('line')
          .attr('stroke-width', 1)
          .attr('stroke', color)
          .attr('x1', self.xMap(dataset.x[i - 1]))
          .attr('x2', self.xMap(dataset.x[i]))
          .attr('y1', self.yMap(dataset.y[i - 1]))
          .attr('y2', self.yMap(dataset.y[i]));
    };
  };

  function plotText(dataset) {
    for (var i = 1; i < dataset.x.length; i++) {
      self.canvas.append('text')
          .attr('x', self.xMap(dataset.x[i]))
          .attr('y', self.yMap(dataset.y[i]))
          .text(dataset.labels[i])
          .attr('text-anchor', 'middle')
          .attr('stroke', dataset.color || 'black')
    };
  };

  self.plot = function(datasets) {
    buildPlot(datasets);

    datasets.forEach(function(dataset) {
      if (dataset.hasOwnProperty('labels')) {
        plotText(dataset);
      }
      else if (dataset.line) {
        plotLine(dataset);
      }
      else {
        plotPoints(dataset);
      };
    });

    return self;
  };


  function buildBar(input) {
    var structuredData = [
      {
        x: input.labels.map(String),
        y: input.datasets
                .map(function(dataset) { return dataset.values })
                .reduce(function(a, b) { return a.concat(b) }, [])
      }
    ];

    buildCanvas();
    buildYMap(structuredData);
    buildXMapBar(input);
    buildAxes();
    buildAxisLabels();
  };

  function buildXMapBar(input) {
    var datasetIndexes = input.datasets.map(function(dataset, index) { return index });

    self.xMap = d3.scale.ordinal()
        .domain(input.labels)
        .rangeRoundBands([margin.left, width - margin.right], .1);

    self.innerXMap = d3.scale.ordinal()
        .domain(datasetIndexes)
        .rangeRoundBands([0, self.xMap.rangeBand()], .05);
  };

  self.bar = function(input) {
    buildBar(input);

    var defaultColor = d3.scale.category10();

    input.datasets.forEach(function(dataset, dataIndex) {
      input.labels.forEach(function(label, labelIndex) {
        self.canvas.append('rect')
            .attr("width", self.innerXMap.rangeBand())
            .attr("x", function(d) { return self.xMap(label) + self.innerXMap(dataIndex); })
            .attr("y", function(d) { return self.yMap(dataset.values[labelIndex]); })
            .attr("height", function(d) { return height - self.yMap(dataset.values[labelIndex]) - margin.bottom; })
            .style("fill", dataset.color || defaultColor(dataIndex));
      });
    });

    return self;
  };

  return self;
};

