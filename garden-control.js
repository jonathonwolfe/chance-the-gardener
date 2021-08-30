
// NO VALUES FOR THESE VARIABLES IN FINAL BUILD!!!
var TOKEN = "yes";
var EMAIL;
var PASSWORD;


// DELETE THIS FUNC IN FINAL BUILD!!!
function tempLogin(){
	EMAIL = "***REMOVED***";
	PASSWORD = "***REMOVED***";
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
	    "content-type": "application/json"
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

// Take 1 photo at current bot coordinates
function takePhoto() {
	var farmbot123 = new fbjs.Farmbot({ token: TOKEN });

	farmbot123
	.connect()
	.then(function () {
		return farmbot123.takePhoto({});
	});
}

// Toggle LED light
function toggleLight() {
	var farmbot123 = new fbjs.Farmbot({ token: TOKEN });

	farmbot123
	.connect()
	.then(function () {
		return farmbot123.togglePin({ pin_number: 7 });
	});
}

// Exec Seq
function ExecSeq() {
	var farmbot123 = new fbjs.Farmbot({ token: TOKEN });

	farmbot123
	.connect()
	.then(function () {
		return farmbot123.execSequence(67893);
	}).then(function(farmbot123){
    console.log("Bot has stopped!");
  })
  .catch(function(error) {
    console.log("Something went wrong :(");
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

// Move the bot to home Coordinates 0,0,0
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

// Send log message to FarmBot system
function sendLogMessage() {
	var logValue= document.getElementById("logMessageText").value;
	var farmbot123 = new fbjs.Farmbot({ token: TOKEN });

	farmbot123
	.connect()
	.then(function () {
		return farmbot123.sendMessage("info", logValue);

	});
}

// Start rendering a set of images to create a 3D model
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

// Downloads the latest 449 images on FarmBot system
function downloadImages(){
	// Get current date-time.
	// Also adjust date/month for single digits.
	let dateObj = new Date();
	let currentDateTime = dateObj.getFullYear() + "-" + ("0" + (dateObj.getMonth() + 1)).slice(-2) + "-" + (("0" + dateObj.getDate()).slice(-2)) + "_" + ("0" + (dateObj.getHours() + 1)).slice(-2) + "-" + ("0" + (dateObj.getMinutes() + 1)).slice(-2) + "-" + ("0" + (dateObj.getSeconds() + 1)).slice(-2);

	// Create folder with current date-time.
	var fs = require("fs");
	var dir = "./images/" + currentDateTime;

	if (!fs.existsSync(dir)){
		fs.mkdirSync(dir);
	}

	// Set the settings for the API request	
	var settings = {
	  "url": "https://my.farm.bot/api/images",
	  "method": "GET",
	  "timeout": 0,
	  "headers": {
	    "Authorization": "Bearer " + TOKEN
	  },
	};

	// Make var to store the response
	var savedResponse;

	// Acess the response and save it to the variable
	$.ajax(settings).done(function (response) {
		//console.log(response);
	  	savedResponse = response;
	  	console.log(savedResponse[0]);

	  // x is the number of images the user want to download (FarmBot has a limit of storing the latest 449 images on their servers, hence 449 is the max number here)
		var x = 449;
		// 0 is the newest images, it will be downloaded first, then the second newest, and so on. 
		var i = 0;

		while (i <= x) {

	    // Print the ith image's url
	    console.log(i); 
	    console.log(savedResponse[i].attachment_url); 
	    	
	    // Call python script and pass arguments to save the image to appropraite folder.
			const spawn = require("child_process").spawn;
			const pythonProcess = spawn('python',["saveImage.py", savedResponse[i].attachment_url, savedResponse[i].id, dir]);
	    i += 1;
		}
	});
}


function makeWait(){
	var celeryScript = { "kind": "wait", "args": { "milliseconds": 1000 } };
	var sequenceName = "testName";
	createNewSequence(sequenceName,celeryScript);
}

// Creates a new sequence and sends it to the FarmBot system to store in its sequences
function createNewSequence(sequenceName,celeryScript){
	var settings = {
  "url": "https://my.farmbot.io/api/sequences",
  "method": "POST",
  "timeout": 0,
  "headers": {
    "Authorization": "Bearer " + TOKEN,
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json"
  },
  "data": JSON.stringify({
    "color": "red",
    "name": sequenceName,
    "pinned": false,
    "kind": "sequence",
    "body": [
      celeryScript
    ]
  }),
};

$.ajax(settings).done(function (response) {
  console.log(response);
});
}
