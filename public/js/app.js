

$(document).ready(function() {
	// $('#flickrButton').on('click', function(event) {
	// 	console.log("flickr");
	// 	showResults()
	// });
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