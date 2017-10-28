
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
  // s = document.getElementById("file_data").innerHTML;
  s = $("#file_data").text();
  // s = $("#file_id_num").text();
  console.log(s);
  // s = s.split(":");
  // fname = s.slice(-1);
  // fname = fname[0].split("S2P")[0] + "S2P";
  // console.log(fname);

  // my_url = "/pll_app/pll_calcs/load_s2p?"
  my_url = "/pll_app/default/load_s2p?"
  // my_url = "/pll_app/s_plot/load_s2p?";
  dat = "file_data='" + s +"'";
  
  console.log(my_url);
  // console.log(dat);
  $.ajax( {
            type: "GET",
            url: my_url,
            datatype: 'json',
            async: true,
            data: dat,
            success: function (data) {
                console.log(data);
            },
            error: function (result) {
            }
  });
  console.log("plot();");
} 
  
  
  
  
  
  
  
  
