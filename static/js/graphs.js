///////////////////////////////////////////////////////////////////////////////////////
//
//  OPEN LOOP RESPONSE GRAPHS
//
///////////////////////////////////////////////////////////////////////////////////////
//
//
//
/* Sets up the initial open-loop gain and phase margin graph
 * */
function plotGainPhaseMargin ( gdb, phi, freq) {

    // define dimensions of graph

    width = 700;
    height = 500;
    m = [80, 80, 80, 80]; // margins
    w = width - m[1] - m[3]; // width
    h  = height - m[0] - m[2]; // height

    // Add an SVG element with the desired dimensions and margin.
    var graph = d3.select("#pmGraph")
          .append("svg")
          .attr("preserveAspectRatio", "xMinYMin meet")
          .attr("viewBox", "0 0 700 500")
          .classed("svg-content-responsive", true);
          // .attr("transform", "translate(0,0)");
          // .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

    var color = d3.scale.category10();
    var data = { 
            "gain":        [],
            "phase":       []
            };

    for ( i=0; i<freq.length; i++ ) {

      data.gain.push(    { "x_data": freq[i], "y_data": gdb[i] } );
      data.phase.push(   { "x_data": freq[i], "y_data": phi[i] } );
      } 

    var k = d3.keys(data);

    k.forEach( function(d) {
      data[d].color = color(d);
    });

    var fstart = data.gain[0].x_data;
    var fstop = data.gain[data.gain.length - 1].x_data;

    // X scale will fit all values within pixels 0-w
    var x_scale = d3.scale.log()
                    .range([0, w])
                    .domain([fstart, fstop]);

    // X scale will fit all values within pixels h-0 (note, scale is inverted
    // so bigger is up) 

    // y_left_scale = d3.scale.linear()
    //                     .range([h, 0])
    //                     .domain(d3.extent(data.gain, function(d) { return d.y_data; }));

    // y_right_scale = d3.scale.linear()
    //                     .range([h, 0])
    //                     .domain(d3.extent(data.phase, function(d) { return d.y_data; }));

    y_left_scale = d3.scale.linear()
                        .range([h, 0])
                        .domain([-100,80]);

    y_right_scale = d3.scale.linear()
                        .range([h, 0])
                        .domain([-180,0]);

    var leftLine = d3.svg.line()
                    .x( function(d) { return x_scale(d.x_data); } )  
                    .y( function(d) { return y_left_scale(d.y_data); } )
                    .interpolate("linear");
    
    var rightLine = d3.svg.line()
                    .x( function(d) { return x_scale(d.x_data); } )  
                    .y( function(d) { return y_right_scale(d.y_data); } )
                    .interpolate("linear");

    // create xAxis
    
    xAxisMinor = d3.svg.axis()
              .scale(x_scale)
              .orient("bottom")
              .tickFormat( "" )
              .tickSize(-h);

    xAxisMajor = d3.svg.axis()
              .scale(x_scale)
              .orient("bottom")
              .tickValues([10,100,1000,10000,100000,1000000,10000000])
              .tickFormat( d3.format("s") )
              .tickSize(-h);

    // create left and right yAxes
    yAxisLeft = d3.svg.axis()
                  .scale(y_left_scale)
                  .orient("left")
                  .tickSize(-w)
                  .ticks(9);

    yAxisRight = d3.svg.axis()
                  .scale(y_right_scale)
                  .orient("right")
                  .tickSize(-w)
                  .ticks(9);

    // Add the y-axis to the left
    graph.append("svg:g")
          .attr("class", "y axis")
          .attr("id", "yAxisOlGain")
          .attr("transform", "translate(" + m[0] + "," + m[1] + ")")
          .call(yAxisLeft);

    // Add the y-axis to the right
    graph.append("svg:g")
          .attr("class", "y axis")
          .attr("id", "yAxisOlPm")
          .attr("transform", "translate("+(w + m[0])+"," + m[1] + ")")
          .call(yAxisRight);

    // add the graph title
    graph.append("text")
          .attr("text-anchor", "middle")
          .attr("transform", "translate("+ (w/2 + m[0]) +","+ (-m[0]/2 + m[1])+")")
          .attr("font-size", "18")
          .text("Open Loop Gain and Phase");

    // add the x axis label
    graph.append("text")
          .attr("text-anchor", "middle")
          .attr("transform", "translate("+ (w/2 + m[0]) +","+ (h+m[0]/2 + m[1])+")")
          .text("Offset Frequency in Hz");

    // add the left y axis label
    graph.append("text")
          .attr("text-anchor", "middle")
          .attr("transform", "translate("+ (-m[1]/2 + m[0]) +","+ (h/2 + m[1])+")rotate(-90)")
          .text("Gain in dB");

    // add the left y axis label
    graph.append("text")
          .attr("text-anchor", "middle")
          .attr("transform", "translate("+ (w+m[1]/1.5 + m[0]) +","+ (h/2 + m[1])+")rotate(-90)")
          .text("Phase in degrees");

    graph.append("svg:g")
          .attr("class", "x axis")
          .attr("id", "xAxisMinor")
          .attr("transform", "translate(" + m[0] + "," + (h + m[1]) + ")")
          .call(xAxisMinor)
            .classed("minor", true);

    graph.append("svg:g")
          .attr("class", "x axis")
          .attr("id", "xAxisMajor")
          .attr("transform", "translate(" + m[0] + "," + (h + m[1]) + ")")
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

    graph.append("path")
            .attr("class", "line")
            .attr("id", "ol_gain")
            .attr("d", leftLine(data.gain) )
            .attr("fill", "none")
            .attr("clip-path", "url(#rect-clip)")
            .attr("transform", "translate(" + m[0] + "," + (m[1]) + ")")
            .style("stroke", data.gain.color); 

    graph.append("path")
            .attr("class", "line")
            .attr("id", "ol_phase_margin")
            .attr("d", rightLine(data.phase) )
            .attr("fill", "none")
            .attr("clip-path", "url(#rect-clip)")
            .attr("transform", "translate(" + m[0] + "," + (m[1]) + ")")
            .style("stroke", data.phase.color); 

    var y_legend = 60;
    var left_legend = m[1] + 50;
    var right_legend = w ;

    var legend = graph.append('g')
                  .attr("class", "legend");

    legend.append("rect")
            .attr("x", left_legend)
            .attr("y", y_legend )
            .attr("height", 10)
            .attr("width", 10)
            .style("fill", data["gain"].color );

    legend.append("text")
            .attr("x", left_legend + 15 )
            .attr("y", y_legend + 9)
            .text("gain");

    legend.append("rect")
            .attr("x", right_legend)
            .attr("y", y_legend )
            .attr("height", 10)
            .attr("width", 10)
            .style("fill", data["phase"].color );

    legend.append("text")
            .attr("x", right_legend + 15 )
            .attr("y", y_legend + 9)
            .text("phase");
}


