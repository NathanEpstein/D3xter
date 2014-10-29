// START FUNCTION: This function creates the canvas, the everything bundle within the canvas, the axes (given scale functions), and the axes labels
start = function(xLab,yLab,xMap,yMap,canvasWidth,canvasHeight,width,height,selector){

  var canvas = d3.select(selector)
                .append('svg')
                .attr('height',canvasHeight)
                .attr('width', canvasWidth);

  var everything = canvas.append('g');

  everything.attr('transform','translate('+(width * 0.2)+','+height*0.1+')');

  var xAxis = d3.svg.axis()
              .scale(xMap);

  var yAxis = d3.svg.axis()
              .scale(yMap)
              .orient('left');

  everything.append('g')
        .attr('transform','translate(0,'+height+')')
        .call(xAxis);

  everything.append('g')
        .call(yAxis);

  var xLabel = everything.append('text')
              .attr('x',canvasWidth*0.4)
              .attr('y',height+45)
              .text(xLab)
              .attr('text-anchor','middle');

  var yLabel = everything.append('text')
              .attr('x', -canvasHeight*0.4)
              .attr('y', -canvasWidth*0.1)
              .attr('transform','rotate(-90)')
              .text(yLab)
              .attr('text-anchor','middle');

  var objects = [canvas,everything];
  return objects;

}
// END OF START FUNCTION


// HISTO FUNCTION: creats histogram plot
histo = function(data,config){
  if (typeof config === 'undefined'){config = {}};
  var xLab=config.xLab,selector=config.selector,canvasWidth=config.width,canvasHeight=config.height;

  if(typeof canvasWidth === 'undefined'){
    canvasWidth = 500;
  }
  if(typeof canvasHeight === 'undefined'){
    canvasHeight = 500;
  }
  if(typeof selector === 'undefined'){
    selector = 'body';
  }
  if(typeof xLab === 'undefined'){
    xLab = '';
  }

  var hist = function(arr){
    var newArr = arr.slice().sort(function(a,b){
        return a-b;
    });

    var max = newArr[arr.length -1];
    var min = newArr[0];
    var bins = Math.round(Math.sqrt(arr.length));
    var binSize = (max-min)/bins;

    var obj= {};
    var keys = [];
    for (var i=0; i<bins; i++){
        var key = min + (i*binSize);
        keys.push(key);
        obj[key] = 0;
    }

    for (var j=0; j<arr.length; j++){
        var val = min;
        var temp_key = 0;
        while(true){
            if (newArr[j] == newArr[newArr.length-1]){
                obj[keys[keys.length-1]] += 1;
                break;
            }
            else if (newArr[j]<val+binSize){
                obj[keys[temp_key]]+= 1;
                break;
            }
            else{
                temp_key += 1;
                val += binSize;
            }
        }
    }

      return [obj,min,max,binSize];
  };

  var height = canvasHeight/1.3;
  var width = canvasWidth/1.3;
  if (canvasHeight - height < 75){height -= 45};

  var allData = hist(data);

  var xMap = d3.scale.linear()
                  .domain([allData[1],allData[2]])
                  .range([0,width]);

  var maxfreq = Math.max.apply( null,Object.keys(allData[0]).map(function ( key ) { return allData[0][key]; }) );

  var yMap = d3.scale.linear()
                  .domain([maxfreq,0])
                  .range([0,height]);

  var objects = start(xLab,'Frequency',xMap,yMap,canvasWidth,canvasHeight,width,height,selector);

  var canvas = objects[0];
  var everything = objects[1];

  //MAKE AN ARRAY OF THE DATA TO BIND
  var obj = allData[0];
  var keys = Object.keys(obj);
  var arr = [];
  for (var i=0;i<keys.length;i++){
      arr.push(obj[keys[i]]);
  }

  // obj,min,max,binSize
  var binSize = xMap(allData[3] + allData[1]);
  var padding = binSize * 0.075;
  //padding used to create a buffer around each bin

  everything.selectAll('rect')
        .data(arr)
        .enter()
        .append('rect')
        .attr('x', function(d,index){
          return (index*binSize + padding/2);
        })
        .attr('y', function(d){
          return yMap(d);
        })
        .attr('height', function(d){
          return Math.max(yMap(maxfreq - d) - 0.5, 0);
        })
        .attr('width', binSize-padding)
        .style('fill', 'steelBlue');

  return canvas;
};
// END OF HIST FUNCTION

