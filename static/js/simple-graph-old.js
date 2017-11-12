

// var inputs = document.querySelectorAll( '.inputfile' );
// Array.prototype.forEach.call( inputs, function( input )
//   {
//   var label  = input.nextElementSibling,
//       labelVal = label.innerHTML;
// 
//   input.addEventListener( 'change', function( e )
//     {
//     var fileName = '';
//     if( this.files && this.files.length > 1 )
//       fileName = ( this.getAttribute( 'data-multiple-caption' ) || '' ).replace( '{count}', this.files.length );
//     else
//       fileName = e.target.value.split( '\\' ).pop();
// 
//     if( fileName )
//       label.querySelector( 'span' ).innerHTML = fileName;
//     else
//       label.innerHTML = labelVal;
//     });
// });


registerKeyboardHandler = function(callback) {
  var callback = callback;
  d3.select(window).on("keydown", callback);  
};

SimpleGraph = function(elemid, options) {
  var self = this;
  this.chart = document.getElementById(elemid);
  this.cx = this.chart.clientWidth;
  this.cy = this.chart.clientHeight;
  this.options = options || {};
  this.options.xmax = options.xmax || 6e9;
  this.options.xmin = options.xmin || 0;
  this.options.ymax = options.ymax || 20;
  this.options.ymin = options.ymin || -50;

  this.padding = {
     "top":    this.options.title  ? 40 : 20,
     "right":                100,
     "bottom": this.options.xlabel ? 60 : 10,
     "left":   this.options.ylabel ? 70 : 45
  };

  this.size = {
    "width":  this.cx - this.padding.left - this.padding.right,
    "height": this.cy - this.padding.top  - this.padding.bottom
  };

  // x-scale
  this.x = d3.scale.linear()
      .domain([this.options.xmin, this.options.xmax])
      .range([0, this.size.width]);

  // drag x-axis logic
  this.downx = Math.NaN;

  // y-scale (inverted domain)
  this.y = d3.scale.linear()
      .domain([this.options.ymax, this.options.ymin])
      .nice()
      .range([0, this.size.height])
      .nice();

  // drag y-axis logic
  this.downy = Math.NaN;

  this.dragged = this.selected = null;

  // this.line = d3.svg.line()
  //     .x(function(d, i) { return this.x(this.points[i].x); })
  //     .y(function(d, i) { return this.y(this.points[i].y); });

  this.logLine = d3.svg.line()
                  .x( function(d) { return x(d.f); } )  
                  .y( function(d) { return y(d.logMag); } );

  var xrange =  (this.options.xmax - this.options.xmin),
      yrange2 = (this.options.ymax - this.options.ymin) / 2,
      yrange4 = yrange2 / 2,
      datacount = this.size.width/30;

  // this.points = d3.range(datacount).map(function(i) { 
  //   return { x: i * xrange / datacount, y: this.options.ymin + yrange4 + Math.random() * yrange2 }; 
  // }, self);

  this.vis = d3.select(this.chart).append("svg")
      .attr("width",  this.cx)
      .attr("height", this.cy)
      .append("g")
        .attr("transform", "translate(" + this.padding.left + "," + this.padding.top + ")");

  this.plot = this.vis.append("rect")
      .attr("width", this.size.width)
      .attr("height", this.size.height)
      .style("fill", "#EEEEEE")
      .attr("pointer-events", "all")
      .on("mousedown.drag", self.plot_drag())
      .on("touchstart.drag", self.plot_drag())

  this.plot.call(d3.behavior.zoom().x(this.x).y(this.y).on("zoom", this.redraw()));

  this.vis.append("svg")
      .attr("top", 0)
      .attr("left", 0)
      .attr("width", this.size.width)
      .attr("height", this.size.height)
      .attr("viewBox", "0 0 "+this.size.width+" "+this.size.height)
      .attr("class", "line");
      // .append("path")
      //     .attr("class", "line")
      //     .attr("d", this.line(this.points));

  // create xAxis
  this.xAxis = d3.svg.axis()
                   .scale(this.x)
                   .orient("bottom")
                   .tickFormat( d3.format("s") )
                   .tickSize(-this.size.height);

  this.vis.append("svg:g")
        .attr("class", "x axis")
        .attr("id", "xAxis")
        // .attr("transform", "translate(" + this.padding.left + "," + (this.size.height+this.padding.top) + ")")
        .attr("transform", "translate(0," + (this.size.height) + ")")
        .call(this.xAxis);

  // create y axis
  this.yAxis = d3.svg.axis()
              .scale(this.y)
              .orient("left")
              .tickSize(-this.size.width)
              .ticks(6);

  // Add the y-axis to the left
  this.vis.append("svg:g")
        .attr("class", "y axis")
        .attr("id", "yAxis")
        .attr("transform", "translate(0,0)")
        .call(this.yAxis);

  // add Chart Title
  if (this.options.title) {
    this.vis.append("text")
        .attr("class", "axis")
        .text(this.options.title)
        .attr("x", this.size.width/2)
        .attr("dy","-0.8em")
        .style("text-anchor","middle");
  }

  // Add the x-axis label
  if (this.options.xlabel) {
    this.vis.append("text")
        .attr("class", "axis")
        .text(this.options.xlabel)
        .attr("x", this.size.width/2)
        .attr("y", this.size.height)
        .attr("dy","2.4em")
        .style("text-anchor","middle");
  }

  // add y-axis label
  if (this.options.ylabel) {
    this.vis.append("g").append("text")
        .attr("class", "axis")
        .text(this.options.ylabel)
        .style("text-anchor","middle")
        .attr("transform","translate(" + -40 + " " + this.size.height/2+") rotate(-90)");
  }

  d3.select(this.chart)
      .on("mousemove.drag", self.mousemove())
      .on("touchmove.drag", self.mousemove())
      .on("mouseup.drag",   self.mouseup())
      .on("touchend.drag",  self.mouseup());

  // this.redraw()();
};
  
