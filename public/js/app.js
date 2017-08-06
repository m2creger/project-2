

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
  $('#addSupplies').on('click', function(event) {
    event.preventDefault();
    console.log("add supplies");
    var htmlToAdd = 
      "<input class='form-control' type='text' name='supplies' id='suppliesField' placeholder='supply'>"+
      "<span class='input-group-addon'>-</span>"+
      "<input class='form-control' type='text' name='class' id='costField' placeholder='Cost'>";
      console.log(htmlToAdd);
      var costField = $('#costField');
      //console.log(costField);
      costField.append(htmlToAdd);
  });
  $("img").on('click', function(event) {
    event.preventDefault();
    var imageURL = $(this).attr('src');
    console.log(imageURL);
    addPictureToDatabase(imageURL);
  });


});

function addPictureToDatabase(url) {
   $.ajax({
      type: "POST",
      url: "/",
      success: function() {
        console.log("Success");
      },
      error: function() {
        console.log("error posting form data")
      }
    })
}
