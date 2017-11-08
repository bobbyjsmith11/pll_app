window.onload = function() {
  // plotLogMag();
};

registerKeyboardHandler = function(callback) {
  var callback = callback;
  d3.select(window).on("keydown", callback);  
};

function plot() {
  var s = $("#file_data").text();
  s = encodeURIComponent( s );  // needed to escape any JSON special characters like "#"
  // my_url = "/pll_app/default/load_s2p?"
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
                plotLogMag( data_dict=data );
                document.getElementById("plotBtn").disabled = true;
            },
            error: function (result) {
            }
  });
  // console.log("plot();");
} 
 
/*
 *
 *
 *
 * 
 *
 */
function plotLogMag( data_dict=null ) {
  
    mydata = data_dict
    data = [];
    for ( i=0; i<=data_dict.f.length-1; i++ ) {
      var temp_dict = { };
      for (var propt in data_dict) {
        temp_dict[propt] = data_dict[propt][i];
      } 
     data.push( temp_dict); 
    };
    
    var margin = {
        top: 30,
        right: 80,
        bottom: 40,
        left: 50
      },
      full_width = 700,
      full_height = 500
      width = full_width - margin.left - margin.right,
      height = full_height - margin.top - margin.bottom;

    // find min and max frequencies
    var fstart = data[0].f;
    var fstop = data[data.length - 1].f;

    // X scale will fit all values within pixels 0-w
    // GLOBAL
    x_scale = d3.scale.linear()
              .range([0, width])
              .domain([fstart, fstop]);

    var max_ar = [];
    var min_ar = [];

    for (var propt in data[0]) {
      if (propt != "f" && propt != "number_of_ports"){
        max_ar.push( math.max.apply(math,data.map( function(o){return o[propt]})) );
        min_ar.push( math.min.apply(math,data.map( function(o){return o[propt]})) );
      };
    };

    var max_y = math.max(max_ar);
    var min_y = math.min(min_ar);
    max_y = math.ceil(max_y/10)*10;
    min_y = math.floor(min_y/10)*10;

    // GLOBAL
    y_scale = d3.scale.linear()
                        .range([height, 0])
                        .domain([min_y,max_y]);

    // create xAxis
    // GLOBAL
    xAxis = d3.svg.axis()
                     .scale(x_scale)
                     .orient("bottom")
                     // .tickValues([1e9,2e9,3e9,4e9,5e9,6e9,7e9,8e9,9e9,10e9])
                     .tickFormat( d3.format("s") )
                     .tickSize(-height);

    // create y axis
    // GLOBAL
    yAxis = d3.svg.axis()
                .scale(y_scale)
                .orient("left")
                .tickSize(-width)
                .ticks(6);

    // Create the line function. Note the function is returning the scaled
    // value. For example x(d.x) means the x-scaled value of our data d.x.
    // GLOBAL
    logLine = d3.svg.line()
                    .x( function(d) { return x_scale(d.f); } )  
                    .y( function(d) { return y_scale(d.logMag); } )
                    .interpolate("linear");

    var zoom = d3.behavior.zoom()
          .x(x_scale)
          .y(y_scale)
          .scaleExtent([1, 10])
          .on("zoom", zoomed);

    // Add an SVG element with the desired dimensions and margin.
    graph = d3.select("#logMagPlot")
          .append("svg")
          .attr("preserveAspectRatio", "xMinYMin meet")
          .attr("viewBox", "0 0 700 500")
          .classed("svg-content-responsive", true)
          .call(zoom);
          // .attr("transform", "translate(0,0)");
          // .attr("transform", "translate(" + m[3] + "," + m[0] + ")");
  
    color = d3.scale.category10();

    color.domain(d3.keys(data[0]).filter(function(key) {
      return key !== "f" && key !== "number_of_ports";
    }));

    params = color.domain().map(function(name) {
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

    var legend = graph.selectAll('g')
      .data(params)
      .enter()
      .append('g')
      .attr('class', 'legend');

    legend.append('rect')
      .attr('x', width + margin.left + 5)
      .attr('y', function(d, i) {
        return i * 20 + margin.top;
      })
      .attr('width', 10)
      .attr('height', 10)
      .style('fill', function(d) {
        return color(d.name);
      });

    legend.append('text')
      .attr('x', width + margin.left + 20)
      .attr('y', function(d, i) {
        return (i * 20) + margin.top + 9;
      })
      .text(function(d) {
        return d.name;
      });

    graph.append("clipPath")
         .attr("id","rect-clip")
      .append("rect")
         .attr("x", 0)
         .attr("y", 0)
         .attr("width",width)
         .attr("height",height);

    // Add the y-axis to the left
    graph.append("svg:g")
          .attr("class", "y axis")
          .attr("id", "yAxis")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
          .call(yAxis);

    graph.append("svg:g")
          .attr("class", "x axis")
          .attr("id", "xAxis")
          .attr("transform", "translate(" + margin.left + "," + (height+margin.top) + ")")
          .call(xAxis);

    // add the graph title
    graph.append("text")
          .attr("text-anchor", "middle")
          .attr("transform", "translate("+ (width/2 + margin.left) +","+ (-margin.top/2 + margin.top)+")")
          .attr("font-size", "18")
          .text("S-Parameters");

    // add the x axis label
    graph.append("text")
          .attr("text-anchor", "middle")
          .attr("transform", "translate("+ (width/2 + margin.left) +","+ (height + margin.top + margin.bottom/1.5)+")")
          .text("Frequency (Hz)");

    // add the left y axis label
    graph.append("text")
          .attr("text-anchor", "middle")
          .attr("transform", "translate("+ (-margin.left/1.5 + margin.left) +","+ (height/2 + margin.top)+")rotate(-90)")
          .text("(dB)");


    param = graph.selectAll(".param")
      .data(params)
      .enter().append("g")
      .attr("class", "logMag");

    param.append("path")
      .attr("class", "line")
      .attr("d", function(d) {
        return logLine(d.values);
      })
      .style("stroke", function(d) {
        return color(d.name);
      })
      .attr("clip-path", "url(#rect-clip)")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    
    //
    //  mouse line section
    //
    var mouseG = graph.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .attr("class", "mouse-over-effects");

    mouseG.append("path") // this is the black vertical line to follow mouse
      .attr("class", "mouse-line")
      .style("stroke", "black")
      .style("stroke-width", "1px")
      .style("opacity", "0");
      
    var lines = document.getElementsByClassName('line');

    var mousePerLine = mouseG.selectAll('.mouse-per-line')
      .data(params)
      .enter()
      .append("g")
      .attr("class", "mouse-per-line");

    mousePerLine.append("circle")
      .attr("r", 7)
      .style("stroke", function(d) {
        return color(d.name);
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
      .attr('width', width) // can't catch mouse events on a g element
      .attr('height', height)
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
            var d = "M" + mouse[0] + "," + height;
            d += " " + mouse[0] + "," + 0;
            return d;
          });

        d3.selectAll(".mouse-per-line")
          .attr("transform", function(d, i) {
            // console.log(width/mouse[0])
            var xFreq = x_scale.invert(mouse[0]),
                bisect = d3.bisector(function(d) { return d.f; }).right;
                idx = bisect(d.values, xFreq);
            
            var beginning = 0,
                end = lines[i].getTotalLength(),
                target = null;

            while (true){
              target = Math.floor((beginning + end) / 2);
              pos = lines[i].getPointAtLength(target);
              if ((target === end || target === beginning) && pos.x !== mouse[0]) {
                  break;
              }
              if (pos.x > mouse[0])      end = target;
              else if (pos.x < mouse[0]) beginning = target;
              else break; //position found
            }
            
            d3.select(this).select('text')
              .text(y_scale.invert(pos.y).toFixed(2));
              
            return "translate(" + mouse[0] + "," + pos.y +")";
          });
    
      });
      
    document.getElementById("logMagDiv").style.display = 'none';
    document.getElementById("logMagDiv").style.display = 'block';

};



