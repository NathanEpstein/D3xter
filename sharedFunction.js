// This function creates the canvas, the everything bundle within the canvas, the axes (given scale functions), and the axes labels
start = function(xLab,yLab,xMap,yMap,canvasHeight,canvasWidth,height,width){

  var canvas = d3.select(element)
                .append('svg')
                .attr('height',canvasHeight)
                .attr('width', canvasWidth);

  var everything = canvas.append('g');

  everything.attr('transform','translate('+(width * 0.2)+','+(height * 0.05)+')');

  var xLabel = everything.append('text')
              .attr('x',canvasWidth*0.4)
              .attr('y',canvasHeight*0.875)
              .text(xLab)
              .attr('text-anchor','middle');

  var yLabel = everything.append('text')
              .attr('x', -canvasHeight*0.4)
              .attr('y', -canvasWidth*0.1)
              .attr('transform','rotate(-90)')
              .text(yLab)
              .attr('text-anchor','middle');

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


  var objects = [canvas,everything];
  return objects;

}