/* updates the open loop simulation graph
 * with the new data
 * @param {Array} gdb - open loop gain array in db
 * @param {Array} phi - open loop phase margin array in degrees
 * @param {Array} freq - frequency array in Hz
 * @param {Number} dur - duration of graph transition
*/
function updateGainPhaseMarginGraph (gdb, phi, freq, dur=500) {
    // get the line data
    var data = { 
            "gain":        [],
            "phase":       []
            };

    for ( i=0; i<freq.length; i++ ) {

      data.gain.push(    { "x_data": freq[i], "y_data": gdb[i] } );
      data.phase.push(   { "x_data": freq[i], "y_data": phi[i] } );
      } 

    var fstart = data.gain[0].x_data;
    var fstop = data.gain[data.gain.length - 1].x_data;

    // X scale will fit all values within pixels 0-w
    var x_scale = d3.scale.log()
                    .range([0, w])
                    .domain([fstart, fstop]);

    // y_left_scale.domain(d3.extent(data.gain, function(d) { return d.y_data; }));

    // y_right_scale.domain(d3.extent(data.phase, function(d) { return d.y_data; }));

    var leftLine = d3.svg.line()
                    .x( function(d) { return x_scale(d.x_data); } )  
                    .y( function(d) { return y_left_scale(d.y_data); } )
                    .interpolate("linear");
    
    var rightLine = d3.svg.line()
                    .x( function(d) { return x_scale(d.x_data); } )  
                    .y( function(d) { return y_right_scale(d.y_data); } )
                    .interpolate("linear");


    var graph = d3.select("#pmGraph").transition();

    graph.select("#xAxisMinor")
            .transition()
            .duration(dur)
            .call(xAxisMinor);

    graph.select("#xAxisMajor")
            .transition()
            .duration(dur)
            .call(xAxisMajor);

    // graph.select("#yAxisOlPm")
    //         .transition()
    //         .duration(dur)
    //         .call(yAxisRight);
    // 
    // graph.select("#yAxisOlGain")
    //         .transition()
    //         .duration(dur)
    //         .call(yAxisLeft);

    graph.select("#ol_gain")
            .duration(dur)
            .attr("d", leftLine(data.gain) );

    graph.select("#ol_phase_margin")
            .duration(dur)
            .attr("d", rightLine(data.phase) );
}

///////////////////////////////////////////////////////////////////////////////////////
//
//  CLOSED LOOP RESPONSE GRAPHS
//
///////////////////////////////////////////////////////////////////////////////////////
//
//
//
/* Sets up the initial open-loop gain and phase margin graph
 * */
