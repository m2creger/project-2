const Home = require("./models");
const expect = require("chai").expect;

var bodyData;
var responseData;
var flickr = require('./env.js');

var url = "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=" + flickr.apiKey + "&text=home&format=json&nojsoncallback=1";;
describe("home", function() {
	
	before(function(done) {
		request(url, function(error, response, body) {
			bodyData = body;
			console.log(bodyData);
			responseData = response;
			console.log(responseData);
			done();
		});

	});
	
	it("should return 200-OK", function(done) {
		console.log("responseData");
		expect(responseData.statusCode).to.eq(200);
		
		done();
	});
	it("should objects in the body", function(done) {
		console.log("bodyData");
		if (typeof(bodyData) === "string") {
			bodyData = JSON.parse(bodyData);
		}
		expect(bodyData.sentence).to.not.be.empty;
		
		done();
	});
		
	
});