// BEGINNING OF XY PLOT FUNCTION
xyPlot = function(x,y,config){
  if (typeof config === 'undefined'){config = {}};
  var xLab=config.xLab,yLab=config.yLab,selector=config.selector,canvasWidth=config.width,canvasHeight=config.height;

  if(typeof canvasWidth === 'undefined'){
    canvasWidth = 500;
  }
  if(typeof canvasHeight === 'undefined'){
    canvasHeight = 500;
  }
  if(typeof selector === 'undefined'){
    selector = 'body';
  }

  var xSort = x.slice().sort(function(a,b){
      return a-b;
  });

  var ySort = y.slice().sort(function(a,b){
      return a-b;
  });
  var yMax = ySort[ySort.length-1];
  var yMin = ySort[0];


  var height = canvasHeight/1.3;
  var width = canvasWidth/1.3;
  if (canvasHeight - height < 75){height -= 45};

  if (typeof x[0] !== 'number'){
    if (typeof Date.parse(x[0]) === 'number'){
      // if we're here, x[0] is a date
      var xMap = d3.time.scale()
                      .domain([new Date(x[0]),new Date(x[x.length-1])])
                      .range([0,width]);
      x.forEach(function(element,index){
        x[index] = new Date(x[index]);
      });
    }
  }
  else{
    // boundaries for numeric x
    var xMax = xSort[xSort.length-1];
    var xMin = xSort[0];

    var xMap = d3.scale.linear()
                    .domain([xMin,xMax])
                    .range([0,width]);
  }

  var yMap = d3.scale.linear()
                  .domain([yMax,yMin])
                  .range([0,height]);

  var objects = start(xLab,yLab,xMap,yMap,canvasWidth,canvasHeight,width,height,selector);

  var canvas = objects[0];
  var everything = objects[1];

  for (var i=1;i<x.length;i++){
    everything.append('line')
              .attr('stroke-width',1)
              .attr('stroke','black')
              .attr('x1',xMap(x[i-1]))
              .attr('x2',xMap(x[i]))
              .attr('y1',yMap(y[i-1]))
              .attr('y2',yMap(y[i]));
  }

  return canvas;

};

// START OF SCATTER FUNCTION
scatter = function(x,y,config){
  if (typeof config === 'undefined'){config = {}};
  var xLab=config.xLab,yLab=config.yLab,selector=config.selector,canvasWidth=config.width,canvasHeight=config.height,z=config.size,zLab=config.sizeLab;

  if(typeof canvasWidth === 'undefined'){
    canvasWidth = 500;
  }
  if(typeof canvasHeight === 'undefined'){
    canvasHeight = 500;
  }
  if(typeof selector === 'undefined'){
    selector = 'body';
  }

  var xSort = x.slice().sort(function(a,b){
        return a-b;
  });

  var ySort = y.slice().sort(function(a,b){
        return a-b;
    });

  if (typeof z !== 'undefined'){
    var zSort = z.slice().sort(function(a,b){
          return a-b;
    });
  }

  var yMax = ySort[ySort.length-1];
  var yMin = ySort[0];

  var height = canvasHeight/1.3;
  var width = canvasWidth/1.3;
  if (canvasHeight - height < 75){height -= 45};

  if (typeof x[0] !== 'number'){
    if (typeof Date.parse(x[0]) === 'number'){
      // if we're here, x[0] is a date
      var xMap = d3.time.scale()
                      .domain([new Date(x[0]),new Date(x[x.length-1])])
                      .range([0,width]);
      x.forEach(function(element,index){
        x[index] = new Date(x[index]);
      });
    }
  }
  else{
    // boundaries for numeric x
    var xMax = xSort[xSort.length-1];
    var xMin = xSort[0];

    var xMap = d3.scale.linear()
                    .domain([xMin,xMax])
                    .range([0,width]);
  }

  var yMap = d3.scale.linear()
                  .domain([yMax,yMin])
                  .range([0,height]);

  if (typeof zLab !== 'undefined'){yLab = yLab+' ('+zLab+')'};
  var objects = start(xLab,yLab,xMap,yMap,canvasWidth,canvasHeight,width,height,selector);

  var canvas = objects[0];
  var everything = objects[1];


  x.forEach(function(elem,index){
    everything.append('circle')
              .attr('r',function(){
                if (typeof z === 'undefined'){
                  return height*width*(0.00002);
                }
                else{
                  return (height*width*0.000025 + (z[index]-zSort[0])*(height*width*(0.0001))/(zSort[zSort.length-1] - zSort[0]));
                }
              })
              .attr('cx',xMap(x[index]))
              .attr('cy',yMap(y[index]))
              .attr('opacity',function(){
                if (typeof z === 'undefined'){
                  return 1;
                }
                else{
                  return 0.3;
                }
              })
              .attr('fill',function(){
                if (typeof z === 'undefined'){
                  return 'none';
                }
                else{
                  return 'steelBlue';
                }
              })
              .attr('stroke', function(){
                if (typeof z === 'undefined'){return'black'};
                return 'none'
              });
  });

  return canvas;

}