function plotClosedLoop ( clRef, clVco, freq) {

    // define dimensions of graph

    width = 700;
    height = 500;
    m = [80, 80, 80, 80]; // margins
    w = width - m[1] - m[3]; // width
    h  = height - m[0] - m[2]; // height

    // Add an SVG element with the desired dimensions and margin.
    var graph = d3.select("#clGraph")
          .append("svg")
          .attr("preserveAspectRatio", "xMinYMin meet")
          .attr("viewBox", "0 0 700 500")
          .classed("svg-content-responsive", true);
          // .attr("transform", "translate(0,0)");
          // .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

    linedata = [];
    for ( i=0; i<freq.length; i++ ) {
      linedata.push( { "x": freq[i],   "y": clRef[i],   "p": clVco[i]} );
    }
    
    var fstart = linedata[0].x;
    var fstop = linedata[linedata.length - 1].x;

    // X scale will fit all values within pixels 0-w
    x_cl = d3.scale.log()
              .range([0, w]);

    // X scale will fit all values within pixels h-0 (note, scale is inverted
    // so bigger is up) 
    y_cl = d3.scale.linear()
                .range([h, 0]);

    y2_cl = d3.scale.linear()
                .range([h, 0]);

    // Create the line function. Note the function is returning the scaled
    // value. For example x(d.x) means the x-scaled value of our data d.x.
    var linefunction = d3.svg.line() 
                          .x( function(d) { 
                            return x_cl(d.x); } )  
                          .y( function(d) { 
                            return y_cl(d.y); } )
                          .interpolate("linear");

    // Create the line function. Note the function is returning the scaled
    // value. For example y(d.y) means the x-scaled value of our data d.y.
    var linefunction2 = d3.svg.line() 
                          .x( function(d) { 
                            return x_cl(d.x); } )  
                          .y( function(d) { 
                            return y2_cl(d.p); } )
                          .interpolate("linear");

    // set the domain for our x-axis (frequency)
    x_cl.domain([fstart, fstop]);

   	// automatically determining max range can work something like this
   	// var y = d3.scale.linear().domain([0, d3.max(data)]).range([h, 0]);
    y_cl.domain(d3.extent(linedata, function(d) { return d.y; }));
    y2_cl.domain(d3.extent(linedata, function(d) { return d.p; }));

    // create xAxis
    
    xAxisMinorCl = d3.svg.axis()
                  .scale(x_cl)
                  .orient("bottom")
                  .tickFormat( "" )
                  .tickSize(-h);

    xAxisMajorCl = d3.svg.axis()
                  .scale(x_cl)
                  .orient("bottom")
                  .tickValues([10,100,1000,10000,100000,1000000,10000000])
                  .tickFormat( d3.format("s") )
                  .tickSize(-h);

    // create left and right yAxes
    yAxisLeftCl = d3.svg.axis()
                      .scale(y_cl)
                      .orient("left")
                      .ticks(6);

    yAxisRightCl = d3.svg.axis()
                      .scale(y2_cl)
                      .orient("right")
                      .ticks(4);

    // Add the y-axis to the left
    graph.append("svg:g")
          .attr("class", "y axis")
          .attr("id", "yAxisClRef")
          .attr("transform", "translate(" + m[0] + "," + m[1] + ")")
          .call(yAxisLeftCl);


    // Add the y-axis to the right
    graph.append("svg:g")
          .attr("class", "y axis")
          .attr("id", "yAxisClVco")
          .attr("transform", "translate("+(w + m[0])+"," + m[1] + ")")
          .call(yAxisRightCl);

    // add the graph title
    graph.append("text")
          .attr("text-anchor", "middle")
          .attr("transform", "translate("+ (w/2 + m[0]) +","+ (-m[0]/2 + m[1])+")")
          .attr("font-size", "18")
          .text("Closed Loop Response");

    // add the x axis label
    graph.append("text")
          .attr("text-anchor", "middle")
          .attr("transform", "translate("+ (w/2 + m[0]) +","+ (h+m[0]/2 + m[1])+")")
          .text("Offset Frequency in Hz");

    // add the left y axis label
    graph.append("text")
          .attr("text-anchor", "middle")
          .attr("transform", "translate("+ (-m[1]/2 + m[0]) +","+ (h/2 + m[1])+")rotate(-90)")
          .text("Reference Transfer Gain (dB)");

    // add the left y axis label
    graph.append("text")
          .attr("text-anchor", "middle")
          .attr("transform", "translate("+ (w+m[1]/1.5 + m[0]) +","+ (h/2 + m[1])+")rotate(-90)")
          .text("VCO Transfer Gain (dB)");

    graph.append("svg:g")
          .attr("class", "x axis")
          .attr("id", "xAxisMinor")
          .attr("transform", "translate(" + m[0] + "," + (h+m[1]) + ")")
          .call(xAxisMinor)
            .classed("minor", true);

    graph.append("svg:g")
          .attr("class", "x axis")
          .attr("id", "xAxisMajor")
          .attr("transform", "translate(" + m[0] + "," + (h+m[1]) + ")")
          .call(xAxisMajor);

    // Add the line by appending an svg:path element with the data line we created above
    // do this AFTER the axes above so that the line is above the tick-lines
    var color = d3.scale.category10();
    graph.append("path")
            .attr("class", "line")
            .attr("id", "cl_ref")
            .attr("d", linefunction(linedata) )
            .attr("fill", "none")
            .attr("transform", "translate(" + m[0] + "," + (m[1]) + ")")
            .style("stroke", color(0));
    graph.append("path")
            .attr("class", "line")
            .attr("id", "cl_vco")
            .attr("d", linefunction2(linedata) )
            .attr("fill", "none")
            .attr("transform", "translate(" + m[0] + "," + (m[1]) + ")")
            .style("stroke", color(1));

    var y_legend = 60;
    var left_legend = m[1] + 50;
    var right_legend = w ;

    var legend = graph.append('g')
                  .attr("class", "legend");

    legend.append("rect")
            .attr("x", left_legend)
            .attr("y", y_legend )
            .attr("height", 10)
            .attr("width", 10)
            .style("fill", color(0) );

    legend.append("text")
            .attr("x", left_legend + 15 )
            .attr("y", y_legend + 9)
            .text("reference");

    legend.append("rect")
            .attr("x", right_legend)
            .attr("y", y_legend )
            .attr("height", 10)
            .attr("width", 10)
            .style("fill", color(1) );

    legend.append("text")
            .attr("x", right_legend + 15 )
            .attr("y", y_legend + 9)
            .text("vco");
}


