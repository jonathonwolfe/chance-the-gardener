$(document).ready(async function() {
	await pageStartUp();
	await setUserName();
});
const { Console } = require("console");

$(document).ready(function() {
	// Activate tooltips.
	var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
	var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
		return new bootstrap.Tooltip(tooltipTriggerEl)
	});
});

// REMOVE VARIABLES ON RELEASE
var lightPin = 7;
var deviceXmax = 2700;
var deviceYmax = 1200;
var deviceLightPinNo = 7;
var stepQuality = 50; // MUST INCLUDE VALIDATION TO ENSURE RANGE IS BETWEEN 10-50. 50 being bad quality, 10 being good.
var stepX;
var stepY;
var startingX = 0;
var startingY = 0;
var startingZ = -200;

function testtest(button) {
	// Disable button until job done.
	button.setAttribute("disabled", "");

	// Create folder and get filepath.
	const scanFilepath = createScanFolder();

	// Get plant data.
	savePlantData(scanFilepath);

	downloadImages(5, scanFilepath);
}



// Creates a scan folder for current user with date & time.
function createScanFolder() {
	// Get current user ID.
	lastLoggedInUserID = localStorage.getItem('lastLoginUserID');
	// Get current date-time.
	// Also adjust date/month for single digits.
	let dateObj = new Date();
	let currentDateTime = dateObj.getFullYear() + "-" + ("0" + (dateObj.getMonth() + 1)).slice(-2) + "-" + (("0" + dateObj.getDate()).slice(-2)) + " " + ("0" + (dateObj.getHours() + 1)).slice(-2) + "-" + ("0" + (dateObj.getMinutes() + 1)).slice(-2) + "-" + ("0" + (dateObj.getSeconds() + 1)).slice(-2);

	// Create folder with current date-time.
	const fs = require("fs");
	let dir = "./scans/" + lastLoggedInUserID + "/" + currentDateTime;

	// Check if scans folder exists yet, and create if not.
	if (!fs.existsSync("./scans")) {
		fs.mkdirSync("./scans");
	}

	// Check if user's scan folder exists yet, and create if not.
	if (!fs.existsSync("./scans/" + lastLoggedInUserID)) {
		fs.mkdirSync("./scans/" + lastLoggedInUserID);
	}

	// Create the date-time folder.
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir);
	}

	// Send back name and location of new folder.
	return dir;
}

// Downloads the x latest images on FarmBot system.
function downloadImages(numberOfImagesToDownload, scanFolderPath) {
	return new Promise((resolve, reject) => {
		// Set the settings for the API request.
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
				const pythonProcess = spawn('python', ["saveImage.py", savedResponse[i].attachment_url, savedResponse[i].id, scanFolderPath]);
				i += 1;
			}
		}).then(function(response){
			resolve('Done dowloading  images');
		});
	});
}

function savePlantData(scanFolderPath) {
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

			// Save as CSV.
			const json2csvParser = new Parser();
			const csv = json2csvParser.parse(plantDataJson);
			
			fs.writeFileSync(scanFolderPath + "/plant_data.csv", csv);
		}).then(function(response){
			resolve(response);
		});
	});
}




function downloadOnce(){// DEL AFTER
	// Create folder and get filepath.
	const scanFilepath = createScanFolder();
	downloadImages(98, scanFilepath);
}

///////////////////////
function createScan(button) {
	// Create new soft limited lengths
	var softLimitedDeviceXmax = parseInt(deviceXmax) - 50; // -50 here to ensure motor does not stall by trying to go outside of X axis rails
	var softLimitedDeviceYmax = parseInt(deviceYmax) - 50; // -50 here to ensure motor does not stall by trying to go outside of Y axis rails

	// Calculate the steps per axis depending on the Device size and the level of increment (The higher the increment, the worse the render quality); and remove decimal
	stepX = Math.trunc(softLimitedDeviceXmax/stepQuality);
	stepY = Math.trunc(softLimitedDeviceYmax/stepQuality);

	// Disable button.
	// TODO: remove this later and just replace with new window etc.
	button.setAttribute("disabled", "");

	// Create folder and get filepath.
	const scanFilepath = createScanFolder();

	// Get plant data.
	savePlantData(scanFilepath);

	var logNumber=0;
	var device = new farmbot.Farmbot({ token: sessionToken });


	// Lua Function
	var myLua = `
	photo_count = 0

	find_home("all")
	
	pinLED = read_pin(${deviceLightPinNo})
	send_message("info", pinLED)
	if (pinLED == 0) then
		send_message("info", "LED is OFF, turning it ON")
		write_pin(${deviceLightPinNo}, "digital", 1)
		send_message("info", "LED is ON")
	else
		send_message("info", "LED is ON")
	end

	function take_photo_and_maybe_notify()
		photo_count = photo_count + 1
		if math.fmod(photo_count, 100) == 0 then
			send_message("info", "download images now")
			wait(10000)
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
			move_absolute(p.x + ${stepQuality}, p.y, p.z)
		end
	
		send_message("success", "Chance App done scanning row: " .. label)
	end
	
	-- Set a starting X coordinate to do a grid scan of.
	starting_x = ${startingX}
	starting_y = ${startingY}
	starting_z = ${startingZ}
	
	-- Loop ${stepY} times, calling scanX on a different "lane" in the
	-- Y coordinate:
	for i = 0, ${stepY} do
		move_absolute(starting_x, starting_y, starting_z)
		label = "A" .. i
		scanX(label, ${stepX})
		starting_y = starting_y + ${stepQuality}
	end
	send_message("info", "download images now")
	send_message("success", "Chance App done scanning farm")
	find_home("all")

	pinLED = read_pin(${deviceLightPinNo})
	send_message("info", pinLED)
	if (pinLED == 1) then
		send_message("info", "LED is ON, turning it OFF")
		write_pin(${deviceLightPinNo}, "digital", 0)
		send_message("info", "LED is OFF")
	else
		send_message("info", "LED is OFF")
	end
	`;
	
	device.on("logs", (log) => {
		console.log("("+ logNumber +")New log: " + log.message);
		logNumber++;
		if (log.message == "download images now") {
			// Download images from API
			downloadImages(98, scanFilepath);
			// Maybe delete old images
			// Move bot to next row (A1, A2, etc..)
			console.log("Download images now...");
		}
		if (log.message == "Chance App done scanning farm") {
			console.log("Chance App done scanning farm");
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

function pageStartUp() {
	return new Promise((resolve, reject) => {
		// Check if a session token was passed from the previous page.
		sessionToken = window.location.hash.substring(1);

		if (sessionToken == null || sessionToken == "") {
			// If none found, generate new one.
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
			}).then(function(response){
				resolve(response);
			});
		} else {
			setUserName();
		}
	});
}

function setUserName() {
	return new Promise((resolve, reject) => {
		var settings = {
			"url": "https://my.farmbot.io/api/users",
			"method": "GET",
			"timeout": 0,
			"headers": {
				"Authorization": "Bearer " + sessionToken,
				"Access-Control-Allow-Origin": "*",
				"Content-Type": "application/json"
			},
		};

		$.ajax(settings).done(function (response) {
			document.getElementById("current-user-name").innerHTML = response[0].name;
		}).then(function(response){
			resolve(response);
		});
	});
}
