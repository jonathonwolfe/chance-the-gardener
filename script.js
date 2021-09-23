const farmbot = require('farmbot');
window.$ = window.jQuery = require('jquery');
window.bootstrap = require('bootstrap');

// NO VALUES FOR THESE VARIABLES IN FINAL BUILD!!!
var gardenX=2700;
var gardenY=1200;

let lastLoggedInUserID,
sessionToken;

function loadLastUser() {
	// Check which user was last logged in.
	lastLoggedInUserID = localStorage.getItem('lastLoginUserID');

	// TODO: Get the user's credentials from db, using the user ID.
	// For testing purposes, these are hard coded as Jonathon's.
	let emailAdd = "***REMOVED***",
	password = "***REMOVED***";

	// Generate a session token for this user with the API.
	var settings = {
		"url": "https://my.farmbot.io/api/tokens",
		"method": "POST",
		"timeout": 0,
		"headers": {
			"content-type": "application/json"
		},
		"data": JSON.stringify({
			"user": {
				"email": emailAdd,
				"password": password
			}
		}),
	};
	$.ajax(settings).done(function (response) {
		sessionToken = response.token.encoded;
		console.log("Session token generated: " + sessionToken);
	});
}

function changePage(pagePath) {
	window.location.href = pagePath + '#' + sessionToken;
}

function getSessionToken() {
	// Check if a session token was passed from the previous page.
	sessionToken = window.location.hash.substring(1);

	if (sessionToken == null || sessionToken == "" || sessionToken == "undefined") {
		// If none found, generate new one.
		loadLastUser();
	}
}

// Delete later???
function getUserName() {
	$.ajax(settings).done(function (response) {
		return response.user.name;
	});
}

// Take 1 photo at current bot coordinates
function takePhoto() {
	var farmbot123 = new farmbot.Farmbot({ token: sessionToken });

	farmbot123
		.connect()
		.then(function () {
			return farmbot123.takePhoto({});
		}).then(function (farmbot123) {
			console.log("Photo taken");
		}).catch(function (error) {
			console.log("Something went wrong :(");
		});
}

// Check current bot X Y Z
function readCoordinates() {
	return new Promise((resolve, reject) => {

	var settings = {
		"url": "https://my.farmbot.io/api/logs",
		"method": "GET",
		"timeout": 0,
		"headers": {
			"Authorization": "Bearer " + sessionToken,
			"Access-Control-Allow-Origin": "*",
			"Content-Type": "application/json"
		},
	};

	$.ajax(settings).done(function (response) {
		console.log(response[0].x, response[0].y, response[0].z);
	}).then(function(response){
		resolve(response[0].x + "," + response[0].y + "," + response[0].z);
	});
	
	});
}

// Check current bot X Y Z
function getPoints() {
	const { Parser } = require('json2csv');
	const fs = require('fs');

	return new Promise((resolve, reject) => {
		var settings = {
			"url": "https://my.farmbot.io/api/points",
			"method": "GET",
			"timeout": 0,
			"headers": {
				"Authorization": "Bearer " + sessionToken,
				"Access-Control-Allow-Origin": "*",
				"Content-Type": "application/json"
			},
		};

		$.ajax(settings).done(function (response) {
			// Filter out non-plants.
			let plantDataJson = [];

			for (let i = 0; i < Object.keys(response).length; i++) {
				if (response[i].pointer_type == "Plant") {
					plantDataJson.push(response[i]);
				}
			}
			JSON.stringify(plantDataJson);

			// Save as csv.
			const json2csvParser = new Parser();
			const csv = json2csvParser.parse(plantDataJson);
			
			fs.writeFileSync('plant-data.csv', csv);
		}).then(function(response){
			resolve(response);
		});
	});
}

// Toggle LED light
function toggleLight() {
	var farmbot123 = new farmbot.Farmbot({ token: sessionToken });

	farmbot123
		.connect()
		.then(function () {
			return farmbot123.togglePin({ pin_number: 7 });
		}).then(function (farmbot123) {
			console.log("Light toggled");
		}).catch(function (error) {
			console.log("Something went wrong :(");
		});
}

function checkLED(){
	var device = new farmbot.Farmbot({ token: sessionToken });

	// Check if device LED is ON >> Checking PIN 7
	device.on("status", (state_tree) => {
		console.log("LED status");
		console.dir(state_tree.pins[7].value);
	});
}



function setLEDon(){
	var device = new farmbot.Farmbot({ token: sessionToken });


	// Lua Function
	const myLua = `
	pinLED = read_pin(7)
	send_message("info", pinLED)
	if (pinLED == 0) then
		send_message("info", "LED is OFF, turning it ON")
		write_pin(7, "digital", 1)
		send_message("info", "LED is ON")
	else
		send_message("info", "LED is ON")
	end
	`;
	
	device
	  .connect()
	  .then(() => {
		device.send({
		  kind: "rpc_request",
		  args: { label: "---", priority: 100 },
		  body: [
			{
			  kind: "lua",
			  args: { lua: myLua }
			},
		  ]
		});
	  });
}

// Send log message to FarmBot system
function sendLogMessage() {
	var logValue = "Chance App: " + document.getElementById("logMessageText").value;
	var farmbot123 = new farmbot.Farmbot({ token: sessionToken });

	farmbot123
		.connect()
		.then(function () {
			return farmbot123.sendMessage("success", logValue);

		}).then(function (farmbot123) {
			console.log("Log Sent");
		}).catch(function (error) {
			console.log("Something went wrong :(");
		});
}

// Start rendering a set of images to create a 3D model
function createRenders() {
	// Check if renders folder exists yet, and create if not.
	const fs = require("fs");

	if (!fs.existsSync("./renders")) {
		fs.mkdirSync("./renders");
	}

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

	// execute meshroom application through command line
	var child = require('child_process').execFile;
	var executablePath = "Meshroom-2018.1.0\\meshroom_photogrammetry.exe";
	var parameters = ["--input", "images", "--output", "renders", "--scale", "2"];

	child(executablePath, parameters, function (err, data) {
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

// Get list of folders in a directory.
function getFoldersList(type, userID) {
	const { readdirSync } = require('fs');
	let foldersList = [];

	try {
		foldersList = 
		readdirSync(type + "\\" + userID, { withFileTypes: true })
			.filter(dirent => dirent.isDirectory())
			.map(dirent => dirent.name);
	} catch (err) {
		// User folder probably doesn't exist.
		console.log("Error reading user folder.");
	}

	return foldersList;
}

function createDateTimeSelect(type, userID) {
	const selectList = document.getElementById("date-time-select");
	const folderList = getFoldersList(type, userID);

	if (folderList.length >= 1) {
		for (let i = 0; i < folderList.length; i++) {
			let dateTimeOption = document.createElement("option");
			dateTimeOption.textContent = folderList[i];
			dateTimeOption.value = folderList[i];
			selectList.appendChild(dateTimeOption);
		}
	} else {
		// No scans found.
		let dateTimeOption = document.createElement("option");
		if (type == "scans") {
			dateTimeOption.textContent = "No scans found for this user";
		} else {
			dateTimeOption.textContent = "No renders found for this user";
		}
		
		selectList.appendChild(dateTimeOption);
	}
}

function createUserSelect() {
	// TODO: Create an array of user IDs from the database.
	var userIDList = [];

	// Add values to select list.
	const selectList = document.getElementById("user-select");
	for (let i = 0; i < userIDList.length; i++) {
		let userOption = document.createElement("option");
		userOption.textContent = userIDList[i];
		userOption.value = userIDList[i];
		selectList.appendChild(userOption);
	}
}


