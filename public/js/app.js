

$(document).ready(function() {
  //$('#newDIYProject').load("/newdiy");
	$('#newDIYProject').on('click', function(event) {
    event.preventDefault();
		console.log("new diy project");

		$.ajax({
      type: "GET",
      url: "/newdiy",
      success: function() {
        console.log("Success");
      },
      error: function() {
        console.log("error posting form data")
      }

    });
	});
  $('#newProProject').on('click', function(event) {
    event.preventDefault();
    console.log("new pro project");
    $.ajax({
      type: "GET",
      url: "/newpro",
      success: function() {
        console.log("Success");
      },
      error: function() {
        console.log("error posting form data")
      }

    });
  });

  // $('addHomeProject').on('click', function(event) {
  //   $.ajax({
  //     type: "POST",
  //     url: "/newhomeproject",
  //     success: function() {
  //       console.log("Success");
  //     },
  //     error: function() {
  //       console.log("error posting form data")
  //     }
  //   })
  // })
});

function showResults() {
	 $.ajax({
      type: "GET",
      url: '/flickrresults',
      success: function() {
      	console.log("Success");
      },
      error: function() {
        console.log("error posting form data")
      }

    });
}

function renderFlickrResults() {
	//$('#flickrResultsModal').modal("show");
}

function showFlickrResults() {
	
}