//
// SimpleGraph methods
//

SimpleGraph.prototype.plot_drag = function() {
  var self = this;
  return function() {
    registerKeyboardHandler(self.keydown());
    d3.select('body').style("cursor", "move");
    if (d3.event.altKey) {
      var p = d3.svg.mouse(self.vis.node());
      var newpoint = {};
      newpoint.x = self.x.invert(Math.max(0, Math.min(self.size.width,  p[0])));
      newpoint.y = self.y.invert(Math.max(0, Math.min(self.size.height, p[1])));
      self.points.push(newpoint);
      self.points.sort(function(a, b) {
        if (a.x < b.x) { return -1 };
        if (a.x > b.x) { return  1 };
        return 0
      });
      self.selected = newpoint;
      self.update();
      d3.event.preventDefault();
      d3.event.stopPropagation();
    }    
  }
};

SimpleGraph.prototype.update = function() {
  var self = this;
  // var lines = this.vis.select("path").attr("d", this.line(this.points));
        
  // var circle = this.vis.select("svg").selectAll("circle")
  //     .data(this.points, function(d) { return d; });

  // circle.enter().append("circle")
  //     .attr("class", function(d) { return d === self.selected ? "selected" : null; })
  //     .attr("cx",    function(d) { return self.x(d.x); })
  //     .attr("cy",    function(d) { return self.y(d.y); })
  //     .attr("r", 10.0)
  //     .style("cursor", "ns-resize")
  //     .on("mousedown.drag",  self.datapoint_drag())
  //     .on("touchstart.drag", self.datapoint_drag());

  // circle
  //     .attr("class", function(d) { return d === self.selected ? "selected" : null; })
  //     .attr("cx",    function(d) { 
  //       return self.x(d.x); })
  //     .attr("cy",    function(d) { return self.y(d.y); });

  // circle.exit().remove();

  if (d3.event && d3.event.keyCode) {
    d3.event.preventDefault();
    d3.event.stopPropagation();
  }
}

SimpleGraph.prototype.mousemove = function() {
  var self = this;
  return function() {
    var p = d3.svg.mouse(self.vis[0][0]),
        t = d3.event.changedTouches;
    
    if (self.dragged) {
      self.dragged.y = self.y.invert(Math.max(0, Math.min(self.size.height, p[1])));
      self.update();
    };
    if (!isNaN(self.downx)) {
      d3.select('body').style("cursor", "ew-resize");
      var rupx = self.x.invert(p[0]),
          xaxis1 = self.x.domain()[0],
          xaxis2 = self.x.domain()[1],
          xextent = xaxis2 - xaxis1;
      if (rupx != 0) {
        var changex, new_domain;
        changex = self.downx / rupx;
        new_domain = [xaxis1, xaxis1 + (xextent * changex)];
        self.x.domain(new_domain);
        self.redraw()();
      }
      d3.event.preventDefault();
      d3.event.stopPropagation();
    };
    if (!isNaN(self.downy)) {
      d3.select('body').style("cursor", "ns-resize");
      var rupy = self.y.invert(p[1]),
          yaxis1 = self.y.domain()[1],
          yaxis2 = self.y.domain()[0],
          yextent = yaxis2 - yaxis1;
      if (rupy != 0) {
        var changey, new_domain;
        changey = self.downy / rupy;
        new_domain = [yaxis1 + (yextent * changey), yaxis1];
        self.y.domain(new_domain);
        self.redraw()();
      }
      d3.event.preventDefault();
      d3.event.stopPropagation();
    }
  }
};

