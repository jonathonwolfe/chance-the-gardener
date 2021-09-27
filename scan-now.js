$(document).ready(async function() {
	await pageStartUp();
	await setUserName();
});

$(document).ready(function() {
	// Activate tooltips.
	var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
	var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
		return new bootstrap.Tooltip(tooltipTriggerEl)
	});
	// Load modal.
	var myModal = document.getElementById('cancel-scan-modal');
	var myInput = document.getElementById('cancel-scan-btn');

	myModal.addEventListener('shown.bs.modal', function () {
		myInput.focus();
	});

	document.getElementById("inputStartingZ").value = "-200";
});

const { Console } = require("console");

// REMOVE VARIABLES ON RELEASE
var lightPin = 7;
var deviceLightPinNo = 7;
var stepQuality = 50; // MUST INCLUDE VALIDATION TO ENSURE RANGE IS BETWEEN 10-50. 50 being bad quality, 10 being good.
var stepX;
var stepY;
var startingX = 0;
var startingY = 0;

function testtest() {
	// Elements for hiding/showing when scanning.
	const startBtn = document.getElementById("start-scan-btn"),
	cancelBtn = document.getElementById("cancel-scan-btn"),
	loadingSpinner = document.getElementById("scan-progress-spinner"),
	dateTimeInfoHolder = document.getElementById("scan-datetime-info"),
	backBtn = document.getElementsByClassName("btn-back")[0];

	// Create folder and get folderpath.
	const scanFolderpath = createScanFolder();

	// Get plant data.
	savePlantData(scanFolderpath);

	// Disable and hide scan button.
	startBtn.setAttribute("disabled", "");
	startBtn.classList.add("d-none");

	// Disable back button.
	backBtn.setAttribute("disabled", "");

	// Show cancel button.
	cancelBtn.classList.remove("d-none");
	
	// Show loading spinner.
	loadingSpinner.classList.remove("d-none");

	// TODO: Save scan to database in the createScanFolder() function.
	// Folder name is used as placeholder for now.
	// Normally it will grab the date time of current scan from db, after folder creation.
	const scanFolderpathSplit = scanFolderpath.split("/");
	const dateTimeFolName = scanFolderpathSplit[3];

	// Show date-time of current scan.
	dateTimeInfoHolder.classList.remove("d-none");
	document.getElementById("current-scan-datetime").innerHTML = dateTimeFolName;

	// Download images.
	downloadImages(5, scanFolderpath);

	saveFarmSize(scanFolderpath);
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

	// Create a thumbnail folder.
	if (!fs.existsSync(dir + "/thumbs")) {
		fs.mkdirSync(dir + "/thumbs");
	}

	// Send back name and location of new folder.
	return dir;
}

// Downloads the x latest images on FarmBot system.
function downloadImages(numberOfImagesToDownload, scanFolderPath) {
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

	// Access the response and save it to the variable
	$.ajax(settings).done(async function (response) {
		savedResponse = response;
		console.log(savedResponse[0]);

		// x is the number of images the user want to download (FarmBot has a limit of storing the latest 449 images on their servers, hence 449 is the max number here)
		var x = numberOfImagesToDownload;
		// 0 is the newest images, it will be downloaded first, then the second newest, and so on. 
		var i = 0;

		while (i <= x) {
			// Download the image.
			await downloadSingleImage(savedResponse[i], scanFolderPath);

			// Create thumbnail.
			await generateImageThumbnail(savedResponse[i], scanFolderPath);

			i += 1;
		}
	}).then(function(response){
		resolve('Done dowloading images');
	});
	
}

function downloadSingleImage(savedResponse, scanFolderPath) {
	return new Promise((resolve, reject) => {
		const download = require('image-downloader'),
		options = {
			url: savedResponse.attachment_url,
			dest: scanFolderPath + "/" + savedResponse.id + ".jpg"
		}

		download.image(options)
			.then(({ filename }) => {
				console.log('Saved to', filename);
				resolve();
			})
			.catch((err) => console.error(err));
	});
}

