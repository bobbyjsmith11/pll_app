$(document).on("keydown", function (e) {
  // if e.keycode == 36
  myevent = e;
  // console.log(e.keyCode);
  switch (e.keyCode) {
    case 8: // backspace
      console.log("backspace");
    case 46: { // delete
      console.log("delete");
    }
    case 36: {// home
      // console.log("home");
      graph.reset_scale();
    }
  }
});

registerKeyboardHandler = function(callback) {
  // console.log("keydown");
  var callback = callback;
  d3.select(window).on("keydown", callback);  
};

LogMagPlot = function(elemid, options) {
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
     "top":    this.options.title  ? 50 : 20,
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
  // inverted because height is second in the range
  this.y = d3.scale.linear()
      .domain([this.options.ymax, this.options.ymin])
      .nice()
      .range([0, this.size.height])
      .nice();

  // drag y-axis logic
  this.downy = Math.NaN;

  this.dragged = this.selected = null;

  this.logLine = d3.svg.line()
                  .x( function(d) { return this.x(d.f); } )  
                  .y( function(d) { return this.y(d.logMag); } );

  this.vis = d3.select(this.chart).append("svg")
      .attr("width",  this.cx)
      .attr("height", this.cy)
      .append("g")
        .attr("transform", "translate(" + this.padding.left + "," + this.padding.top + ")");

  this.color = d3.scale.category10();

  // this.color.domain(d3.keys(self.data[0]).filter(function(key) {
  //   return key !== "f" && key !== "number_of_ports";
  // }));
  
  this.params = this.color.domain().map(function(name) {
    return {
      name: name,
      values: data.map(function(d) {
        return {
          f: d.f,
          logMag: +d[name]
        };
      })
    };
  });

  this.param = this.vis.selectAll(".param")
    .data(this.params)
    .enter().append("g")
    .attr("class", "logMag");

  this.param.append("path")
    .attr("class", "line")
    .attr("d", function(d) {
      return this.logLine(d.values);
    })
    .style("stroke", function(d) {
      return this.color(d.name);
    });

  ///   EXPERIMENTAL 
  this.param = this.vis.selectAll(".param")
    .data(this.params)
    .enter().append("g")
    .attr("class", "logMag");
  /// 
 
  this.vis.append("text")
    .attr("class", "location-text")
    .attr("id", "locText")
    .attr("x", self.size.width - self.padding.left)
    .attr("y", self.size.height + self.padding.top)
    .text("x,y : ");

  this.plot = this.vis.append("rect")
      .attr("width", this.size.width)
      .attr("height", this.size.height)
      // .style("fill", "#EEEEEE")
      .style("fill", "#E6F7FF")
      .attr("pointer-events", "all")
      .on("mousemove", self.update_location())
      .on("mouseout", self.clear_location())
      .on("mousedown.drag", self.plot_drag())
      .on("touchstart.drag", self.plot_drag())
      this.plot.call(d3.behavior.zoom().x(this.x).y(this.y).on("zoom", this.redraw()));

  this.vis.append("clipPath")
         .attr("id","rect-clip")
         .append("rect")
         .attr("width",this.size.width)
         .attr("height",this.size.height);

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
                   // .on("mouseover", function(d) { d3.select(this).style("font-weight", "bold");})
                   // .on("mouseout",  function(d) { d3.select(this).style("font-weight", "normal");})
                   // .on("mousedown.drag",  self.xaxis_drag())
                   // .on("touchstart.drag", self.xaxis_drag());

  this.vis.append("svg:g")
        .attr("class", "x axis")
        .attr("id", "xAxis")
        .attr("transform", "translate(0," + (this.size.height) + ")")
        .call(this.xAxis)
        .style("cursor", "ew-resize")
        .on("mouseover", function(d) { d3.select(this).style("font-weight", "bold");})
        .on("mouseout",  function(d) { d3.select(this).style("font-weight", "normal");})
        .on("mousedown.drag",  self.xaxis_drag())
        .on("touchstart.drag", self.xaxis_drag());
        // .on("mousedown", function(d) {
        //   console.log("mouseodwn on x axis");
        // });

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
        .call(this.yAxis)
        .style("cursor", "ns-resize")
        .on("mouseover", function(d) { d3.select(this).style("font-weight", "bold");})
        .on("mouseout",  function(d) { d3.select(this).style("font-weight", "normal");})
        .on("mousedown.drag",  self.yaxis_drag())
        .on("touchstart.drag", self.yaxis_drag());

  // add Chart Title
  if (this.options.title) {
    this.vis.append("text")
        .attr("class", "chart-title")
        .text(this.options.title)
        .attr("x", this.size.width/2)
        .attr("dy","-0.8em")
        .style("text-anchor","middle")
        .on("dblclick", function(d) {
          console.log("you clicked the title");
        });
  }

  // Add the x-axis label
  if (this.options.xlabel) {
    this.vis.append("text")
        .attr("class", "axis")
        .text(this.options.xlabel)
        .attr("x", this.size.width/2)
        .attr("y", this.size.height)
        .attr("dy","2.4em")
        .style("text-anchor","middle")
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

  this.redraw()();

};

LogMagPlot.prototype.plot_drag = function() {
  var self = this;
  return function() {
    registerKeyboardHandler(self.keydown());
    d3.select('body').style("cursor", "move");
  
    if (d3.event.altKey) {
      console.log("you pressed the alt key");
    //   var p = d3.svg.mouse(self.vis.node());
    //   var newpoint = {};
    //   newpoint.x = self.x.invert(Math.max(0, Math.min(self.size.width,  p[0])));
    //   newpoint.y = self.y.invert(Math.max(0, Math.min(self.size.height, p[1])));
    //   self.points.push(newpoint);
    //   self.points.sort(function(a, b) {
    //     if (a.x < b.x) { return -1 };
    //     if (a.x > b.x) { return  1 };
    //     return 0
    //   });
    //   self.selected = newpoint;
    //   self.update();
    //   d3.event.preventDefault();
    //   d3.event.stopPropagation();
    }    
  }
};

LogMagPlot.prototype.clear_location = function() {
  var self = this;
  return function() {
    self.vis.select("#locText")
      .text("x,y : " );
  }
};


LogMagPlot.prototype.update_location = function() {
  var self = this;
  return function() {
    // console.log(d3.svg.mouse(self.vis[0][0]));
    var p = d3.svg.mouse(self.vis[0][0]);
    var y = d3.format(".4f")(self.y.invert(p[1]));
    var x = d3.format(".4s")(self.x.invert(p[0]));
    // console.log(d3.select(this)); 
    self.vis.select("#locText")
      .text("x,y : " + String(x) +" , " + String(y) );
    // d3.select(this)
    //   .text("x,y : " + String(p[0]) +" , " + String(p[1]) );
  }
};
LogMagPlot.prototype.redraw = function() {
  var self = this;
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

    // console.log('in the function'); 
    //
    self.vis.select(".x.axis").call(self.xAxis);
    self.vis.select(".y.axis").call(self.yAxis);

    self.param.selectAll("path")
      .attr("class", "line")
      .attr("d", function(d) {
        return self.logLine(d.values);
      })
      .style("stroke", function(d) {
        return self.color(d.name);
      })
        .attr("clip-path", "url(#rect-clip)");
    
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

LogMagPlot.prototype.plot_data = function( data_dict ) {

  var self = this;
  self.parse_data_dict( data_dict );
  // self.reset_scale( data_dict=data_dict );
  self.reset_scale();
  self.add_plot_lines();
  // self.update();

};


// LogMagPlot.prototype.update = function() {
//   var self = this;
//   // var lines = this.vis.select("path").attr("d", this.line(this.points));
//         
//   // var circle = this.vis.select("svg").selectAll("circle")
//   //     .data(this.points, function(d) { return d; });
// 
//   // circle.enter().append("circle")
//   //     .attr("class", function(d) { return d === self.selected ? "selected" : null; })
//   //     .attr("cx",    function(d) { return self.x(d.x); })
//   //     .attr("cy",    function(d) { return self.y(d.y); })
//   //     .attr("r", 10.0)
//   //     .style("cursor", "ns-resize")
//   //     .on("mousedown.drag",  self.datapoint_drag())
//   //     .on("touchstart.drag", self.datapoint_drag());
// 
//   // circle
//   //     .attr("class", function(d) { return d === self.selected ? "selected" : null; })
//   //     .attr("cx",    function(d) { 
//   //       return self.x(d.x); })
//   //     .attr("cy",    function(d) { return self.y(d.y); });
// 
//   // circle.exit().remove();
// 
// };


/*
 * parse the data_dict to the correct format
 * array of objects, each with keys
 *    f (float) frequency in Hz
 *    number_of_ports (int)
 *    s11dB
 *    s21dB
 *    ...
 * */
LogMagPlot.prototype.parse_data_dict = function( data_dict ) {

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
};

LogMagPlot.prototype.update = function() {
  // console.log("update");
  var self = this;
  
  if (d3.event && d3.event.keyCode) {
    d3.event.preventDefault();
    d3.event.stopPropagation();
  }

};


/*
 * add legend to plot
 * */
LogMagPlot.prototype.add_plot_lines = function( ) {

  var self = this;

  self.color.domain(d3.keys(self.data[0]).filter(function(key) {
    return key !== "f" && key !== "number_of_ports";
  }));
 
  // self.params.enter().data(self.data);

  self.params = self.color.domain().map(function(name) {
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

  self.param = this.vis.selectAll(".param")
    .data(self.params)
    .enter().append("g")
    .attr("class", "logMag");

  self.param.append("path")
    .attr("id", function(d) { return d.name + "-path"; })
    .attr("active", true)
    .attr("class", "data-line")
    .on("click", self.add_marker() )
    .on("mouseover", function(d) { d3.select(this).style("stroke-width", "5px");})
    .on("mouseout", function(d) { d3.select(this).style("stroke-width", "3px");})
    .attr("d", function(d) {
      return self.logLine(d.values);
    })
    .style("stroke", function(d) {
      return self.color(d.name);
    })
   .style("stroke-width", "3px");
    
  self.param.append('rect')
    .attr("id", function(d) { return d.name + "-rect"; })
    .attr("active", true)
    .attr('x', self.size.width + 5)
    .attr('y', function(d, i) {
      return i * 20 ;
    })
    .attr('width', 10)
    .attr('height', 10)
    .attr("active", true)
    .style('fill', function(d) {
      return self.color(d.name);
    })
    .on("click", function(d) {
      var active = self.param.select("#" + d.name + "-path").attr("active");
      if (active == "true") {
        active = false
        self.param.select("#" + d.name + "-rect").style("fill-opacity", "0.1");
        self.param.select("#" + d.name + "-text").style("fill-opacity", "0.5");
        self.param.select("#" + d.name + "-path").style("opacity", "0");
      } else {
        self.param.select("#" + d.name + "-rect").style("fill-opacity", "1");
        self.param.select("#" + d.name + "-text").style("fill-opacity", "5");
        self.param.select("#" + d.name + "-path").style("opacity", "1");
        active = true 
      }
      self.param.select("#" + d.name + "-path").attr("active", active);
    });

  self.param.append("text")
    .attr("id", function(d) { return d.name + "-text"; })
    .attr('x', self.size.width + 20)
    .attr('y', function(d, i) {
      return (i * 20) + 9;
    })
    .text(function(d) {
      return d.name;
    });
 
  //
  //  mouse line section
  //
  // mouseG = self.vis.append("g")
  //   .attr("class", "mouse-over-effects");

  // mouseG.append("path") // this is the black vertical line to follow mouse
  //   .attr("class", "mouse-line")
  //   .style("stroke", "black")
  //   .style("stroke-width", "1px")
  //   .style("opacity", "0");
  //   
  // // self.lines = document.getElementsByClassName('data-line');
  // self.lines = graph.param.selectAll("path");

  // var mousePerLine = mouseG.selectAll('.mouse-per-line')
  //   .data(self.params)
  //   .enter()
  //   .append("g")
  //   .attr("class", "mouse-per-line");

  // mousePerLine.append("circle")
  //   .attr("r", 5)
  //   .style("stroke", function(d) {
  //     return self.color(d.name);
  //   })
  //   .style("fill", "none")
  //   .style("stroke-width", "1px")
  //   .style("opacity", "0");

  // mousePerLine.append("text")
  //   .attr("transform", "translate(10,3)");

  // mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
  //   .attr("class", "overlay")
  //   .attr("x", 0)
  //   .attr("y", 0)
  //   .attr('width', self.size.width) // can't catch mouse events on a g element
  //   .attr('height', self.size.height)
  //   .on('mouseout', function() { // on mouse out hide line, circles and text
  //     d3.select(".mouse-line")
  //       .style("opacity", "0");
  //     d3.selectAll(".mouse-per-line circle")
  //       .style("opacity", "0");
  //     d3.selectAll(".mouse-per-line text")
  //       .style("opacity", "0");
  //   })javascript add more than one function to event
  //   .on('mouseover', function() { // on mouse in show line, circles and text
  //     d3.select(".mouse-line")
  //       .style("opacity", "1");
  //     d3.selectAll(".mouse-per-line circle")
  //       .style("opacity", "1");
  //     d3.selectAll(".mouse-per-line text")
  //       .style("opacity", "1");
  //   })
  //   .on('mousemove', function() { // mouse moving over canvas
  //     var mouse = d3.mouse(this);
  //     d3.select(".mouse-line")
  //       .attr("d", function() {
  //         var d = "M" + mouse[0] + "," + self.size.height;
  //         d += " " + mouse[0] + "," + 0;
  //         return d;
  //       });

  //     d3.selectAll(".mouse-per-line")
  //       .attr("transform", function(d, i) {
  //         var xFreq = self.x.invert(mouse[0]),
  //             bisect = d3.bisector(function(d) { return d.f; }).right;
  //             idx = bisect(d.values, xFreq);
  //         
  //         var beginning = 0,
  //             // end = self.lines[i].getTotalLength(),
  //             end = self.lines[i][0].getTotalLength(),
  //             target = null;

  //         while (true){
  //           target = Math.floor((beginning + end) / 2);
  //           // pos = self.lines[i].getPointAtLength(target);
  //           pos = self.lines[i][0].getPointAtLength(target);
  //           if ((target === end || target === beginning) && pos.x !== mouse[0]) {
  //               break;
  //           }vascript add more than one function to event
  //           if (pos.x > mouse[0])      end = target;
  //           else if (pos.x < mouse[0]) beginning = target;
  //           else break; //position found
  //         }
  //         
  //         d3.select(this).select('text')
  //           .text(self.y.invert(pos.y).toFixed(2));
  //           
  //         return "translate(" + mouse[0] + "," + pos.y +")";
  //       });
  //   });

};

LogMagPlot.prototype.make_marker_static = function() {
  var self = this;
  return function() {
    console.log("you clicked after adding marker");

    d3.select(this).style("pointer-events", "none");

  };
};


LogMagPlot.prototype.add_marker = function( ) {
  var self = this;
  return function() {
    console.log("you clicked me")

  // line = d3.select(this); // line is an Array, line[0] is a path

  //
  //  mouse line section
  //
    mouseG = self.vis.append("g")
      .attr("class", "mouse-over-effects");

    mouseG.append("path") // this is the black vertical line to follow mouse
      .attr("class", "mouse-line")
      .style("stroke", "black")
      .style("stroke-width", "1px")
      .style("opacity", "0");
      
    var line = d3.select(this)[0][0];

    var mousePerLine = mouseG.selectAll('.mouse-per-line')
      .data(self.params)
      .enter()
      .append("g")
      .attr("class", "mouse-per-line");

    mousePerLine.append("circle")
      .attr("r", 5)
      .style("stroke", function(d) {
        return self.color(d.name);
      })
      .style("fill", "none")
      .style("stroke-width", "1px")
      .style("opacity", "0");

    mousePerLine.append("text")
      .attr("transform", "translate(10,3)");

    mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
      .attr("class", "overlay")
      .attr("x", 0)
      .attr("y", 0)
      .attr('width', self.size.width) // can't catch mouse events on a g element
      .attr('height', self.size.height)
      .on("click", self.make_marker_static() )
      .on("keydown", self.change_mode())
      .on('mouseout', function() { // on mouse out hide line, circles and text
        d3.select(".mouse-line")
          .style("opacity", "0");
        d3.selectAll(".mouse-per-line circle")
          .style("opacity", "0");
        d3.selectAll(".mouse-per-line text")
          .style("opacity", "0");
      })
      .on('mouseover', function() { // on mouse in show line, circles and text
        d3.select(".mouse-line")
          .style("opacity", "1");
        d3.selectAll(".mouse-per-line circle")
          .style("opacity", "1");
        d3.selectAll(".mouse-per-line text")
          .style("opacity", "1");
      })
      .on('mousemove', function() { // mouse moving over canvas
        var mouse = d3.mouse(this);
        d3.select(".mouse-line")
          .attr("d", function() {
            var d = "M" + mouse[0] + "," + self.size.height;
            d += " " + mouse[0] + "," + 0;
            return d;
          });

        d3.selectAll(".mouse-per-line")
          .attr("transform", function(d, i) {
            var xFreq = self.x.invert(mouse[0]),
                bisect = d3.bisector(function(d) { return d.f; }).right;
                idx = bisect(d.values, xFreq);
            
            var beginning = 0,
                // end = self.lines[i].getTotalLength(),
                end = line.getTotalLength(),
                target = null;

            while (true){
              target = Math.floor((beginning + end) / 2);
              // pos = self.lines[i].getPointAtLength(target);
              pos = line.getPointAtLength(target);
              if ((target === end || target === beginning) && pos.x !== mouse[0]) {
                  break;
              }
              if (pos.x > mouse[0])      end = target;
              else if (pos.x < mouse[0]) beginning = target;
              else break; //position found
            }
            
            d3.select(this).select('text')
              .text(self.y.invert(pos.y).toFixed(2));
              
            return "translate(" + mouse[0] + "," + pos.y +")";
          });
      });
  
  }
};

LogMagPlot.prototype.change_mode = function() {
  var self = this;
  return function() {
    console.log("change_mode");
    registerKeyboardHandler(self.keydown());
    console.log(d3.event.keyCode);
    // switch (d3.event.keyCode) {
    //   case 8: // backspace
    //   case 46: { // delete
  }
};
/*
 * Resets the scale to account for the maximum and minimum
 * data values for all collective parameters
 * */
LogMagPlot.prototype.reset_scale = function( ) {
  var self = this;
  if (self.data_dict != null) { 
    // self.parse_data_dict( data_dict );
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
  } else {
    // console.log("data_dict = null");
    var fstart = self.options.xmin
    var fstop = self.options.xmax
    var min_y = self.options.ymin
    var max_y = self.options.ymax
  };

  // remember, the y scale is inverted, so max_y comes before min_y 
  self.y.domain([max_y,min_y]);
  
  self.x.domain([fstart, fstop]);
  console.log("self.x.domain() = " + String(self.x.domain()));
    
  self.vis.select(".x.axis")
    .transition()
    .duration(500)
    .call(self.xAxis);

  self.vis.select(".y.axis")
    .transition()
    .duration(500)
    .call(self.yAxis);
 
  self.param.selectAll("path")
    .attr("class", "line")
    .transition()
    .duration(500)
    .attr("d", function(d) {
      return self.logLine(d.values);
    })
    .style("stroke", function(d) {
      return self.color(d.name);
    });

  
  self.redraw()();
};

LogMagPlot.prototype.mousemove = function() {
  var self = this;
  return function() {
    // console.log("mousemove");
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
          // ymin = self.y.domain()[1]; // experimental
      if (rupy != 0) {
        var changey, new_domain, newymax;
        changey = self.downy / rupy;
        
        newymax = yaxis1 + (yextent * changey);
        console.log('rupy = ' + String(rupy) +', p[1] = ' + String(p[1]));
        console.log('graph.downy = ' + String(self.downy));
        // console.log('changey = ' + String(changey));
        // console.log('yaxis1 = ' + String(yaxis1));
        // console.log('yaxis2 = ' + String(yaxis2));
        // console.log('yextent = ' + String(yextent));
        // console.log('newymax = ' + String(newymax));
        new_domain = [yaxis1 + (yextent * changey), yaxis1];
        new_domain = [newymax, yaxis1];    // experimental
        self.y.domain(new_domain);
        self.redraw()();
      }
      d3.event.preventDefault();
      d3.event.stopPropagation();
    }
  }
};

LogMagPlot.prototype.mouseup = function() {
  var self = this;
  return function() {
    // console.log("mouseup");
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


LogMagPlot.prototype.keydown = function() {
  var self = this;
  return function() {
    if (!self.selected) return;
    switch (d3.event.keyCode) {
      case 8: // backspace
      case 46: { // delete
        // var i = self.points.indexOf(self.selected);
        // self.points.splice(i, 1);
        // self.selected = self.points.length ? self.points[i > 0 ? i - 1 : 0] : null;
        // self.update();
        // break;
      }
    }
  }
};

LogMagPlot.prototype.xaxis_drag = function() {
  var self = this;
  return function(d) {
    document.onselectstart = function() { return false; };
    var p = d3.svg.mouse(self.vis[0][0]);
    console.log("p[0] = " + String(p[0]));
    self.downx = self.x.invert(p[0]);
    console.log("self.downx = " + String(self.downx));
  }
};

LogMagPlot.prototype.yaxis_drag = function(d) {
  var self = this;
  return function(d) {
    // console.log("yaxis_drag");
    document.onselectstart = function() { return false; };
    var p = d3.svg.mouse(self.vis[0][0]);
    console.log("p[1] = " + String(p[1]));
    // self.downy = self.y.invert(p[1]) - self.y.domain()[1];
    self.downy = self.y.invert(p[1]);
    console.log("self.downy = " + String(self.downy));
  }
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
  // console.log("plot();");
};

