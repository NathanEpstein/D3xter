var expect = chai.expect;

describe('pie', function(){
  describe("with a defined config object", function() {
    var data = [2,4,7,12,23];
    var config = {height:400, width:300,labels:["one","two","three","four","five"]};
    var p = pie(data,config);

    it('should have the correct number of slices',function(){
      var slices = p.selectAll('path')[0].length;
      expect(slices).to.equal(5);
    })
    it('should have the correct height',function(){
      expect(Number(p[0][0].attributes.height.value)).to.equal(400);
    })
    it('should have the correct width',function(){
      expect(Number(p[0][0].attributes.width.value)).to.equal(300);
    })
    p.remove();
  })

  describe('without a defined config object', function() {
    var p

    beforeEach(function() {
      var data = [2,4,7,12,23];
      p = pie(data);
    })

    afterEach(function() {
      p.remove()
    })

    it('should have a width of 500', function() {
      expect(Number(p[0][0].attributes.width.value)).to.equal(500)
    })

    it('should have a height of 500', function() {
      expect(Number(p[0][0].attributes.width.value)).to.equal(500)
    })
  })
})

describe('histo', function(){
  var data = [-12,32,43,12,43,25,34,76,78];
  var config = {height:400, width: 700, xLab: 'Testing'}
  var h = histo(data,config);

  it('should have the correct number of bins', function(){
    var bins = h.selectAll('rect')[0];
    expect(bins.length).to.equal(Math.floor(Math.sqrt(data.length)));
  })
  it('should have the correct height',function(){
    expect(Number(h[0][0].attributes.height.value)).to.equal(400);
  })
  it('should have the correct width',function(){
    expect(Number(h[0][0].attributes.width.value)).to.equal(700);
  })
  h.remove();
})

describe('scatter', function(){
  var x = [1,2,3,4,5,6,7,8,9];
  var y = [-12,32,43,12,43,25,34,76,78];
  var s = scatter(x,y);

  it('should have the correct number of circles', function(){
    expect(s.selectAll('circle')[0].length).to.equal(x.length);
  })
  it('should have the correct height',function(){
    expect(Number(s[0][0].attributes.height.value)).to.equal(500);
  })
  it('should have the correct width',function(){
    expect(Number(s[0][0].attributes.width.value)).to.equal(500);
  })
  s.remove();
})

describe('xyPlot', function(){
  var x = [1,2,3,4,5,6,7,8,9,10,11,12];
  var y = [-12,32,43,12,43,25,34,76,78,3,14,45];
  var p = xyPlot(x,y, {height:710,width:830});

  it('should have the correct number of line segments', function(){
    expect(p.selectAll('line')[0].length - p.selectAll('.tick')[0].length ).to.equal(x.length - 1);
  })

  it('should have the correct height',function(){
    expect(Number(p[0][0].attributes.height.value)).to.equal(710);
  })
  it('should have the correct width',function(){
    expect(Number(p[0][0].attributes.width.value)).to.equal(830);
  })
  p.remove();
})