/* updates the closed loop simulation graph
 * with the new data
 * @param {Array} refCl - open loop gain array in db
 * @param {Array} vcoCl - open loop phase margin array in degrees
 * @param {Array} freq - frequency array in Hz
 * @param {Number} dur - duration of graph transition
*/
function updateClosedLoopGraph (clRef, clVco, freq, dur=500) {
    // get the line data
    var linedata = [];
    for ( i=0; i<freq.length; i++ ) {
      linedata.push( { "x": freq[i],   "y": clRef[i],   "p": clVco[i]} );
    }
    // X scale will fit all values within pixels 0-w
    // var x = d3.scale.log()
    //           .range([0, w]);

    var fstart = linedata[0].x;
    var fstop = linedata[linedata.length - 1].x;

    // set the domain for our x-axis (frequency)
    x_cl.domain([fstart, fstop]);

   	// // automatically determining max range can work something like this
   	// // var y = d3.scale.linear().domain([0, d3.max(data)]).range([h, 0]);
    y_cl.domain(d3.extent(linedata, function(d) { return d.y; }));
    y2_cl.domain(d3.extent(linedata, function(d) { return d.p; }));

    // Create the line function. Note the function is returning the scaled
    // value. For example x(d.x) means the x-scaled value of our data d.x.
    var linefunction = d3.svg.line() 
                          .x( function(d) { 
                            return x_cl(d.x); } )  
                          .y( function(d) { 
                            return y_cl(d.y); } )
                          .interpolate("linear");

    // Create the line function. Note the function is returning the scaled
    // value. For example y(d.y) means the x-scaled value of our data d.y.
    var linefunction2 = d3.svg.line() 
                          .x( function(d) { 
                            return x_cl(d.x); } )  
                          .y( function(d) { 
                            return y2_cl(d.p); } )
                          .interpolate("linear");

    var graph = d3.select("#clGraph").transition();

    graph.select("#xAxisMinor")
            .transition()
            .duration(dur)
            .call(xAxisMinorCl);

    graph.select("#xAxisMajor")
            .transition()
            .duration(dur)
            .call(xAxisMajorCl);

    graph.select("#yAxisClRef")
            .transition()
            .duration(dur)
            .call(yAxisLeftCl);

    graph.select("#yAxisClVco")
            .transition()
            .duration(dur)
            .call(yAxisRightCl);
    
    graph.select("#cl_ref")
            .duration(dur)
            .attr("d", linefunction(linedata) );

    graph.select("#cl_vco")
            .duration(dur)
            .attr("d", linefunction2(linedata) );
}

///////////////////////////////////////////////////////////////////////////////////////
//
//  REFERENCE PHASE NOISE GRAPHS
//
///////////////////////////////////////////////////////////////////////////////////////

/* Sets up the initial reference phase noise plot
 * */
