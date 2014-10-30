D3xter
======
![Examples](https://raw.githubusercontent.com/NathanEpstein/D3xter/master/examples.png)

## About

Generate common charts with extremely simple functions. Functions return SVG objects which can be customized as needed using D3.js syntax.

Note: D3.js is a dependency, must run `bower install d3`

## Install

`bower install D3xter --save`

## Usage
Why use D3xter? Because configuration is optional, **charts with sensible defaults can be generated with a single line.**

Functions take the data to plot and an optional configuration object.

###Basic Examples (no configuration)
```javascript
var x = [1,2,3,4,5,6,7,8];
var y = [-1,-2,-3,-4,1,2,3,4];

var histogram = histo(x);

var lineGraph = xyPlot(x,y);

var scatterPlot = scatter(x,y);
```

## Further Examples/Extended Usage Notes

### Histogram
Creates a histogram from an array of data (like the top-left example).

```javascript
var config = {
  xLab: 'Standard Normal', //x-axis label (defaults to '')
  selector: '#elementID', //selector for DOM element to append the plot to (defaults to < body >)
  width: 500, //pixel width (defaults to 500)
  height: 500, //pixel height (defaults to 500)
}
var data = [10,-23.2,19,0.3]; //array of numeric values

var histogram = histo(data, config);
```

### Scatter Plot
Create a standard x-y scatter plot (like the bottom-right example), or specify an additional array of values to map to the size of the circles (like the top-right example)

```javascript
var config = {
  xLab: 'random x-values', //x-axis label (defaults to '')
  yLab: 'random y-values', //y-axis label (defaults to '')
  selector: '#elementID', //Selector for DOM element to append the plot to (defaults to < body >)
  width: 500, //pixel width (defaults to 500)
  height: 500, //pixel height (defaults to 500)

  //size and sizeLab are used in bubble charts like the top-right example.
  size: [-1,1,-2,2,-3], //array of numeric values which map to sizes of the circles plotted at the corresponding x-y point (defaults to undefined)
  sizeLab: 'some string' //label for size values (defaults to '')
}
var x = [1,2,3,4,5];
var y = [2,4,6,8,10];

var scatter = scatter(x,y,config);
```

### X-Y Line Graph

Create a standard x-y line graph (like the bottom left example).

```javascript
var config = {
  xLab: 'Time', //x-axis label (defaults to '')
  yLab: 'Geometric Brownian Motion', //y-axis label (defaults to '')
  selector: '#elementID', //Selector for DOM element to append the plot to (defaults to < body >)
  width: 500, //pixel width (defaults to 500)
  height: 500 //pixel height (defaults to 500)
}

var x = [1,2,3,4,5];
var y = [2,4,6,8,10];

var lineGraph = xyPlot(x,y,config);

```

## Extended Usage with D3

Functions in D3xter are intended to extend (rather than replace) D3. **D3xter functions return SVG objects** which can be modified with regular D3 code.

```javascript
var array = [1,2,3,4];

var hist = histo(array);

//modify the color of the histogram rectangles with D3 syntax
hist.selectAll('rect').style('fill','red');

```

## License

**The MIT License (MIT)**

> Copyright (c) 2014 Nathan Epstein
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
> THE SOFTWARE.







