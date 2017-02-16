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
          .classed("svg-content-responsive", true)
          .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

    linedata = [];
    for ( i=0; i<freq.length; i++ ) {
      linedata.push( { "x": freq[i],   "y": gdb[i],   "p": phi[i]} );
    }
    
    var fstart = linedata[0].x;
    var fstop = linedata[linedata.length - 1].x;

    // X scale will fit all values within pixels 0-w
    x_ol = d3.scale.log()
              .range([0, w])
              .domain([fstart, fstop]);

    // X scale will fit all values within pixels h-0 (note, scale is inverted
    // so bigger is up) 
    y_ol = d3.scale.linear()
                .range([h, 0])
                .domain(d3.extent(linedata, function(d) { return d.y; }));

    y2_ol = d3.scale.linear()
                .range([h, 0])
                .domain(d3.extent(linedata, function(d) { return d.p; }));

    // Create the line function. Note the function is returning the scaled
    // value. For example x(d.x) means the x-scaled value of our data d.x.
    var linefunction = d3.svg.line() 
                          .x( function(d) { 
                            //console.log("plotting x point at x = " + d.x );
                            return x_ol(d.x); } )  
                          .y( function(d) { 
                            //console.log("plotting y point at y = " + d.y );
                            return y_ol(d.y); } )
                          .interpolate("linear");

    // Create the line function. Note the function is returning the scaled
    // value. For example y(d.y) means the x-scaled value of our data d.y.
    var linefunction2 = d3.svg.line() 
                          .x( function(d) { 
                            //console.log("plotting x point at x = " + d.x );
                            return x_ol(d.x); } )  
                          .y( function(d) { 
                            //console.log("plotting y point at y = " + d.y );
                            return y2_ol(d.p); } )
                          .interpolate("linear");

    // create xAxis
    
    xAxisMinor = d3.svg.axis()
              .scale(x_ol)
              .orient("bottom")
              .tickFormat( "" )
              .tickSize(-h);

    xAxisMajor = d3.svg.axis()
              .scale(x_ol)
              .orient("bottom")
              .tickValues([10,100,1000,10000,100000,1000000,10000000])
              .tickFormat( d3.format("s") )
              .tickSize(-h);

    // create left and right yAxes
    yAxisLeft = d3.svg.axis()
                  .scale(y_ol)
                  .orient("left")
                  .ticks(6);

    yAxisZeroCross = d3.svg.axis()
                  .scale(y_ol)
                  .orient("left")
                  .ticks(1)
                  .tickSize(-w)
                  .tickFormat( "" )
                  .tickValues([0]);

    yAxisRight = d3.svg.axis()
                  .scale(y2_ol)
                  .orient("right")
                  .ticks(4);

    // Add the y-axis to the left
    graph.append("svg:g")
          .attr("class", "y axis")
          .attr("id", "yAxisOlGain")
          .style("fill","steelblue")
          // .attr("transform", "translate(0,0)")
          .attr("transform", "translate(" + m[0] + "," + m[1] + ")")
          .call(yAxisLeft);

    // Add the y-axis zero crossing to the left
    graph.append("svg:g")
          .attr("class", "y axis")
          .attr("id", "yAxisZeroCross")
          .style("fill","steelblue")
          // .attr("transform", "translate(0,0)")
          .attr("transform", "translate(" + m[0] + "," + m[1] + ")")
          .call(yAxisZeroCross);

    // Add the y-axis to the right
    graph.append("svg:g")
          .attr("class", "y axis")
          .attr("id", "yAxisOlPm")
          .style("fill","red")
          // .attr("transform", "translate("+(w)+",0)")
          .attr("transform", "translate("+(w + m[0])+"," + m[1] + ")")
          .call(yAxisRight);

    // add the graph title
    graph.append("text")
          .attr("text-anchor", "middle")
          // .attr("transform", "translate("+ (w/2) +","+ (-m[0]/2)+")")
          .attr("transform", "translate("+ (w/2 + m[0]) +","+ (-m[0]/2 + m[1])+")")
          .attr("font-size", "18")
          .text("Open Loop Gain and Phase Margin");

    // add the x axis label
    graph.append("text")
          .attr("text-anchor", "middle")
          // .attr("transform", "translate("+ (w/2) +","+ (h+m[0]/2)+")")
          .attr("transform", "translate("+ (w/2 + m[0]) +","+ (h+m[0]/2 + m[1])+")")
          .text("Offset Frequency in Hz");

    // add the left y axis label
    graph.append("text")
          .attr("text-anchor", "middle")
          // .attr("transform", "translate("+ (-m[1]/2) +","+ (h/2)+")rotate(-90)")
          .attr("transform", "translate("+ (-m[1]/2 + m[0]) +","+ (h/2 + m[1])+")rotate(-90)")
          .attr("fill", "steelblue")
          .text("Gain in dB");

    // add the left y axis label
    graph.append("text")
          .attr("text-anchor", "middle")
          // .attr("transform", "translate("+ (w+m[1]/2) +","+ (h/2)+")rotate(-90)")
          .attr("transform", "translate("+ (w+m[1]/1.5 + m[0]) +","+ (h/2 + m[1])+")rotate(-90)")
          .attr("fill", "red")
          .text("Phase Margin in degrees");

    graph.append("svg:g")
          .attr("class", "x axis")
          .attr("id", "xAxisMinor")
          // .attr("transform", "translate(0," + h + ")")
          .attr("transform", "translate(" + m[0] + "," + (h+m[1]) + ")")
          .call(xAxisMinor)
            .classed("minor", true);

    graph.append("svg:g")
          .attr("class", "x axis")
          .attr("id", "xAxisMajor")
          // .attr("transform", "translate(0," + h + ")")
          .attr("transform", "translate(" + m[0] + "," + (h+m[1]) + ")")
          .call(xAxisMajor);

    // Add the line by appending an svg:path element with the data line we created above
    // do this AFTER the axes above so that the line is above the tick-lines
    graph.append("path")
            .attr("class", "line")
            .attr("id", "ol_gain")
            .attr("d", linefunction(linedata) )
            .attr("fill", "none")
            .attr("transform", "translate(" + m[0] + "," + (m[1]) + ")")
            .style("stroke", "steelblue");
    graph.append("path")
            .attr("class", "line")
            .attr("id", "ol_phase_margin")
            .attr("d", linefunction2(linedata) )
            .attr("fill", "none")
            .attr("transform", "translate(" + m[0] + "," + (m[1]) + ")")
            .style("stroke", "red");

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
    var linedata = [];
    for ( i=0; i<freq.length; i++ ) {
      linedata.push( { "x": freq[i],   "y": gdb[i],   "p": phi[i]} );
    }
    // // X scale will fit all values within pixels 0-w
    // var x = d3.scale.log()
    //           .range([0, w]);

    var fstart = linedata[0].x;
    var fstop = linedata[linedata.length - 1].x;

    // set the domain for our x-axis (frequency)
    x_ol.domain([fstart, fstop]);

   	// // automatically determining max range can work something like this
   	// // var y = d3.scale.linear().domain([0, d3.max(data)]).range([h, 0]);
    y_ol.domain(d3.extent(linedata, function(d) { return d.y; }));

    y2_ol.domain(d3.extent(linedata, function(d) { return d.p; }));

    // Create the line function. Note the function is returning the scaled
    // value. For example x(d.x) means the x-scaled value of our data d.x.
    var linefunction = d3.svg.line() 
                          .x( function(d) { 
                            return x_ol(d.x); } )  
                          .y( function(d) { 
                            return y_ol(d.y); } )
                          .interpolate("linear");

    // Create the line function. Note the function is returning the scaled
    // value. For example y(d.y) means the x-scaled value of our data d.y.
    var linefunction2 = d3.svg.line() 
                          .x( function(d) { 
                            return x_ol(d.x); } )  
                          .y( function(d) { 
                            return y2_ol(d.p); } )
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

    graph.select("#yAxisOlPm")
            .transition()
            .duration(dur)
            .call(yAxisRight);
    
    graph.select("#yAxisOlGain")
            .transition()
            .duration(dur)
            .call(yAxisLeft);

    graph.select("#yAxisZeroCross")
            .transition()
            .duration(dur)
            .call(yAxisZeroCross);

    graph.select("#ol_gain")
            .duration(dur)
            .attr("d", linefunction(linedata) );

    graph.select("#ol_phase_margin")
            .duration(dur)
            .attr("d", linefunction2(linedata) );
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
          .classed("svg-content-responsive", true)
          .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

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
          .style("fill","steelblue")
          .attr("transform", "translate(" + m[0] + "," + m[1] + ")")
          .call(yAxisLeft);


    // Add the y-axis to the right
    graph.append("svg:g")
          .attr("class", "y axis")
          .attr("id", "yAxisClVco")
          .style("fill","red")
          .attr("transform", "translate("+(w + m[0])+"," + m[1] + ")")
          .call(yAxisRight);

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
          .attr("fill", "steelblue")
          .text("Reference Transfer Gain (dB)");

    // add the left y axis label
    graph.append("text")
          .attr("text-anchor", "middle")
          .attr("transform", "translate("+ (w+m[1]/1.5 + m[0]) +","+ (h/2 + m[1])+")rotate(-90)")
          .attr("fill", "red")
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
    graph.append("path")
            .attr("class", "line")
            .attr("id", "cl_ref")
            .attr("d", linefunction(linedata) )
            .attr("fill", "none")
            .attr("transform", "translate(" + m[0] + "," + (m[1]) + ")")
            .style("stroke", "steelblue");
    graph.append("path")
            .attr("class", "line")
            .attr("id", "cl_vco")
            .attr("d", linefunction2(linedata) )
            .attr("fill", "none")
            .attr("transform", "translate(" + m[0] + "," + (m[1]) + ")")
            .style("stroke", "red");

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
          .classed("svg-content-responsive", true)
          .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

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
                      .ticks(6);

    // Add the y-axis to the left
    graph.append("svg:g")
          .attr("class", "y axis")
          .attr("id", "yAxisLeftRef")
          .style("fill","steelblue")
          // .attr("transform", "translate(0,0)")
          .attr("transform", "translate(" + m[0] + "," + m[1] + ")")
          .call(yAxisLeftRef);

    // add the graph title
    graph.append("text")
          .attr("text-anchor", "middle")
          // .attr("transform", "translate("+ (w/2) +","+ (-m[0]/2)+")")
          .attr("transform", "translate("+ (w/2 + m[0]) +","+ (-m[0]/2 + m[1])+")")
          .attr("font-size", "18")
          .text("Phase Noise of Reference Input");

    // add the x axis label
    graph.append("text")
          .attr("text-anchor", "middle")
          // .attr("transform", "translate("+ (w/2) +","+ (h+m[0]/2)+")")
          .attr("transform", "translate("+ (w/2 + m[0]) +","+ (h+m[0]/2 + m[1])+")")
          .text("Offset Frequency in Hz");

    // add the left y axis label
    graph.append("text")
          .attr("text-anchor", "middle")
          // .attr("transform", "translate("+ (-m[1]/2) +","+ (h/2)+")rotate(-90)")
          .attr("transform", "translate("+ (-m[1]/2 + m[0]) +","+ (h/2 + m[1])+")rotate(-90)")
          .attr("fill", "steelblue")
          .text("Phase Noise (dBc/Hz)");

    graph.append("svg:g")
          .attr("class", "x axis")
          .attr("id", "xAxisMinorRef")
          // .attr("transform", "translate(0," + h + ")")
          .attr("transform", "translate(" + m[0] + "," + (h+m[1]) + ")")
          .call(xAxisMinorRef)
            .classed("minor", true);

    graph.append("svg:g")
          .attr("class", "x axis")
          .attr("id", "xAxisMajorRef")
          // .attr("transform", "translate(0," + h + ")")
          .attr("transform", "translate(" + m[0] + "," + (h+m[1]) + ")")
          .call(xAxisMajorRef);

    // Add the line by appending an svg:path element with the data line we created above
    // do this AFTER the axes above so that the line is above the tick-lines
    graph.append("path")
            .attr("class", "line")
            .attr("id", "ref_pn")
            .attr("d", linefunction(linedata) )
            .attr("fill", "none")
            .attr("transform", "translate(" + m[0] + "," + (m[1]) + ")")
            .style("stroke", "steelblue");

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
          .classed("svg-content-responsive", true)
          .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

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
                      .ticks(6);

    // Add the y-axis to the left
    graph.append("svg:g")
          .attr("class", "y axis")
          .attr("id", "yAxisLeftVco")
          .style("fill","steelblue")
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
          .attr("fill", "steelblue")
          .text("Phase Noise (dBc/Hz)");

    graph.append("svg:g")
          .attr("class", "x axis")
          .attr("id", "xAxisMinorVco")
          // .attr("transform", "translate(0," + h + ")")
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
    graph.append("path")
            .attr("class", "line")
            .attr("id", "vco_pn")
            .attr("d", linefunction(linedata) )
            .attr("fill", "none")
            .attr("transform", "translate(" + m[0] + "," + (m[1]) + ")")
            .style("stroke", "steelblue");

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