SimpleGraph.prototype.mouseup = function() {
  var self = this;
  return function() {
    document.onselectstart = function() { return true; };
    d3.select('body').style("cursor", "auto");
    d3.select('body').style("cursor", "auto");
    if (!isNaN(self.downx)) {
      self.redraw()();
      self.downx = Math.NaN;
      d3.event.preventDefault();
      d3.event.stopPropagation();
    };
    if (!isNaN(self.downy)) {
      self.redraw()();
      self.downy = Math.NaN;
      d3.event.preventDefault();
      d3.event.stopPropagation();
    }
    if (self.dragged) { 
      self.dragged = null 
    }
  }
}

SimpleGraph.prototype.keydown = function() {
  var self = this;
  return function() {
    if (!self.selected) return;
    switch (d3.event.keyCode) {
      case 8: // backspace
      case 46: { // delete
        var i = self.points.indexOf(self.selected);
        self.points.splice(i, 1);
        self.selected = self.points.length ? self.points[i > 0 ? i - 1 : 0] : null;
        self.update();
        break;
      }
    }
  }
};


SimpleGraph.prototype.redraw = function() {
  var self = this;
  // console.log("redraw");

  return function() {
    // var tx = function(d) { 
    //   return "translate(" + self.x(d) + ",0)"; 
    // },
    // ty = function(d) { 
    //   return "translate(0," + self.y(d) + ")";
    // },
    // stroke = function(d) { 
    //   return d ? "#ccc" : "#666"; 
    // },
    // fx = self.x.tickFormat(10),
    // fy = self.y.tickFormat(10);

    
    self.vis.select(".x.axis").call(self.xAxis);
    self.vis.select(".y.axis").call(self.yAxis);

    // var gx = self.vis.selectAll("g.x")
    //     .data(self.x.ticks(10), String)
    //     .attr("transform", tx);

    // gx.select("text")
    //     .text(fx);

    // var gxe = gx.enter().insert("g", "a")
    //     .attr("class", "x")
    //     .attr("transform", tx);

    // gxe.append("line")
    //     .attr("stroke", stroke)
    //     .attr("y1", 0)
    //     .attr("y2", self.size.height);

    // gxe.append("text")
    //     .attr("class", "axis")
    //     .attr("y", self.size.height)
    //     .attr("dy", "1em")
    //     .attr("text-anchor", "middle")
    //     .text(fx)
    //     .style("cursor", "ew-resize")
    //     .on("mouseover", function(d) { d3.select(this).style("font-weight", "bold");})
    //     .on("mouseout",  function(d) { d3.select(this).style("font-weight", "normal");})
    //     .on("mousedown.drag",  self.xaxis_drag())
    //     .on("touchstart.drag", self.xaxis_drag());
    
    self.plot.call(d3.behavior.zoom().x(self.x).y(self.y).on("zoom", self.redraw()));
    self.update();    
  }  
}

SimpleGraph.prototype.xaxis_drag = function() {
  var self = this;
  return function(d) {
    document.onselectstart = function() { return false; };
    var p = d3.svg.mouse(self.vis[0][0]);
    self.downx = self.x.invert(p[0]);
  }
};

SimpleGraph.prototype.yaxis_drag = function(d) {
  var self = this;
  return function(d) {
    document.onselectstart = function() { return false; };
    var p = d3.svg.mouse(self.vis[0][0]);
    self.downy = self.y.invert(p[1]);
  }
};

