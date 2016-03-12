function D3xter(config) {
  var self = this,
      config = config || {};

  var height = config.height || 500,
      width = config.width || 500,
      margin = {
        top: height * 0.05,
        bottom: height * 0.2,
        left: width * 0.2,
        right: width * 0.05
      },
      innerHeight = height - margin.top - margin.bottom,
      innerWidth = width - margin.left - margin.right;

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

  function buildXAxis() {
    var xAxis = d3.svg.axis()
                .scale(self.xMap);

    self.canvas.append('g')
          .attr('transform','translate(0,' + (height - margin.bottom) + ')')
          .call(xAxis);
  };

  function buildYAxis() {
    var yAxis = d3.svg.axis()
                .tickFormat(d3.format('s'))
                .scale(self.yMap)
                .orient('left');

    self.canvas.append('g')
          .attr('transform','translate(' + margin.left + ', 0)')
          .call(yAxis);
  };

  function buildAxes() {
    buildXAxis();
    buildYAxis();
  };

  function buildAxisLabels() {
    var xLabel = self.canvas.append('text')
                .attr('x', margin.left + innerWidth / 2)
                .attr('y', margin.top + innerHeight + margin.bottom / 2)
                .text(config.xLab)
                .attr('text-anchor', 'middle');

    var yLabel = self.canvas.append('text')
                .attr('x', - (margin.top + innerHeight / 2))
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
                .concat([0])
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
      dataset.values.forEach(function(value, labelIndex) {
        self.canvas.append('rect')
            .attr("width", self.innerXMap.rangeBand())
            .attr("x", self.xMap(input.labels[labelIndex]) + self.innerXMap(dataIndex))
            .attr("y", self.yMap(Math.max(value, 0)))
            .attr("height", Math.abs(self.yMap(value) - self.yMap(0)))
            .style("fill", dataset.color || defaultColor(dataIndex));
      });
    });

    return self;
  };

  function bindex(bins, value) {
    var bindex = 0;
    while (true) {
      if (bindex == bins.length - 1) return bindex;
      if (value < bins[bindex + 1]) {
        return bindex;
      }
      else {
        bindex++;
      };
    };
  };

  function round2(num) {
    return Math.round(num * 100) / 100;
  };

  function formatBinString(bin, binSize) {
    return round2(bin) + ' to ' + round2(bin + binSize);
  };

  function buildHist(dataset) {
    var domain = getBoundaries(dataset),
        binCount = Math.round(Math.sqrt(dataset.length)),
        binSize = (domain[1] - domain[0]) / binCount,
        bins = [],
        values = [];

    for (var i = 0; i < binCount; i++) {
      bins.push(domain[0] + i * binSize);
      values.push(0);
    };

    dataset.forEach(function(value) { values[bindex(bins, value)] += 1 });

    return {
      binSize: binSize,
      bins: bins,
      values: values
    };
  };

  self.hist = function(dataset) {
    var histData = buildHist(dataset);

    return self.bar({
      labels: histData.bins.map(function(bin) {
        return formatBinString(bin, histData.binSize)
      }),
      datasets: [ { values: histData.values } ]
    });
  };

  function buildPie(input) {
    var radius = Math.min(innerWidth, innerHeight) / 2;

    self.arc = d3.svg.arc()
      .outerRadius(radius - 10)
      .innerRadius(0);

    var pie = d3.layout.pie()
      .sort(null)
      .value(function(d) { return d });

    self.arcGroup = self.canvas.selectAll('.arc')
        .data(pie(input.values))
        .enter().append('g')
        .attr('class', 'arc');
  };

  function renderPie(input) {
    var defaultColor = d3.scale.category10();
    self.arcGroup.append('path')
        .attr('d', self.arc)
        .style('fill', function(d, i) {
          if (input.hasOwnProperty('colors')) return input.colors[i];
          return defaultColor(i);
        });

    self.arcGroup.append('text')
        .attr('transform', function(d) { return 'translate(' + self.arc.centroid(d) + ')' })
        .attr('dy', '.35em')
        .style('text-anchor', 'middle')
        .text(function(d, i) { return input.labels[i] });

    self.arcGroup.attr('transform', 'translate(' + innerWidth / 2 + ',' + innerHeight / 2 + ')');
  };

  self.pie = function(input) {
    buildCanvas();
    buildPie(input);
    renderPie(input);

    return self;
  };

  function timeScale(minDate, maxDate) {
    var periods = {
      second: 1000,
      minute: 60000,
      hour: 3600000,
      day: 86400000,
      week: 604800000,
      month: 2678400000,
      year: 31536000000
    };

    var range = Date.parse(maxDate) - Date.parse(minDate),
        scale = 'second';
    Object.keys(periods).forEach(function(period) {
      if (range > periods[period]) scale = period;
    });

    return scale;
  };

  function formatEvents(events) {
    var formattedEvents = {};
    events.forEach(function(ev) {
      formattedEvents[ev.date] = formattedEvents[ev.date] || [];
      formattedEvents[ev.date].push(ev.label);
    });

    return formattedEvents;
  };

  function buildYMapTimeline(formattedEvents) {
    var maxDateFreq = Object.keys(formattedEvents).map(function(date) {
      return formattedEvents[date].length;
    }).reduce(function(a, b) { return Math.max(a, b) }, -Infinity);

    var prettyLevels = Math.round(innerHeight / 50);
    self.yMap = d3.scale.linear()
                  .domain([0, Math.max(maxDateFreq, prettyLevels)])
                  .range([height - margin.bottom, margin.top]);
  };

  function buildXMapTimeline(formattedEvents) {
    var sortedDates = Object.keys(formattedEvents).sort(function(a, b) {
      return Date.parse(a) - Date.parse(b);
    });

    var minDate = sortedDates[0]
        maxDate = sortedDates[sortedDates.length - 1];

    self.xMap = d3.time.scale()
                  .domain([
                    Date.parse(minDate),
                    Date.parse(maxDate)
                  ])
                  .nice(d3.time[timeScale(minDate, maxDate)])
                  .range([margin.left, width - margin.right]);
  };

  function buildTimeline(formattedEvents) {
    buildCanvas();
    buildAxisLabels();
    buildYMapTimeline(formattedEvents);
    buildXMapTimeline(formattedEvents);
    buildXAxis();
  };

  self.timeline = function(events) {
    var formattedEvents = formatEvents(events);
    buildTimeline(formattedEvents);

    Object.keys(formattedEvents).forEach(function(date) {
      formattedEvents[date].forEach(function(label, index) {
        self.canvas.append('text')
          .attr('x', self.xMap(Date.parse(date)))
          .attr('y', self.yMap(index + 1))
          .text(label)
          .attr('text-anchor', 'middle')
          .attr('stroke', 'black');
      });
    });

    return self;
  };

  return self;
};

