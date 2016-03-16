var expect = chai.expect;

describe('D3xter', function() {
  var x = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  var y = [0, -1, 2, -2, 3, -3, 4, -4, 5];
  var words = ['one', 'two'];

  describe('plot', function(){
    var myPlot = new D3xter().plot({
      datasets: [
        { x: x, y: y, z: x },
        { x: x, y: y, line: true },
        { x: [1, 2], y: [1, 2], labels: words }
      ]
    });

    it('should have the correct number of circles', function() {
      var expectedCircles = x.length;
      var actualCircles = myPlot.canvas.selectAll('circle')[0].length;

      expect(actualCircles).to.eq(expectedCircles);
    });

    it('should have circles of correct radius', function() {
      var circles = myPlot.canvas.selectAll('circle')[0];
      var unsortedRadii = circles.map(function(circle) {
        return circle.getAttribute('r');
      });
      var sortedRadii = unsortedRadii.sort(function(a, b) {
        return a - b;
      });

      var increasingCircleSize = (sortedRadii == unsortedRadii);

      expect(increasingCircleSize).to.be.true;
    });

    it('should have the correct number of lines', function() {
      var expectedLines = x.length - 1;
      var actualLines = myPlot.canvas.selectAll('.plot-line')[0].length;

      expect(actualLines).to.eq(expectedLines);
    });

    it ('should contain the correct text', function() {
      var expectedText = words.length;
      var actualText = myPlot.canvas.selectAll('.plot-text')[0].length;

      expect(actualText).to.eq(expectedText);
    });

    myPlot.canvas.remove();
  });

  describe('pie', function() {
    var values = [1, 1, 1, 1];
    var myPie = new D3xter().pie({
      values: values
    });

    it('should have the correct number of slices', function() {
      var expectedSlices = values.length;
      var actualSlices = myPie.canvas.selectAll('path')[0].length;

      expect(actualSlices).to.equal(expectedSlices);
    });

    myPie.canvas.remove();
  });

  describe('bar', function() {
    var myBar = new D3xter().bar({
      groups: ['one', 'two', 'three'],
      datasets: [
        { values: [1, 4, 7] },
        { values: [2, 5, 8] },
        { values: [3, 6, 9] }
      ]
    });

    it('should have the correct number of bars', function() {
      var bars = myBar.canvas.selectAll('rect')[0].length;

      expect(bars).to.eq(9);
    });

    it('should have bars of the correct height', function() {
      var bars = myBar.canvas.selectAll('circle')[0];
      var unsortedBars = bars.map(function(bar) {
        return bar.getAttribute('height');
      });
      var sortedBars = unsortedBars.sort(function(a, b) {
        return a - b;
      });

      var increasingBarSize = (sortedBars == unsortedBars);

      expect(increasingBarSize).to.be.true;
    });

    myBar.canvas.remove();
  });

  describe('hist', function() {
    var myHist = new D3xter().hist(x);

    it('should have the correct number of bins', function() {
      var bins = myHist.canvas.selectAll('rect')[0].length;

      expect(bins).to.eq(3);
    });

    it('should have the correct bin size', function() {
      var bars = myHist.canvas.selectAll('circle')[0];
      var barSizes = bars.map(function(bar) {
        return bar.getAttribute('height');
      });

      var singleBarSize = barSizes.map(function(barSize) {
        return barSize == barSizes[0];
      }).reduce(function (a, b) {
        return (a && b);
      }, true);

      expect(singleBarSize).to.be.true;
    });

    myHist.canvas.remove();
  });

  describe('timeline', function() {
    var myFirstTimeline = new D3xter({ height: 700 }).timeline([
        { date: '2000-1-1', label: 'first' },
    ]);

    var myNextTimeline = new D3xter().timeline([
        { date: '2000-1-1', label: 'first' },
        { date: '2010-1-1', label: 'second' },
        { date: '2010-1-1', label: 'collision' }
    ]);

    it('should have the configured height if given', function() {
      var canvas = myFirstTimeline.canvas[0][0];
      var expectedHeight = 700;
      var actualHeight = Number(canvas.getAttribute('height'));

      expect(actualHeight).to.eq(expectedHeight);
    });

    it('should have default height if not given', function() {
      var canvas = myNextTimeline.canvas[0][0];
      var expectedHeight = 300;
      var actualHeight = Number(canvas.getAttribute('height'));

      expect(actualHeight).to.eq(expectedHeight);
    });

    it('should contain the correct text', function() {
      var textElements = myNextTimeline.canvas.selectAll('.timeline-text')[0];
      var strings = textElements.map(function(t) { return t.innerHTML });
      var expectedStrings = ['first', 'second', 'collision'];

      var includesExpectedStrings = expectedStrings.map(function(string) {
        return strings.indexOf(string) != -1;
      }).reduce(function(a, b) { return a && b }, true);

      expect(includesExpectedStrings).to.be.true;
    });

    myFirstTimeline.canvas.remove();
    myNextTimeline.canvas.remove();
  });

  describe('config', function() {
    describe('legend', function() {
      var myPie = new D3xter().pie({
        labels: ['one', 'two'],
        values: [1, 2]
      });

      var anotherPie = new D3xter({ legend: false }).pie({
        labels: ['one', 'two'],
        values: [1, 2]
      });

      it('should be present by default', function() {
        var legendPresent = myPie.canvas.selectAll('.legend')[0].length > 0;

        expect(legendPresent).to.be.true;
      });

      it('should not be present if configured accordingly', function() {
        var legendPresent = anotherPie.canvas.selectAll('.legend')[0].length > 0;

        expect(legendPresent).to.be.false;
      });

      myPie.canvas.remove();
      anotherPie.canvas.remove();
    });

    describe('title', function() {
      var myPie = new D3xter({ title: 'myPie' }).pie({
        labels: ['one', 'two'],
        values: [1, 2]
      });

      it('should have the correct title', function() {
        var title = myPie.canvas.select('.title')[0][0].innerHTML;
        expect(title).to.eq('myPie');
      });

      myPie.canvas.remove();
    });

    describe('axis labels', function() {
      var myPie = new D3xter({ xLab: 'xx', yLab: 'yy' }).pie({
        labels: ['one', 'two'],
        values: [1, 2]
      });

      it('should contain the correct labels', function() {
        var textElements = myPie.canvas.selectAll('.label')[0];
        var strings = textElements.map(function(t) { return t.innerHTML });
        var expectedStrings = ['xx', 'yy'];

        var includesExpectedStrings = expectedStrings.map(function(string) {
          return strings.indexOf(string) != -1;
        }).reduce(function(a, b) { return a && b }, true);

        expect(includesExpectedStrings).to.be.true;
      });

      myPie.canvas.remove();
    });

    describe('canvas', function() {
      var myPie = new D3xter({ width: 1000 }).pie({
        labels: ['one', 'two'],
        values: [1, 2]
      });

      it('should have the configured dimensions', function() {
        var expected = {
          height: 500,
          width: 1000
        };

        var height = Number(myPie.canvas[0][0].getAttribute('height'));
        var width = Number(myPie.canvas[0][0].getAttribute('width'));

        expect(height).to.eq(expected.height);
        expect(width).to.eq(expected.width);
      });

      myPie.canvas.remove();
    });
  });
});