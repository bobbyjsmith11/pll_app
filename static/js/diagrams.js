




// var graph = d3.select("#pmGraph").transition();

// function testFun() {
//   console.log("Hello World!");
// }

function drawBlockDiagram() {
    // Add an SVG element with the desired dimensions and margin.
   
  
  var blkDiag = d3.select("#blkDiag")
                  .append("svg")
                  .attr("width", 700)
                  .attr("height", 300)
                  .attr("preserveAspectRatio", "xMinYMin meet")
                  .attr("viewBox", "0 0 700 300")
                  .classed("svg-content-responsive", true);
  

  refX = 100;
  refY = 100;
  refR = 50;
  var refSource = blkDiag.append("circle")
                         .attr("cx", refX)
                         .attr("cy", refY)
                         .attr("r", refR)
                         .style("stroke", "steelblue")
                         .style("stroke-width", 5)
                         .style("fill", "none");
 
  // var inpFref = d3.select("#fref")
  //                 .attr("position", "absolute")
  //                 .attr("top", "0px")
  //                 .attr("left", "0px");
  // console.log(inpFref);


  var line1 = blkDiag.append("line")
                     .attr("x1", refX+refR)  
                     .attr("y1", refY)  
                     .attr("x2", refX+refR+100)
                     .attr("y2", refY)  
                     .style("stroke", "steelblue")
                     .style("stroke-width", 5);

  // var rDiv = blkDiag.append("rect")
  //                   .attr("x",200)
  //                   .attr("y",100)
  //                   .attr("width", 100)
  //                   .attr("height", 100)
  //                   .style("stroke", "steelblue")
  //                   .style("stroke-width", 5);

  var rDiv = blkDiag.append("rect")
                    .attr("x",line1.attr("x2"))
                    .attr("y",refSource.attr("cy")-refSource.attr("r"))
                    .attr("width", 100)
                    .attr("height", 100)
                    .style("stroke", "steelblue")
                    .style("stroke-width", 5)
                    .style("fill", "none");
}