function generateImageThumbnail(savedResponse, scanFolderPath) {
	return new Promise((resolve, reject) => {
		const sharp = require('sharp'),
		fs = require('fs');

		fs.readFile(scanFolderPath + "/" + savedResponse.id + ".jpg", (err, img) => {
			if (err) throw err;
			if (!fs.existsSync(scanFolderPath + "/thumbs/" + savedResponse.id + ".jpg")) {
				sharp(img)
				.resize({ width: 100 })
				.toFile(scanFolderPath + "/thumbs/" + savedResponse.id + ".jpg")
				.then(data => { 
					console.log(data);
					resolve(); 
				})
				.catch(err => { console.error(err) });
			}
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

function saveFarmSize(scanFolderPath) {
	const xAxis = document.getElementById("inputXAxis").value,
	yAxis = document.getElementById("inputYAxis").value;

	const createCsvWriter = require('csv-writer').createObjectCsvWriter;
	const csvWriter = createCsvWriter({
		path: scanFolderPath + '/farm_size.csv',
		header: [
			{id: 'xAxisCol', title: 'x-axis'},
			{id: 'yAxisCol', title: 'y-axis'}
		]
	});
	
	const records = [
		{xAxisCol: xAxis,  yAxisCol: yAxis}
	];
	
	csvWriter.writeRecords(records)
		.then(() => {
			console.log('...Done');
		});
}

function createScan() {
	// Elements for hiding/showing when scanning.
	const startBtn = document.getElementById("start-scan-btn"),
	cancelBtn = document.getElementById("cancel-scan-btn"),
	loadingSpinner = document.getElementById("scan-progress-spinner"),
	dateTimeInfoHolder = document.getElementById("scan-datetime-info"),
	backBtn = document.getElementsByClassName("btn-back")[0];
	// Elements for grabbing scan settings.
	const farmSizeXInput = document.getElementById("inputXAxis"),
	farmSizeYInput = document.getElementById("inputYAxis"),
	scanStartingZ = document.getElementById("inputStartingZ");

	// Create new soft limited lengths
	var softLimitedDeviceXmax = parseInt(farmSizeXInput.value) - 50; // -50 here to ensure motor does not stall by trying to go outside of X axis rails
	var softLimitedDeviceYmax = parseInt(farmSizeYInput.value) - 50; // -50 here to ensure motor does not stall by trying to go outside of Y axis rails

	// Calculate the steps per axis depending on the Device size and the level of increment (The higher the increment, the worse the render quality); and remove decimal
	stepX = Math.trunc(softLimitedDeviceXmax/stepQuality);
	stepY = Math.trunc(softLimitedDeviceYmax/stepQuality);

	// Disable and hide scan button.
	startBtn.setAttribute("disabled", "");
	startBtn.classList.add("d-none");

	// Disable back button.
	backBtn.setAttribute("disabled", "");

	// Show cancel button.
	cancelBtn.classList.remove("d-none");
	
	// Show loading spinner.
	loadingSpinner.classList.remove("d-none");

	// Create folder and get folderpath.
	const scanFolderpath = createScanFolder();

	// Get plant data.
	savePlantData(scanFolderpath);

	// TODO: Get farm size from db and save to CSV.
	saveFarmSize(scanFolderpath);

	// TODO: Save scan to database in the createScanFolder() function.
	// Folder name is used as placeholder for now.
	// Normally it will grab the date time of current scan from db, after folder creation.
	const scanFolderpathSplit = scanFolderpath.split("/");
	const dateTimeFolName = scanFolderpathSplit[3];

	// Show date-time of current scan.
	dateTimeInfoHolder.classList.remove("d-none");
	document.getElementById("current-scan-datetime").innerHTML = dateTimeFolName;

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
	starting_z = ${scanStartingZ}
	
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
			downloadImages(98, scanFolderpath);
			// Maybe delete old images
			// Move bot to next row (A1, A2, etc..)
			console.log("Download images now...");
		}
		if (log.message == "Chance App done scanning farm") {
			// Re-enable and show button.
			startBtn.removeAttribute("disabled");
			startBtn.classList.remove("d-none");
			// Re-enable back button.
			backBtn.removeAttribute("disabled");
			// Re-hide loading spinner.
			loadingSpinner.classList.add("d-none");
			// Re-hide scan date & time.
			dateTimeInfoHolder.classList.add("d-none");
			// Re-hide cancel button.
			cancelBtn.classList.add("d-none");
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

function pageStartUp() {
	return new Promise((resolve, reject) => {
		// Check if a session token was passed from the previous page.
		sessionToken = window.location.hash.substring(1);

		if (sessionToken == null || sessionToken == "") {
			// If none found, generate new one.
			// Check which user was last logged in.
			lastLoggedInUserID = localStorage.getItem('lastLoginUserID');

			// TODO: Get the user's credentials from db, using lastLoggedInUserID.
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

		// Pre-fill farm size.
		
		// TODO: Get farm size from database.
		var dbXAxis, dbYAxis;

		//farmSizeXInput.value = dbXAxis;
		//farmSizeYInput.value = dbYAxis;
	});
}

// TODO: Change this to the updated version in change-user when it uses db.
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

function cancelScan() {
	// Elements for hiding/showing when scanning.
	const startBtn = document.getElementById("start-scan-btn"),
	cancelBtn = document.getElementById("cancel-scan-btn"),
	loadingSpinner = document.getElementById("scan-progress-spinner"),
	dateTimeInfoHolder = document.getElementById("scan-datetime-info"),
	backBtn = document.getElementsByClassName("btn-back")[0];

	// Re-enable and show button.
	startBtn.removeAttribute("disabled");
	startBtn.classList.remove("d-none");
	// Re-enable back button.
	backBtn.removeAttribute("disabled");
	// Re-hide loading spinner.
	loadingSpinner.classList.add("d-none");
	// Re-hide scan date & time.
	dateTimeInfoHolder.classList.add("d-none");
	// Re-hide cancel button.
	cancelBtn.classList.add("d-none");
	
	// Get scan location from database.

	// Delete scan folder.
	//const fs = require("fs");
	//fs.rmdirSync(folderPathFromDb, { recursive: true });

	// Delete scan entry in database.

	// TODO: Cancel scan sequence.
	/* var device = new farmbot.Farmbot({ token: sessionToken });
	device.connect()
	.then(function () {
		return device.rebootFirmware();
	}); */
	
	// Maybe load a toast to confirm scan cancellation?
}