SimpleGraph.prototype.plot_data = function( data_dict ) {
  var self = this;
  self.data_dict = data_dict;
  self.data = [];
  for ( i=0; i<=data_dict.f.length-1; i++ ) {
    var temp_dict = { };
    for (var propt in data_dict) {
      temp_dict[propt] = data_dict[propt][i];
    } 
   self.data.push( temp_dict); 
  };
    
  var fstart = self.data[0].f;
  var fstop = self.data[self.data.length - 1].f;

  var max_ar = [];
  var min_ar = [];

  for (var propt in self.data[0]) {
    if (propt != "f" && propt != "number_of_ports"){
      max_ar.push( math.max.apply(math,self.data.map( function(o){return o[propt]})) );
      min_ar.push( math.min.apply(math,self.data.map( function(o){return o[propt]})) );
    };
  };

  var max_y = math.max(max_ar);
  var min_y = math.min(min_ar);
  max_y = math.ceil(max_y/10)*10;
  min_y = math.floor(min_y/10)*10;

  self.logLine = d3.svg.line()
                    .x( function(d) { return self.x(d.f); } )  
                    .y( function(d) { return self.x(d.logMag); } )
                    .interpolate("linear");

  color = d3.scale.category10();

  color.domain(d3.keys(self.data[0]).filter(function(key) {
    return key !== "f" && key !== "number_of_ports";
  }));

  params = color.domain().map(function(name) {
    return {
      name: name,
      values: self.data.map(function(d) {
        return {
          f: d.f,
          logMag: +d[name]
        };
      })
    };
  });

  self.legend = self.plot.selectAll('g')
    .data(params)
    .enter()
    .append('g')
    .attr('class', 'legend');

  self.legend.append('rect')
    .attr('x', self.padding.left + 5)
    .attr('y', function(d, i) {
      return i * 20 + self.padding.top;
    })
    .attr('width', 10)
    .attr('height', 10)
    .style('fill', function(d) {
      return color(d.name);
    });

  self.legend.append('text')
    .attr('x', self.padding.left + 20)
    .attr('y', function(d, i) {
      return (i * 20) + self.padding.top + 9;
    })
    .text(function(d) {
      return d.name;
    });

  // self.legend.append('rect')
  //   .attr('x', self.size.width + self.padding.left + 5)
  //   .attr('y', function(d, i) {
  //     return i * 20 + self.padding.top;
  //   })
  //   .attr('width', 10)
  //   .attr('height', 10)
  //   .style('fill', function(d) {
  //     return color(d.name);
  //   });

  // self.legend.append('text')
  //   .attr('x', self.size.width + self.padding.left + 20)
  //   .attr('y', function(d, i) {
  //     return (i * 20) + self.padding.top + 9;
  //   })
  //   .text(function(d) {
  //     return d.name;
  //   });

  // this.vis.append("svg")
  //     .attr("top", 0)
  //     .attr("left", 0)
  //     .attr("width", this.size.width)
  //     .attr("height", this.size.height)
  //     .attr("viewBox", "0 0 "+this.size.width+" "+this.size.height)
  //     .attr("class", "line")
  //     .append("path")
  //         .attr("class", "line")
  //         .attr("d", this.logLine(this.points));

  param = self.vis.selectAll(".param")
    .data(params)
    .enter().append("g")
    .attr("class", "logMag");

  param.append("path")
      .attr("top", 0)
      .attr("left", 0)
      .attr("width", this.size.width)
      .attr("height", this.size.height)
      .attr("viewBox", "0 0 "+this.size.width+" "+this.size.height)
      .attr("class", "line")
      .append("path")
          .attr("class", "line")
          .attr("d", function(d) {
            return self.logLine(d.values);
          })
          .style("stroke", function(d) {
            return color(d.name);
          })

  // param = self.vis.selectAll(".param")
  //   .data(params)
  //   .enter().append("g")
  //   .attr("class", "logMag");

  // param.append("path")
  //   .attr("class", "line")
  //   .attr("d", function(d) {
  //     return logLine(d.values);
  //   })
  //   .style("stroke", function(d) {
  //     return color(d.name);
  //   })
  //   .attr("clip-path", "url(#rect-clip)")
  //   .attr("transform", "translate(" + self.padding.left + "," + self.padding.top + ")");

  // param.append("path")
  //   .attr("class", "line")
  //   .attr("d", function(d) {
  //     return logLine(d.values);
  //   })
  //   .style("stroke", function(d) {
  //     return color(d.name);
  //   })
  //   .attr("clip-path", "url(#rect-clip)")
  //   .attr("transform", "translate(" + self.padding.left + "," + self.padding.top + ")");


    // document.getElementById("logMagDiv").style.display = 'none';
    // document.getElementById("logMagDiv").style.display = 'block';
};


function plot() {
  my_url = "/pll_app/s_plot/getLogMagnitude?"
  // dat = "file_data='" + s +"'";
  dat = "";
  $.ajax( {
            type: "GET",
            url: my_url,
            datatype: 'json',
            async: true,
            data: dat,
            success: function (data) {
                dat = data;
                // console.log(data);
                graph.plot_data(data);
                // plotLogMag( data_dict=data );
                document.getElementById("plotBtn").disabled = true;
            },
            error: function (result) {
            }
  });
  console.log("plot();");
};

