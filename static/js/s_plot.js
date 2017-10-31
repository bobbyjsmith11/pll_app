window.onload = function() {
  // plotLogMag();
};

// window.onload = function() {
// 
// 	hash = 1;
// 	$template = $(".template");
// 
// }

// function graph_s2p_file () {
//   // console.log(document.getElementById("s2p_file").value);
//   var file = document.getElementById("s2p_file").files[0];
//   if (file) {
//     console.log(file.name);
// 
//     my_url = "/pll_app/s_plot/load_s2p?";
//         dat = "file=" + file;
// 
//     $.ajax( {
//               type: "GET",
//               url: my_url,
//               datatype: 'json',
//               async: true,
//               data: dat,
//               success: function (data) {
//                 console.log(data);
// 
//               },
//               error: function (result) {
//               }
//     });
//   }
// }
// 
// function testMe () {
//   console.log('testMe');
// }

function plot() {
  var s = $("#file_data").text();
  s = encodeURIComponent( s );  // needed to escape any JSON special characters like "#"
  my_url = "/pll_app/default/load_s2p?"
  dat = "file_data='" + s +"'";
 
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
            },
            error: function (result) {
            }
  });
  // console.log("plot();");
} 
  
/* Sets up the initial open-loop gain and phase margin graph
 *
 * data_dict (dict)
 *    keys:
 *      f 
 *      s11
 *      s12
 *      s21
 *      s22
 *      ....
 *      smn
 *      snn
 * */
  
function plotLogMag ( data_dict=null ) {
     
    // define dimensions of graph

    width = 700;
    height = 500;
    m = [80, 80, 80, 80]; // margins
    w = width - m[1] - m[3]; // width
    h  = height - m[0] - m[2]; // height
    
    // k = Object.keys(data_dict);
    // console.log( Object.keys(data_dict) );
    
    // create the list of dictionaries

    data = {};
    try {
      for ( i=1; i<=data_dict.number_of_ports; i++ ) {
        for ( j=1; j<=data_dict.number_of_ports; j++ ) {
        var key = ("s" + String(i) + String(j));
        data[key] = [];
        array_length = data_dict.f.length
          for ( k=0; k<array_length; k++ ) {
            data[key].push(    { "f": data_dict.f[k], "logMag": data_dict[key +"db"][k] } );
          };
        };
      };
    } catch (e) {
      console.log(e);
    }
    // get start and stop frequencies from s11. s11 should always be present.
    var fstart = data.s11[0].f;
    var fstop = data.s11[data.s11.length - 1].f;

    // X scale will fit all values within pixels 0-w
    var x = d3.scale.linear()
              .range([0, w])
              .domain([fstart, fstop]);


    max_ar = [];
    min_ar = [];

    ar = $.map(data_dict["s12db"], function(value, index) {
          return [value];
          });
      for ( i=1; i<=data_dict.number_of_ports; i++ ) {
        for ( j=1; j<=data_dict.number_of_ports; j++ ) {
          var key = ("s" + String(i) + String(j));
          var array = $.map(data_dict[key+"db"], function(value, index) {
                return [value];
          });
          max_ar.push( math.max( array ));
          min_ar.push( math.min( array ));
        };
      };
    
    max_y = math.max(max_ar);
    min_y = math.min(min_ar);
    max_y = math.ceil(max_y/10)*10;
    min_y = math.floor(min_y/10)*10;

    y_scale = d3.scale.linear()
                        .range([h, 0])
                        .domain([min_y,max_y]);

    // Create the line function. Note the function is returning the scaled
    // value. For example x(d.x) means the x-scaled value of our data d.x.
    var logLine = d3.svg.line()
                    .x( function(d) { return x(d.f); } )  
                    .y( function(d) { return y_scale(d.logMag); } )
                    .interpolate("linear");

    // create xAxis

    xAxisMajor = d3.svg.axis()
                     .scale(x)
                     .orient("bottom")
                     // .tickValues([1e9,2e9,3e9,4e9,5e9,6e9,7e9,8e9,9e9,10e9])
                     .tickFormat( d3.format("s") )
                     .tickSize(-h);

    // create y axis
    yAxis = d3.svg.axis()
                .scale(y_scale)
                .orient("left")
                .tickSize(-w)
                .ticks(6);

    // Add an SVG element with the desired dimensions and margin.

    var graph = d3.select("#logMagPlot")
          .append("svg")
          .attr("preserveAspectRatio", "xMinYMin meet")
          .attr("viewBox", "0 0 700 500")
          .classed("svg-content-responsive", true);
          // .attr("transform", "translate(0,0)");
          // .attr("transform", "translate(" + m[3] + "," + m[0] + ")");
   
    // Add the y-axis to the left
    graph.append("svg:g")
          .attr("class", "y axis")
          .attr("id", "yAxis")
          .attr("transform", "translate(" + m[0] + "," + m[1] + ")")
          .call(yAxis);

    // add the graph title
    graph.append("text")
          .attr("text-anchor", "middle")
          .attr("transform", "translate("+ (w/2 + m[0]) +","+ (-m[0]/2 + m[1])+")")
          .attr("font-size", "18")
          .text("S-Parameters");

    // add the x axis label
    graph.append("text")
          .attr("text-anchor", "middle")
          .attr("transform", "translate("+ (w/2 + m[0]) +","+ (h+m[0]/2 + m[1])+")")
          .text("Frequency (Hz)");

    // add the left y axis label
    graph.append("text")
          .attr("text-anchor", "middle")
          .attr("transform", "translate("+ (-m[1]/2 + m[0]) +","+ (h/2 + m[1])+")rotate(-90)")
          .text("(dB)");

    graph.append("svg:g")
          .attr("class", "x axis")
          .attr("id", "xAxisMajor")
          .attr("transform", "translate(" + m[0] + "," + (h+m[1]) + ")")
          .call(xAxisMajor);

    graph.append("clipPath")
         .attr("id","rect-clip")
      .append("rect")
         .attr("x", 0)
         .attr("y", 0)
         .attr("width",w)
         .attr("height",h);

    // Add the line by appending an svg:path element with the data line we created above
    // do this AFTER the axes above so that the line is above the tick-lines
    
    var color = d3.scale.category10();

    var legend = graph.append('g')
                  .attr("class", "legend");
                  // .attr("x", 0)
                  // .attr("y", 0)
                  // .attr("height", 0)
                  // .attr("width", 0);
 

    var y_legend = 60;
    var x_legend = m[1] + 5;
    var spacing = 110;
    var n = 0;

    var k = d3.keys(data);

    k.forEach( function(d) {
      
      graph.append("path")
              .attr("class", "line")
              .attr("id", d)
              .attr("d", logLine(data[d]) )
              .attr("fill", "none")
              .attr("clip-path", "url(#rect-clip)")
              .attr("transform", "translate(" + m[0] + "," + (m[1]) + ")")
              .style("stroke", function() {
                return data[d].color = color(d); });
      
      legend.append("rect")
            .attr("x", x_legend + n*spacing)
            .attr("y", y_legend )
            .attr("height", 10)
            .attr("width", 10)
            .style("fill", data[d].color );

      legend.append("text")
            .attr("x", x_legend + n*spacing + 15 )
            .attr("y", y_legend + 9)
            .text(d);
      n+=1;
    });
  
    document.getElementById("logMagDiv").style.display = 'none';
    document.getElementById("logMagDiv").style.display = 'block';

};
  
  
  
  
  
  
