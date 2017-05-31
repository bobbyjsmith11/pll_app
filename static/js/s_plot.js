
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



///////////////////////////////////////////////////////////////////////////////////////////////////////////
// Start of jquery stuff
// for some reason all functions need to be contained within the $(document).ready function
///////////////////////////////////////////////////////////////////////////////////////////////////////////

// $(document).ready(function() {
// 
// 	$('.upload-btn').on('click', function (){
// 	  $('#upload-input').click();
// 	  $('.progress-bar').text('0%');
// 	  $('.progress-bar').width('0%');
// 	});
// 
// });
// 
// 
// 
// 
// 
// $(document).ready(function() {
// 	$('#upload-input').on('change', function(){
// 	
// 		console.log('you pushed the upload button');
// 	  var files = $(this).get(0).files;
// 	
// 	  if (files.length > 0){
// 	    // create a FormData object which will be sent as the data payload in the
// 	    // AJAX request
// 	    var formData = new FormData();
// 	
// 	    // loop through all the selected files and add them to the formData object
// 	    for (var i = 0; i < files.length; i++) {
// 	      var file = files[i];
// 				console.log(file.name);		
// 
// 				// if (!file.type.match('*.s2p')) {
// 				// 	console.log('not a touchstone file!');
// 				// 	continue;
// 				// }
// 	      // add the files to formData object for the data payload
// 	      formData.append('uploads[]', file, file.name);
// 	    }
// 	
// 	    // $.ajax({
// 	    //   url: '/upload',
// 	    //   type: 'POST',
// 	    //   data: formData,
// 	    //   processData: false,
// 	    //   contentType: false,
// 	    //   success: function(data){
// 	    //     console.log('upload successful!\n' + JSON.stringify(data));
// 	
// 	    //     var $newPanel = $template.clone();
// 	    //     if(data.results.length === 1) {
// 	    //       $newPanel.find(".accordion-toggle").attr("href", "#" + 
// 			// 											(++hash)).text(data.results.length + " PRISC - " + 
// 			// 											moment(data.timestamp).format('MMMM Do YYYY, h:mm:ss a'));
// 	    //     }
// 	    //     else {
// 	    //       $newPanel.find(".accordion-toggle").attr("href", "#" + 
// 			// 											(++hash)).text(data.results.length + " PRISCs - " + 
// 			// 											moment(data.timestamp).format('MMMM Do YYYY, h:mm:ss a'));
// 	    //     }
// 	    //     $newPanel.find(".panel-collapse").attr("id", hash); //.addClass("collapse").removeClass("in");
// 	    //     $("#accordion").prepend($newPanel.fadeIn());
// 	    //     $newPanel.find(".collapse").collapse("show");
// 	
// 	    //     $newPanel.find("#tech").attr("id", "#tech" + hash).text(data.tech.toUpperCase());
// 	    //     $newPanel.find("#filename").attr("id", "#filename" + hash).text(data.filename);
// 	    //     $newPanel.find("#timestamp").attr("id", "#timestamp" + hash).text(moment(data.timestamp).format('MMMM Do YYYY, h:mm:ss a'));
// 	
// 	    //     var priscList = $newPanel.find("#prisclist").attr("id", "#prisclist" + hash);
// 	
// 	    //     if(data.results.length === 0) {
// 	    //       priscList.append('<a href="#" class="list-group-item">None</a>');
// 	    //     }
// 	    //     else {
// 	    //       for(var i = 0; i < data.results.length; i++) {
// 	    //         priscList.append('<a href="#" class="list-group-item">' + data.results[i].prisc + '</a>');
// 	    //       }
// 	    //     }
// 	
// 	
// 	    //     $(".progress-bar").addClass("notransition");
// 	    //     $('.progress-bar').attr('style', "width: 0%");
// 	
// 	    //     $('.progress-bar').text('');
// 	
// 	    //     document.getElementById("upload-input").value = "";
// 	    //   },
// 	    //   xhr: function() {
// 	    //     // create an XMLHttpRequest
// 	    //     var xhr = new XMLHttpRequest();
// 	
// 	    //     $(".progress-bar").removeClass("notransition");
// 	
// 	    //     // listen to the 'progress' event
// 	    //     xhr.upload.addEventListener('progress', function(evt) {
// 	
// 	    //       if (evt.lengthComputable) {
// 	    //         // calculate the percentage of upload completed
// 	    //         var percentComplete = evt.loaded / evt.total;
// 	    //         percentComplete = parseInt(percentComplete * 100);
// 	
// 	    //         // update the Bootstrap progress bar with the new percentage
// 	    //         $('.progress-bar').text(percentComplete + '%');
// 	    //         $('.progress-bar').width(percentComplete + '%');
// 	
// 	    //         // once the upload reaches 100%, set the progress bar text to done
// 	    //         if (percentComplete === 100) {
// 	    //           $('.progress-bar').text('Calculating the last digit of pi...');
// 	    //         }
// 	
// 	    //         $('.progress-bar').addClass("progress-bar-striped active");
// 	
// 	    //       }
// 	
// 	    //     }, false);
// 	
// 	    //     return xhr;
// 	    //   }
// 	    // });
// 	
// 	  }
// 	});
//   
// });
  
  
  
  
  
  
  
  
  
  