function plotReferencePhaseNoise ( pn, freq) {

    // define dimensions of graph

    width = 700;
    height = 500;
    m = [80, 80, 80, 80]; // margins
    w = width - m[1] - m[3]; // width
    h  = height - m[0] - m[2]; // height

    // Add an SVG element with the desired dimensions and margin.
    var graph = d3.select("#refPnGraph")
          .append("svg")
          .attr("preserveAspectRatio", "xMinYMin meet")
          .attr("viewBox", "0 0 700 500")
          .classed("svg-content-responsive", true);
          // .attr("transform", "translate(0,0)");
          // .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

    linedata = [];
    for ( i=0; i<freq.length; i++ ) {
      linedata.push( { "x": freq[i],   "y": pn[i] } );
    }
    
    var fstart = linedata[0].x;
    var fstop = linedata[linedata.length - 1].x;

    // X scale will fit all values within pixels 0-w
    x_ref = d3.scale.log()
              .range([0, w]);

    // X scale will fit all values within pixels h-0 (note, scale is inverted
    // so bigger is up) 
    y_ref = d3.scale.linear()
                .range([h, 0]);

    // Create the line function. Note the function is returning the scaled
    // value. For example x(d.x) means the x-scaled value of our data d.x.
    var linefunction = d3.svg.line() 
                          .x( function(d) { 
                            //console.log("plotting x point at x = " + d.x );
                            return x_ref(d.x); } )  
                          .y( function(d) { 
                            //console.log("plotting y point at y = " + d.y );
                            return y_ref(d.y); } )
                          .interpolate("linear");

    // set the domain for our x-axis (frequency)
    x_ref.domain([fstart, fstop]);

   	// automatically determining max range can work something like this
   	// var y = d3.scale.linear().domain([0, d3.max(data)]).range([h, 0]);
    y_ref.domain(d3.extent(linedata, function(d) { return d.y; }));

    // create xAxis
    
    xAxisMinorRef = d3.svg.axis()
                  .scale(x_ref)
                  .orient("bottom")
                  .tickFormat( "" )
                  .tickSize(-h);

    xAxisMajorRef = d3.svg.axis()
                  .scale(x_ref)
                  .orient("bottom")
                  .tickValues([10,100,1000,10000,100000,1000000,10000000])
                  .tickFormat( d3.format("s") )
                  .tickSize(-h);

    // create left and right yAxes
    yAxisLeftRef = d3.svg.axis()
                      .scale(y_ref)
                      .orient("left")
                      .tickSize(-w)
                      .ticks(6);

    // Add the y-axis to the left
    graph.append("svg:g")
          .attr("class", "y axis")
          .attr("id", "yAxisLeftRef")
          .attr("transform", "translate(" + m[0] + "," + m[1] + ")")
          .call(yAxisLeftRef);

    // add the graph title
    graph.append("text")
          .attr("text-anchor", "middle")
          .attr("transform", "translate("+ (w/2 + m[0]) +","+ (-m[0]/2 + m[1])+")")
          .attr("font-size", "18")
          .text("Phase Noise of Reference Input");

    // add the x axis label
    graph.append("text")
          .attr("text-anchor", "middle")
          .attr("transform", "translate("+ (w/2 + m[0]) +","+ (h+m[0]/2 + m[1])+")")
          .text("Offset Frequency in Hz");

    // add the left y axis label
    graph.append("text")
          .attr("text-anchor", "middle")
          .attr("transform", "translate("+ (-m[1]/2 + m[0]) +","+ (h/2 + m[1])+")rotate(-90)")
          .text("Phase Noise (dBc/Hz)");

    graph.append("svg:g")
          .attr("class", "x axis")
          .attr("id", "xAxisMinorRef")
          .attr("transform", "translate(" + m[0] + "," + (h+m[1]) + ")")
          .call(xAxisMinorRef)
            .classed("minor", true);

    graph.append("svg:g")
          .attr("class", "x axis")
          .attr("id", "xAxisMajorRef")
          .attr("transform", "translate(" + m[0] + "," + (h+m[1]) + ")")
          .call(xAxisMajorRef);

    // Add the line by appending an svg:path element with the data line we created above
    // do this AFTER the axes above so that the line is above the tick-lines
    var color = d3.scale.category10();
    graph.append("path")
            .attr("class", "line")
            .attr("id", "ref_pn")
            .attr("d", linefunction(linedata) )
            .attr("fill", "none")
            .attr("transform", "translate(" + m[0] + "," + (m[1]) + ")")
            .style("stroke", color(0));

}