function zoomed() {
    // console.log("zoomed");
    graph.select(".x.axis").call(xAxis);
    graph.select(".y.axis").call(yAxis);

    param.selectAll("path")
      .attr("class", "line")
      .attr("d", function(d) {
        return logLine(d.values);
      })
      .style("stroke", function(d) {
        return color(d.name);
      });

    document.getElementById("logMagDiv").style.display = 'none';
    document.getElementById("logMagDiv").style.display = 'block';
};


function resetScale() {

    var fstart = data[0].f;
    var fstop = data[data.length - 1].f;
    x_scale.domain([fstart, fstop]);

    var max_ar = [];
    var min_ar = [];

    for (var propt in data[0]) {
      if (propt != "f" && propt != "number_of_ports"){
        max_ar.push( math.max.apply(math,data.map( function(o){return o[propt]})) );
        min_ar.push( math.min.apply(math,data.map( function(o){return o[propt]})) );
      };
    };

    var max_y = math.max(max_ar);
    var min_y = math.min(min_ar);
    max_y = math.ceil(max_y/10)*10;
    min_y = math.floor(min_y/10)*10;

    // GLOBAL
    y_scale.domain([min_y,max_y]);
  
    graph.select(".x.axis")
      .transition()
      .duration(500)
      .call(xAxis);
    graph.select(".y.axis")
      .transition()
      .duration(500)
      .call(yAxis);

    param.selectAll("path")
      .attr("class", "line")
      .transition()
      .duration(500)
      .attr("d", function(d) {
        return logLine(d.values);
      })
      .style("stroke", function(d) {
        return color(d.name);
      });


    document.getElementById("logMagDiv").style.display = 'none';
    document.getElementById("logMagDiv").style.display = 'block';
}; 
  
  
