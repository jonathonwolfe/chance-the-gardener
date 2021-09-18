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

	// Get the user's credentials from db, using the user ID.
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

	if (sessionToken == null || sessionToken == "") {
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

///////////////////////
function myfunc(){
	var logNumber=0;
	var device = new farmbot.Farmbot({ token: sessionToken });


	// Lua Function
	const myLua = `
	photo_count = 0
	
	pinLED = read_pin(7)
	send_message("info", pinLED)
	if (pinLED == 0) then
		send_message("info", "LED is OFF, turning it ON")
		write_pin(7, "digital", 1)
		send_message("info", "LED is ON")
	else
		send_message("info", "LED is ON")
	end

	function take_photo_and_maybe_notify()
		photo_count = photo_count + 1
		if math.fmod(photo_count, 100) == 0 then
			send_message("info", "download images now")
		end
		return take_photo()
	end
	
	function scanX(label, count)
		send_message("info", "(DO NOT TOUCH) Chance App Scanning " .. label)
	
		for i = count, 1, -1 do
			error1 = take_photo_and_maybe_notify()
			if error1 then return send_message("error", "Capture failed ") end
			p, error2 = get_position()
			if error2 then return send_message("error", inspect(error2)) end
			move_absolute(p.x + 50, p.y, p.z)
		end
	
		send_message("success", "Chance App done scanning row: " .. label)
	end
	
	-- Set a starting X coordinate to do a grid scan of.
	starting_x = 0
	starting_y = 0
	
	-- Loop 24 times, calling scanX on a different "lane" in the
	-- Y coordinate:
	for i = 0, 24 do
		move_absolute(starting_x, starting_y, 0)
		label = "A" .. i
		scanX(label, 54)
		starting_y = starting_y + 50
	end
	send_message("success", "Chance App done scanning farm")
	find_home("all")
	`;
	
	device.on("logs", (log) => {
	  console.log("("+ logNumber +")New log: " + log.message);
	  logNumber++;
	  if (log.message == "download images now") {
		// Download images from API
		downloadImages(99);
		// Maybe delete old images
		// Move bot to next row (A1, A2, etc..)
		console.log("Download images now...");
	  }
	});
	
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

//////////////////////





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
// TODO: maybe update later to just read the db?
function getFoldersList(mainFolder) {
	const { readdirSync } = require('fs');

	const foldersList = source =>
		readdirSync(source, { withFileTypes: true })
			.filter(dirent => dirent.isDirectory())
			.map(dirent => dirent.name);

	return foldersList(mainFolder);
}
function createDateTimeSelect(folder) {
	var selectList = document.getElementById("dateTimeSelect");
	var folderList = getFoldersList(folder);

	for (let i = 0; i < folderList.length; i++) {
		let dateTimeVal = folderList[i];
		let dateTimeOption = document.createElement("option");
		dateTimeOption.textContent = dateTimeVal;
		dateTimeOption.value = dateTimeVal;
		selectList.appendChild(dateTimeOption);
	}

	return;
}

// Creates a folder for current user with date & time.


// Downloads the latest images on FarmBot system
function downloadImages(numberOfImagesToDownload, folderPath) {
	return new Promise((resolve, reject) => {
	// Get current date-time.
	// Also adjust date/month for single digits.
	let dateObj = new Date();
	let currentDateTime = dateObj.getFullYear() + "-" + ("0" + (dateObj.getMonth() + 1)).slice(-2) + "-" + (("0" + dateObj.getDate()).slice(-2)) + " " + ("0" + (dateObj.getHours() + 1)).slice(-2) + "-" + ("0" + (dateObj.getMinutes() + 1)).slice(-2) + "-" + ("0" + (dateObj.getSeconds() + 1)).slice(-2);

	// Create folder with current date-time.
	const fs = require("fs");
	var dir = "./images/" + currentDateTime;

	// Check if images folder exists yet, and create if not.
	if (!fs.existsSync("./images")) {
		fs.mkdirSync("./images");
	}

	// Create the date-time folder.
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir);
	}

	// Set the settings for the API request	
	var settings = {
		"url": "https://my.farm.bot/api/images",
		"method": "GET",
		"timeout": 0,
		"headers": {
			"Authorization": "Bearer " + sessionToken
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
		var x = numberOfImagesToDownload;
		// 0 is the newest images, it will be downloaded first, then the second newest, and so on. 
		var i = 0;

		while (i <= x) {

			// Print the ith image's url
			console.log(i);
			console.log(savedResponse[i].attachment_url);

			// Call python script and pass arguments to save the image to appropraite folder.
			const spawn = require("child_process").spawn;
			const pythonProcess = spawn('python', ["saveImage.py", savedResponse[i].attachment_url, savedResponse[i].id, dir]);
			i += 1;
		}
	}).then(function(response){
		resolve('Done dowloading  images');
	});
});
}

