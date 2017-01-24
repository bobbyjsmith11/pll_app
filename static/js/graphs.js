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
    x = d3.scale.log()
              .range([0, w]);

    // X scale will fit all values within pixels h-0 (note, scale is inverted
    // so bigger is up) 
    y = d3.scale.linear()
                .range([h, 0]);

    y2 = d3.scale.linear()
                .range([h, 0]);

    // Create the line function. Note the function is returning the scaled
    // value. For example x(d.x) means the x-scaled value of our data d.x.
    var linefunction = d3.svg.line() 
                          .x( function(d) { 
                            //console.log("plotting x point at x = " + d.x );
                            return x(d.x); } )  
                          .y( function(d) { 
                            //console.log("plotting y point at y = " + d.y );
                            return y(d.y); } )
                          .interpolate("linear");

    // Create the line function. Note the function is returning the scaled
    // value. For example y(d.y) means the x-scaled value of our data d.y.
    var linefunction2 = d3.svg.line() 
                          .x( function(d) { 
                            //console.log("plotting x point at x = " + d.x );
                            return x(d.x); } )  
                          .y( function(d) { 
                            //console.log("plotting y point at y = " + d.y );
                            return y2(d.p); } )
                          .interpolate("linear");

    // set the domain for our x-axis (frequency)
    x.domain([fstart, fstop]);

   	// automatically determining max range can work something like this
   	// var y = d3.scale.linear().domain([0, d3.max(data)]).range([h, 0]);
    y.domain(d3.extent(linedata, function(d) { return d.y; }));
    y2.domain(d3.extent(linedata, function(d) { return d.p; }));

    // create xAxis
    
    xAxisMinor = d3.svg.axis()
                  .scale(x)
                  .orient("bottom")
                  .tickFormat( "" )
                  .tickSize(-h);

    xAxisMajor = d3.svg.axis()
                  .scale(x)
                  .orient("bottom")
                  .tickValues([10,100,1000,10000,100000,1000000,10000000])
                  .tickFormat( d3.format("s") )
                  .tickSize(-h);

    // create left and right yAxes
    yAxisLeft = d3.svg.axis()
                      .scale(y)
                      .orient("left")
                      .ticks(6);
    yAxisZeroCross = d3.svg.axis()
                      .scale(y)
                      .orient("left")
                      .ticks(1)
                      .tickSize(-w)
                      .tickFormat( "" )
                      .tickValues([0]);

    yAxisRight = d3.svg.axis()
                      .scale(y2)
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
          .attr("transform", "translate("+ (w+m[1]/2 + m[0]) +","+ (h/2 + m[1])+")rotate(-90)")
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
    // X scale will fit all values within pixels 0-w
    var x = d3.scale.log()
              .range([0, w]);

    var fstart = linedata[0].x;
    var fstop = linedata[linedata.length - 1].x;

    // set the domain for our x-axis (frequency)
    x.domain([fstart, fstop]);

   	// // automatically determining max range can work something like this
   	// // var y = d3.scale.linear().domain([0, d3.max(data)]).range([h, 0]);
    y.domain(d3.extent(linedata, function(d) { return d.y; }));
    y2.domain(d3.extent(linedata, function(d) { return d.p; }));

    // Create the line function. Note the function is returning the scaled
    // value. For example x(d.x) means the x-scaled value of our data d.x.
    var linefunction = d3.svg.line() 
                          .x( function(d) { 
                            return x(d.x); } )  
                          .y( function(d) { 
                            return y(d.y); } )
                          .interpolate("linear");

    // Create the line function. Note the function is returning the scaled
    // value. For example y(d.y) means the x-scaled value of our data d.y.
    var linefunction2 = d3.svg.line() 
                          .x( function(d) { 
                            return x(d.x); } )  
                          .y( function(d) { 
                            return y2(d.p); } )
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
    x = d3.scale.log()
              .range([0, w]);

    // X scale will fit all values within pixels h-0 (note, scale is inverted
    // so bigger is up) 
    y = d3.scale.linear()
                .range([h, 0]);

    // Create the line function. Note the function is returning the scaled
    // value. For example x(d.x) means the x-scaled value of our data d.x.
    var linefunction = d3.svg.line() 
                          .x( function(d) { 
                            //console.log("plotting x point at x = " + d.x );
                            return x(d.x); } )  
                          .y( function(d) { 
                            //console.log("plotting y point at y = " + d.y );
                            return y(d.y); } )
                          .interpolate("linear");

    // set the domain for our x-axis (frequency)
    x.domain([fstart, fstop]);

   	// automatically determining max range can work something like this
   	// var y = d3.scale.linear().domain([0, d3.max(data)]).range([h, 0]);
    y.domain(d3.extent(linedata, function(d) { return d.y; }));

    // create xAxis
    
    xAxisMinor = d3.svg.axis()
                  .scale(x)
                  .orient("bottom")
                  .tickFormat( "" )
                  .tickSize(-h);

    xAxisMajor = d3.svg.axis()
                  .scale(x)
                  .orient("bottom")
                  .tickValues([10,100,1000,10000,100000,1000000,10000000])
                  .tickFormat( d3.format("s") )
                  .tickSize(-h);

    // create left and right yAxes
    yAxisLeft = d3.svg.axis()
                      .scale(y)
                      .orient("left")
                      .ticks(6);

    // Add the y-axis to the left
    graph.append("svg:g")
          .attr("class", "y axis")
          .attr("id", "yAxisLeft")
          .style("fill","steelblue")
          // .attr("transform", "translate(0,0)")
          .attr("transform", "translate(" + m[0] + "," + m[1] + ")")
          .call(yAxisLeft);

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
    var x = d3.scale.log()
              .range([0, w]);

    var fstart = linedata[0].x;
    var fstop = linedata[linedata.length - 1].x;

    // set the domain for our x-axis (frequency)
    x.domain([fstart, fstop]);

   	// // automatically determining max range can work something like this
   	// // var y = d3.scale.linear().domain([0, d3.max(data)]).range([h, 0]);
    y.domain(d3.extent(linedata, function(d) { return d.y; }));

    // Create the line function. Note the function is returning the scaled
    // value. For example x(d.x) means the x-scaled value of our data d.x.
    var linefunction = d3.svg.line() 
                          .x( function(d) { 
                            return x(d.x); } )  
                          .y( function(d) { 
                            return y(d.y); } )
                          .interpolate("linear");

    var graph = d3.select("#refPnGraph").transition();

    graph.select("#xAxisMinor")
            .transition()
            .duration(dur)
            .call(xAxisMinor);

    graph.select("#xAxisMajor")
            .transition()
            .duration(dur)
            .call(xAxisMajor);

    graph.select("#yAxisLeft")
            .transition()
            .duration(dur)
            .call(yAxisLeft);

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
    x = d3.scale.log()
              .range([0, w]);

    // X scale will fit all values within pixels h-0 (note, scale is inverted
    // so bigger is up) 
    y = d3.scale.linear()
                .range([h, 0]);

    // Create the line function. Note the function is returning the scaled
    // value. For example x(d.x) means the x-scaled value of our data d.x.
    var linefunction = d3.svg.line() 
                          .x( function(d) { 
                            //console.log("plotting x point at x = " + d.x );
                            return x(d.x); } )  
                          .y( function(d) { 
                            //console.log("plotting y point at y = " + d.y );
                            return y(d.y); } )
                          .interpolate("linear");

    // set the domain for our x-axis (frequency)
    x.domain([fstart, fstop]);

   	// automatically determining max range can work something like this
   	// var y = d3.scale.linear().domain([0, d3.max(data)]).range([h, 0]);
    y.domain(d3.extent(linedata, function(d) { return d.y; }));

    // create xAxis
    
    xAxisMinor = d3.svg.axis()
                  .scale(x)
                  .orient("bottom")
                  .tickFormat( "" )
                  .tickSize(-h);

    xAxisMajor = d3.svg.axis()
                  .scale(x)
                  .orient("bottom")
                  .tickValues([10,100,1000,10000,100000,1000000,10000000])
                  .tickFormat( d3.format("s") )
                  .tickSize(-h);

    // create left and right yAxes
    yAxisLeft = d3.svg.axis()
                      .scale(y)
                      .orient("left")
                      .ticks(6);

    // Add the y-axis to the left
    graph.append("svg:g")
          .attr("class", "y axis")
          .attr("id", "yAxisLeft")
          .style("fill","steelblue")
          .attr("transform", "translate(" + m[0] + "," + m[1] + ")")
          .call(yAxisLeft);

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
          .attr("id", "xAxisMinor")
          // .attr("transform", "translate(0," + h + ")")
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
    var x = d3.scale.log()
              .range([0, w]);

    var fstart = linedata[0].x;
    var fstop = linedata[linedata.length - 1].x;

    // set the domain for our x-axis (frequency)
    x.domain([fstart, fstop]);

   	// // automatically determining max range can work something like this
   	// // var y = d3.scale.linear().domain([0, d3.max(data)]).range([h, 0]);
    y.domain(d3.extent(linedata, function(d) { return d.y; }));

    // Create the line function. Note the function is returning the scaled
    // value. For example x(d.x) means the x-scaled value of our data d.x.
    var linefunction = d3.svg.line() 
                          .x( function(d) { 
                            return x(d.x); } )  
                          .y( function(d) { 
                            return y(d.y); } )
                          .interpolate("linear");

    var graph = d3.select("#vcoPnGraph").transition();

    graph.select("#xAxisMinor")
            .transition()
            .duration(dur)
            .call(xAxisMinor);

    graph.select("#xAxisMajor")
            .transition()
            .duration(dur)
            .call(xAxisMajor);
    
    graph.select("#yAxisLeft")
            .transition()
            .duration(dur)
            .call(yAxisLeft);

    graph.select("#vco_pn")
            .duration(dur)
            .attr("d", linefunction(linedata) );
}