/* updates the reference phase noise with new data
 * with the new data
 * @param {Array} pn - open loop gain array in db
 * @param {Array} freq - frequency array in Hz
 * @param {Number} dur - duration of graph transition
*/
function updateReferencePhaseNoise(pns, freq, dur=500) {
    // get the line data
    var linedata = [];
    for ( i=0; i<freq.length; i++ ) {
      linedata.push( { "x": freq[i],   "y": pns[i], } );
    }
    // X scale will fit all values within pixels 0-w
    // var x = d3.scale.log()
    //           .range([0, w]);

    var fstart = linedata[0].x;
    var fstop = linedata[linedata.length - 1].x;

    // set the domain for our x-axis (frequency)
    x_ref.domain([fstart, fstop]);

   	// // automatically determining max range can work something like this
   	// // var y = d3.scale.linear().domain([0, d3.max(data)]).range([h, 0]);
    y_ref.domain(d3.extent(linedata, function(d) { return d.y; }));

    // Create the line function. Note the function is returning the scaled
    // value. For example x(d.x) means the x-scaled value of our data d.x.
    var linefunction = d3.svg.line() 
                          .x( function(d) { 
                            return x_ref(d.x); } )  
                          .y( function(d) { 
                            return y_ref(d.y); } )
                          .interpolate("linear");

    var graph = d3.select("#refPnGraph").transition();

    graph.select("#xAxisMinorRef")
            .transition()
            .duration(dur)
            .call(xAxisMinorRef);

    graph.select("#xAxisMajorRef")
            .transition()
            .duration(dur)
            .call(xAxisMajorRef);

    graph.select("#yAxisLeftRef")
            .transition()
            .duration(dur)
            .call(yAxisLeftRef);

    graph.select("#ref_pn")
            .duration(dur)
            .attr("d", linefunction(linedata) );
}



///////////////////////////////////////////////////////////////////////////////////////
//
//  VCO PHASE NOISE GRAPHS
//
///////////////////////////////////////////////////////////////////////////////////////


/* Sets up the initial vco phase noise plot
 * */
function plotVcoPhaseNoise ( pn, freq) {

    // define dimensions of graph

    width = 700;
    height = 500;
    m = [80, 80, 80, 80]; // margins
    w = width - m[1] - m[3]; // width
    h  = height - m[0] - m[2]; // height

    // Add an SVG element with the desired dimensions and margin.
    var graph = d3.select("#vcoPnGraph")
          .append("svg")
          .attr("preserveAspectRatio", "xMinYMin meet")
          .attr("viewBox", "0 0 700 500")
          .classed("svg-content-responsive", true);
          // .attr("transform", "translate(0,0)");
          // .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

    linedata = [];
    for ( i=0; i<freq.length; i++ ) {
      linedata.push( { "x": freq[i],   "y": pn[i] } );
    }
    
    var fstart = linedata[0].x;
    var fstop = linedata[linedata.length - 1].x;

    // X scale will fit all values within pixels 0-w
    x_vco = d3.scale.log()
              .range([0, w]);

    // X scale will fit all values within pixels h-0 (note, scale is inverted
    // so bigger is up) 
    y_vco = d3.scale.linear()
                .range([h, 0]);

    // Create the line function. Note the function is returning the scaled
    // value. For example x(d.x) means the x-scaled value of our data d.x.
    var linefunction = d3.svg.line() 
                          .x( function(d) { 
                            //console.log("plotting x point at x = " + d.x );
                            return x_vco(d.x); } )  
                          .y( function(d) { 
                            //console.log("plotting y point at y = " + d.y );
                            return y_vco(d.y); } )
                          .interpolate("linear");

    // set the domain for our x-axis (frequency)
    x_vco.domain([fstart, fstop]);

   	// automatically determining max range can work something like this
   	// var y = d3.scale.linear().domain([0, d3.max(data)]).range([h, 0]);
    y_vco.domain(d3.extent(linedata, function(d) { return d.y; }));

    // create xAxis
    
    xAxisMinorVco = d3.svg.axis()
                  .scale(x_vco)
                  .orient("bottom")
                  .tickFormat( "" )
                  .tickSize(-h);

    xAxisMajorVco = d3.svg.axis()
                  .scale(x_vco)
                  .orient("bottom")
                  .tickValues([10,100,1000,10000,100000,1000000,10000000])
                  .tickFormat( d3.format("s") )
                  .tickSize(-h);

    // create left and right yAxes
    yAxisLeftVco = d3.svg.axis()
                      .scale(y_vco)
                      .orient("left")
                      .tickSize(-w)
                      .ticks(6);

    // Add the y-axis to the left
    graph.append("svg:g")
          .attr("class", "y axis")
          .attr("id", "yAxisLeftVco")
          .attr("transform", "translate(" + m[0] + "," + m[1] + ")")
          .call(yAxisLeftVco);

    // add the graph title
    graph.append("text")
          .attr("text-anchor", "middle")
          .attr("transform", "translate("+ (w/2 + m[0]) +","+ (-m[0]/2 + m[1])+")")
          .attr("font-size", "18")
          .text("Phase Noise of VCO");

    // add the x axis label
    graph.append("text")
          .attr("text-anchor", "middle")
          .attr("transform", "translate("+ (w/2 + m[0]) +","+ (h+m[0]/2 + m[1])+")")
          .text("Offset Frequency in Hz");

    // add the left y axis label
    graph.append("text")
          .attr("text-anchor", "middle")
          .attr("transform", "translate("+ (-m[1]/2 + m[0]) +","+ (h/2 + m[1])+")rotate(-90)")
          .text("Phase Noise (dBc/Hz)");

    graph.append("svg:g")
          .attr("class", "x axis")
          .attr("id", "xAxisMinorVco")
          .attr("transform", "translate(" + m[0] + "," + (h+m[1]) + ")")
          .call(xAxisMinorVco)
            .classed("minor", true);

    graph.append("svg:g")
          .attr("class", "x axis")
          .attr("id", "xAxisMajorVco")
          .attr("transform", "translate(" + m[0] + "," + (h+m[1]) + ")")
          .call(xAxisMajorVco);

    // Add the line by appending an svg:path element with the data line we created above
    // do this AFTER the axes above so that the line is above the tick-lines
    var color = d3.scale.category10();
    graph.append("path")
            .attr("class", "line")
            .attr("id", "vco_pn")
            .attr("d", linefunction(linedata) )
            .attr("fill", "none")
            .attr("transform", "translate(" + m[0] + "," + (m[1]) + ")")
            .style("stroke", color(0));

}


