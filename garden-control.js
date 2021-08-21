
// NO VALUES FOR THESE VARIABLES IN FINAL BUILD!!!
var TOKEN = "***REMOVED***";
var EMAIL;
var PASSWORD;


// DELETE THIS FUNC IN FINAL BUILD!!!
function tempLogin(){
	EMAIL = "***REMOVED***";
	PASSWORD = "***REMOVED***";

	//Step here to add this info to the Database so USER don't have to enter this evertime!

	generateToken(EMAIL,PASSWORD);

}

// Save Credentials 
function saveCredentials(){
	EMAIL = document.getElementById("email").value;
	PASSWORD = document.getElementById("password").value;

	//Step here to add this info to the Database so USER don't have to enter this evertime!

	generateToken(EMAIL,PASSWORD);

}

// Generate Token
function generateToken(email, password){
	var settings = {
	  "url": "https://my.farmbot.io/api/tokens",
	  "method": "POST",
	  "timeout": 0,
	  "headers": {
	    "content-type": "application/json",
	    "Cookie": "***REMOVED***"
	  },
	  "data": JSON.stringify({
	    "user": {
	      "email": email,
	      "password": password
	    }
	  }),
	};

	$.ajax(settings).done(function (response) {
	  console.log(response);
		setUserProfile(response.user.name,response.token.encoded);
	});
}

// Set USER Profile & TOKEN
function setUserProfile(name, token){
	console.log(name);
	document.getElementById("welcome").innerHTML = name;
	TOKEN=token;
	console.log(TOKEN);
}

	
function takePhoto() {
	var farmbot123 = new fbjs.Farmbot({ token: TOKEN });

	farmbot123
	.connect()
	.then(function () {
		return farmbot123.takePhoto({});
	});
}

function toggleLight() {
	var farmbot123 = new fbjs.Farmbot({ token: TOKEN });

	farmbot123
	.connect()
	.then(function () {
		return farmbot123.togglePin({ pin_number: 7 });
	});
}

// Move the bot to a set of coordinates
function moveBotCoord() {
	var xCoordinate= parseInt(document.getElementById("xCoord").value);
	var yCoordinate= parseInt(document.getElementById("yCoord").value);
	var zCoordinate= parseInt(document.getElementById("zCoord").value);
	var farmbot123 = new fbjs.Farmbot({ token: TOKEN });

	console.log("Bot moving to: x="+xCoordinate+ ", y="+yCoordinate+", z="+zCoordinate);
// Need to pull bot's curr pos here, and set as default value for those variables that were not inputted. ex: z was not inputted!
	farmbot123
	.connect()
	.then(function () {
		return farmbot123.moveAbsolute({ x: xCoordinate, y: yCoordinate, z: zCoordinate, speed: 100 });
	});
}

// Move the bot to home Coord 0,0,0
function moveBotHome() {
	var xCoordinate= document.getElementById("xCoord").value;
	var yCoordinate= document.getElementById("yCoord").value;
	var zCoordinate= document.getElementById("zCoord").value;
	var farmbot123 = new fbjs.Farmbot({ token: TOKEN });

	console.log("Bot moving to: x=0, y=0, z=0");
	farmbot123
	.connect()
	.then(function () {
		return farmbot123.moveAbsolute({ x: 0, y: 0, z: 0, speed: 100 });
	});
}

function sendLogMessage() {
	var logValue= document.getElementById("logMessageText").value;
	var farmbot123 = new fbjs.Farmbot({ token: TOKEN });

	farmbot123
	.connect()
	.then(function () {
		return farmbot123.sendMessage("info", logValue);

	});
}

function createRenders() {

	// At start, setting the progress bar to 55%
	var i = 0;
	if (i == 0) {
		i = 1;
		var elem = document.getElementById("myBar");
		var width = 1;
		var id = setInterval(frame, 10);
		function frame() {
			if (width >= 55) {
				clearInterval(id);
				i = 0;
			} else {
				width++;
				elem.style.width = width + "%";
			}
		}
	}
	// progress bar stops	

	var child = require('child_process').execFile;
	var executablePath = "Meshroom-2018.1.0\\meshroom_photogrammetry.exe";
	var parameters = ["--input", "images", "--output", "renders", "--scale", "2"];

	child(executablePath, parameters, function(err, data) {
		console.log(err)
		console.log(data.toString());

		// set progress bar to 100% if process completed.
		let str = data.toString(); 
		let stage = 0;
		stage = str.search("[13/13]")
		
		if (stage != 0) {
			var elem = document.getElementById("myBar");
			var width = 1;
			elem.style.width = 100 + "%";
		}
		// end

	});
}

function downloadImages(){

// Set the settings for the API request	
var settings = {
  "url": "https://my.farm.bot/api/images",
  "method": "GET",
  "timeout": 0,
  "headers": {
    "Authorization": "***REMOVED***",
    "Cookie": "***REMOVED***"
  },
};

// Make var to store the response
var savedResponse;

// Acess the response and save it to the variable
$.ajax(settings).done(function (response) {
	//console.log(response);
  	savedResponse = response;
  	console.log(savedResponse[0]);

  	// x is the number of images the user want to download
	var x = 200
	// 0 is the newest images, it will be downloaded first, then the second newest, and so on. 
	var i = 0





	while (i <= x) {

    	// Print the ith image's url
    	console.log(i); 
    	console.log(savedResponse[i].attachment_url); 
    	
    	// Call python script and pass arguments to save the image to local folder
		const spawn = require("child_process").spawn;
		const pythonProcess = spawn('python',["saveImage.py", savedResponse[i].attachment_url, savedResponse[i].id]);
		

    	i += 1;

	}
});



}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}