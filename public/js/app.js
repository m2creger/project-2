

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
 
  $('#addSupplies').on('click', function(event) {
    event.preventDefault();
    //console.log(this);
    console.log("add supplies");
    var htmlToAdd = 
      "<input class='form-control' type='text' name='supplies' id='suppliesField' placeholder='supply'>"+
      "<span class='input-group-addon'>-</span>"+
      "<input class='form-control' type='text' name='class' id='costField' placeholder='Cost'>";
      console.log(htmlToAdd);
      var costField = $('.newSupplies');
      console.log(costField);
      costField.append(htmlToAdd);
  });
  $("img").on('click', function(event) {
    event.preventDefault();
    var imageURL = $(this).attr('src');
    console.log(imageURL);
    addPictureToDatabase(imageURL);
  });
  $('.projectDiv').click(function(event) {

  }); 


});

function addPictureToDatabase(url) {
  // var datastring = "&url=" + url;
  //console.log(datastring);
   $.ajax({
      type: "POST",
      url: "/addpicture",
      data: {url: url},
      dataType: "json",
      success: function() {
        console.log("Success");
      },
      error: function() {
        console.log("error posting form data")
      }
    })
}