/* updates the VCO phase noise with new data
 * with the new data
 * @param {Array} pn - open loop gain array in db
 * @param {Array} freq - frequency array in Hz
 * @param {Number} dur - duration of graph transition
*/
function updateVcoPhaseNoise(pns, freq, dur=500) {
    // get the line data
    var linedata = [];
    for ( i=0; i<freq.length; i++ ) {
      linedata.push( { "x": freq[i],   "y": pns[i], } );
    }
    // X scale will fit all values within pixels 0-w
    // var x = d3.scale.log()
    //           .range([0, w]);

    var fstart = linedata[0].x;
    var fstop = linedata[linedata.length - 1].x;

    // set the domain for our x-axis (frequency)
    x_vco.domain([fstart, fstop]);

   	// // automatically determining max range can work something like this
   	// // var y = d3.scale.linear().domain([0, d3.max(data)]).range([h, 0]);
    y_vco.domain(d3.extent(linedata, function(d) { return d.y; }));

    // Create the line function. Note the function is returning the scaled
    // value. For example x(d.x) means the x-scaled value of our data d.x.
    var linefunction = d3.svg.line() 
                          .x( function(d) { 
                            return x_vco(d.x); } )  
                          .y( function(d) { 
                            return y_vco(d.y); } )
                          .interpolate("linear");

    var graph = d3.select("#vcoPnGraph").transition();

    graph.select("#xAxisMinorVco")
            .transition()
            .duration(dur)
            .call(xAxisMinorVco);

    graph.select("#xAxisMajorVco")
            .transition()
            .duration(dur)
            .call(xAxisMajorVco);
    
    graph.select("#yAxisLeftVco")
            .transition()
            .duration(dur)
            .call(yAxisLeftVco);

    graph.select("#vco_pn")
            .duration(dur)
            .attr("d", linefunction(linedata) );
}


///////////////////////////////////////////////////////////////////////////////////////
//
//  COMPOSITE PHASE NOISE GRAPHS
//
///////////////////////////////////////////////////////////////////////////////////////
//
//
//
//    f, refPn, vcoPn, icPn, icFlick, comp = simulatePhaseNoise( f,
//
/* Sets up the initial open-loop gain and phase margin graph
 * */
function plotPhaseNoise ( freq, refPn, vcoPn, icPn, comp) {

    // define dimensions of graph

    width = 700;
    height = 500;
    m = [80, 80, 80, 80]; // margins
    w = width - m[1] - m[3]; // width
    h  = height - m[0] - m[2]; // height

    var data = { 
            "reference":   [],
            "vco":         [],
            "PLL":         [],
            "composite":   []
            };

    for ( i=0; i<freq.length; i++ ) {

      data.reference.push(    { "f": freq[i], "pn": refPn[i] } );
      data.vco.push(          { "f": freq[i], "pn": vcoPn[i] } );
      data.PLL.push(          { "f": freq[i], "pn": icPn[i] } );
      data.composite.push(    { "f": freq[i], "pn": comp[i] } );
      } 
    
    var fstart = data.composite[0].f;
    var fstop = data.composite[data.composite.length - 1].f;

    // X scale will fit all values within pixels 0-w
    var x = d3.scale.log()
              .range([0, w])
              .domain([fstart, fstop]);

    // X scale will fit all values within pixels h-0 (note, scale is inverted
    // so bigger is up) 

    y_scale_pn = d3.scale.linear()
                    .range([h, 0])
                    .domain(d3.extent(data.composite, function(d) { return d.pn; }));

    // Create the line function. Note the function is returning the scaled
    // value. For example x(d.x) means the x-scaled value of our data d.x.

    var pnLine = d3.svg.line()
                    .x( function(d) { return x(d.f); } )  
                    .y( function(d) { return y_scale_pn(d.pn); } )
                    .interpolate("linear");

    // create xAxis
    
    xAxisMinorPn = d3.svg.axis()
                     .scale(x)
                     .orient("bottom")
                     .tickFormat( "" )
                     .tickSize(-h);

    xAxisMajorPn = d3.svg.axis()
                     .scale(x)
                     .orient("bottom")
                     .tickValues([10,100,1000,10000,100000,1000000,10000000])
                     .tickFormat( d3.format("s") )
                     .tickSize(-h);

    // create y axis
    yAxisPn = d3.svg.axis()
                .scale(y_scale_pn)
                .orient("left")
                .tickSize(-w)
                .ticks(6);

    // Add an SVG element with the desired dimensions and margin.
    var graph = d3.select("#pnGraph")
          .append("svg")
          .classed("svg-content-responsive", true)
          .attr("preserveAspectRatio", "xMinYMin meet")
          .attr("viewBox", "0 0 700 500");
          // .attr("transform", "translate(0,0)");
          // .attr("transform", "translate(" + m[3] + "," + m[0] + ")");
   
    // Add the y-axis to the left
    graph.append("svg:g")
          .attr("class", "y axis")
          .attr("id", "yAxisPn")
          .attr("transform", "translate(" + m[0] + "," + m[1] + ")")
          .call(yAxisPn);

    // add the graph title
    graph.append("text")
          .attr("text-anchor", "middle")
          .attr("transform", "translate("+ (w/2 + m[0]) +","+ (-m[0]/2 + m[1])+")")
          .attr("font-size", "18")
          .text("Phase Noise Contributors");

    // add the x axis label
    graph.append("text")
          .attr("text-anchor", "middle")
          .attr("transform", "translate("+ (w/2 + m[0]) +","+ (h+m[0]/2 + m[1])+")")
          .text("Offset Frequency in Hz");

    // add the left y axis label
    graph.append("text")
          .attr("text-anchor", "middle")
          .attr("transform", "translate("+ (-m[1]/2 + m[0]) +","+ (h/2 + m[1])+")rotate(-90)")
          .text("Phase Noise (dBc/Hz)");

    graph.append("svg:g")
          .attr("class", "x axis")
          .attr("id", "xAxisMinorPn")
          .attr("transform", "translate(" + m[0] + "," + (h+m[1]) + ")")
          .call(xAxisMinor)
            .classed("minor", true);

    graph.append("svg:g")
          .attr("class", "x axis")
          .attr("id", "xAxisMajorPn")
          .attr("transform", "translate(" + m[0] + "," + (h+m[1]) + ")")
          .call(xAxisMajor);

    graph.append("clipPath")
         .attr("id","pn-rect-clip")
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
              .attr("d", pnLine(data[d]) )
              .attr("fill", "none")
              .attr("clip-path", "url(#pn-rect-clip)")
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

}

/* updates the phase noise with new data
 * with the new data
 * @param {Array} pn - open loop gain array in db
 * @param {Array} freq - frequency array in Hz
 * @param {Number} dur - duration of graph transition
*/
function updatePhaseNoise ( freq, refPn, vcoPn, icPn, comp, dur=500) {
    // get the line data
    
    var data = { 
            "reference":   [],
            "vco":         [],
            "PLL":         [],
            "composite":   []
            };

    for ( i=0; i<freq.length; i++ ) {

      data.reference.push(    { "f": freq[i], "pn": refPn[i] } );
      data.vco.push(          { "f": freq[i], "pn": vcoPn[i] } );
      data.PLL.push(          { "f": freq[i], "pn": icPn[i] } );
      data.composite.push(    { "f": freq[i], "pn": comp[i] } );
      } 

    var fstart = data.composite[0].f;
    var fstop = data.composite[data.composite.length - 1].f;

    // X scale will fit all values within pixels 0-w
    var x = d3.scale.log()
              .range([0, w])
              .domain([fstart, fstop]);

    // X scale will fit all values within pixels h-0 (note, scale is inverted
    // so bigger is up) 

    y_scale_pn.domain(d3.extent(data.composite, function(d) { return d.pn; }));

    // Create the line function. Note the function is returning the scaled
    // value. For example x(d.x) means the x-scaled value of our data d.x.

    var pnLine = d3.svg.line()
                    .x( function(d) { return x(d.f); } )  
                    .y( function(d) { return y_scale_pn(d.pn); } )
                    .interpolate("linear");
    
    var graph = d3.select("#pnGraph").transition();

    graph.select("#xAxisMinorPn")
            .transition()
            .duration(dur)
            .call(xAxisMinorPn);

    graph.select("#xAxisMajorPn")
            .transition()
            .duration(dur)
            .call(xAxisMajorPn);
    
    graph.select("#yAxisPn")
            .transition()
            .duration(dur)
            .call(yAxisPn);

    var k = d3.keys(data);

    k.forEach( function(d) {
      
      graph.select("#" + d)
              .duration(dur)
              .attr("d", pnLine(data[d]) );
      
    });

}
