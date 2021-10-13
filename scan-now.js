$(document).ready(async function() {
	loggedInCheck();
	await pageStartUp();
	await setUserName();
});

$(document).ready(function() {
	// Activate tooltips.
	var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
	var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
		return new bootstrap.Tooltip(tooltipTriggerEl)
	});
/* 	// Load modal.
	var myModal = document.getElementById('cancel-scan-modal');
	var myInput = document.getElementById('cancel-scan-btn');

	myModal.addEventListener('shown.bs.modal', function () {
		myInput.focus();
	}); */
});

var stepQuality = 50; // MUST INCLUDE VALIDATION TO ENSURE RANGE IS BETWEEN 10-50. 50 being bad quality, 10 being good.

// Creates a scan folder for current user with date & time.
async function createScanFolder() {
	const moment = require('moment')
	// Get current user ID.
	lastLoggedInUserID = parseInt(localStorage.getItem('lastLoginUserID'));
	// Get user's email.
	const currentUserObj = {userId: lastLoggedInUserID},
	userCreds = await getDbRowWhere('user', currentUserObj),
	emailAdd = userCreds[0].email;
	// Get current date-time.
	var dateTime = moment().format("YYYY-MM-DD HH-mm-ss");

	// Create folders with current date-time.
	const scanDir = path.join(__dirname, 'scans', emailAdd, dateTime),
	thumbsDir = path.join(__dirname, 'thumbs', emailAdd, dateTime);

	// Check if scans folder exists yet, and create if not.
	if (!fs.existsSync(path.join(__dirname, 'scans'))) {
		fs.mkdirSync(path.join(__dirname, 'scans'));
	}

	// Check if user's scans folder exists yet, and create if not.
	if (!fs.existsSync(path.join(__dirname, 'scans', emailAdd))) {
		fs.mkdirSync(path.join(__dirname, 'scans', emailAdd));
	}

	// Create the date-time scan folder.
	if (!fs.existsSync(scanDir)) {
		fs.mkdirSync(scanDir);
	}
	
	// Check if thumbs folder exists yet, and create if not.
	if (!fs.existsSync(path.join(__dirname, 'thumbs'))) {
		fs.mkdirSync(path.join(__dirname, 'thumbs'));
	}

	// Check if user's thumbs folder exists yet, and create if not.
	if (!fs.existsSync(path.join(__dirname, 'thumbs', emailAdd))) {
		fs.mkdirSync(path.join(__dirname, 'thumbs', emailAdd));
	}

	// Create the date-time thumbs folder.
	if (!fs.existsSync(thumbsDir)) {
		fs.mkdirSync(thumbsDir);
	}

	// Send back name and location of new scan folder.
	return [scanDir, thumbsDir];
}

// Downloads the x latest images on FarmBot system.
function downloadImages(numberOfImagesToDownload, scanFolderPath, thumbsFolderPath) {
	return new Promise((resolve, reject) => {
	// Set the settings for the API request.
	var apiRequest = {
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
	$.ajax(apiRequest)
		.done(async function (response) {
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
				await generateImageThumbnail(savedResponse[i], scanFolderPath, thumbsFolderPath);

				i += 1;
			}
		}).then(function(response){
			resolve('Done dowloading images');
		});
});
}

function downloadSingleImage(savedResponse, scanFolderPath) {
	// Download one image to scan folder.
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

function generateImageThumbnail(savedResponse, scanFolderPath, thumbsFolderPath) {
	// Create thumbnail from given image.
	return new Promise((resolve, reject) => {
		const sharp = require('sharp'),
		fs = require('fs');

		fs.readFile(scanFolderPath + "/" + savedResponse.id + ".jpg", (err, img) => {
			if (err) throw err;
			if (!fs.existsSync(thumbsFolderPath + "/" + savedResponse.id + ".jpg")) {
				sharp(img)
				.resize({ width: 100 })
				.toFile(thumbsFolderPath + "/" + savedResponse.id + ".jpg")
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

	return new Promise((resolve, reject) => {
		var apiRequest = {
			"url": "https://my.farmbot.io/api/points",
			"method": "GET",
			"timeout": 0,
			"headers": {
				"Authorization": "Bearer " + sessionToken,
				"Access-Control-Allow-Origin": "*",
				"Content-Type": "application/json"
			},
		};

		$.ajax(apiRequest)
			.done(function (response) {
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
			console.log('Farm size saved to folder.');
		});
}

async function createScan() {
	var stepX;
	var stepY;
	var startingX = 0;
	var startingY = 0;

	// Check if can connect to API.
	if (!apiConnected) {
		const errModal = new bootstrap.Modal(document.getElementById('connection-error-modal'));
		errModal.show();

		return;
	}

	// Elements for hiding/showing when scanning.
	const startBtn = document.getElementById("start-scan-btn"),
	loadingSpinner = document.getElementById("scan-progress-spinner"),
	dateTimeInfoHolder = document.getElementById("scan-datetime-info"),
	backBtn = document.getElementsByClassName("btn-back")[0];
	// Elements for grabbing scan settings.
	const farmSizeX = Number(document.getElementById("inputXAxis").value),
	farmSizeY = Number(document.getElementById("inputYAxis").value),
	scanStartingZ = Number(document.getElementById("inputStartingZ").value);

	// Check if values are valid.
	let invalidValues = false;
	if (!(farmSizeX >= 100)) {
		document.getElementById("inputXAxis").classList.add("is-invalid");
		invalidValues = true;
	} else {
		document.getElementById("inputXAxis").classList.remove("is-invalid");
	}

	if (!(farmSizeY >= 100)) {
		document.getElementById("inputYAxis").classList.add("is-invalid");
		invalidValues = true;
	} else {
		document.getElementById("inputYAxis").classList.remove("is-invalid");
	}

	if (scanStartingZ == '') {
		document.getElementById("inputStartingZ").classList.add("is-invalid");
		invalidValues = true;
	} else {
		document.getElementById("inputStartingZ").classList.remove("is-invalid");
	}

	if (invalidValues) {
		return;
	}

	// Create new soft limited lengths
	var softLimitedDeviceXmax = farmSizeX - 50; // -50 here to ensure motor does not stall by trying to go outside of X axis rails
	var softLimitedDeviceYmax = farmSizeY - 50; // -50 here to ensure motor does not stall by trying to go outside of Y axis rails

	// Calculate the steps per axis depending on the Device size and the level of increment (The higher the increment, the worse the render quality); and remove decimal
	stepX = Math.trunc((softLimitedDeviceXmax-startingX)/stepQuality);
	stepY = Math.trunc((softLimitedDeviceYmax-startingY)/stepQuality);

	// Disable and hide scan button.
	startBtn.setAttribute("disabled", "");
	startBtn.classList.add("d-none");

	// Disable back button.
	backBtn.setAttribute("disabled", "");
	
	// Show loading spinner.
	loadingSpinner.classList.remove("d-none");

	// Create folder and get folderpath.
	const folderPaths = await createScanFolder();

	// Get plant data.
	savePlantData(folderPaths[0]);

	// Get current scan's farm size and save it in scan folder.
	saveFarmSize(folderPaths[0]);

	// Grab the date time of current scan from folderpath.
	const scanFolderpathSplit = folderPaths[0].split(path.sep);
	const dateTimeFolName = scanFolderpathSplit[scanFolderpathSplit.length - 1];

	// Show date-time of current scan.
	dateTimeInfoHolder.classList.remove("d-none");
	document.getElementById("current-scan-datetime").innerHTML = dateTimeFolName;

	var logNumber=0;
	var device = new farmbot.Farmbot({ token: sessionToken });

	// Get user's light pin number.
	const currentUserObj = {userId: lastLoggedInUserID},
	currentUserDev = await getDbRowWhere('device', currentUserObj),
	lightPinNum = currentUserDev[0].lightPinNum;

	// Lua Function
	var myLua = `
	photo_count = 0

	find_home("all")
	
	pinLED = read_pin(${lightPinNum})
	send_message("info", pinLED)
	if (pinLED == 0) then
		send_message("info", "LED is OFF, turning it ON")
		write_pin(${lightPinNum}, "digital", 1)
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
		wait(5000)
		collectgarbage()
	end
	send_message("info", "PhotoCount:" .. photo_count)
	wait(10000)
	find_home("all")

	pinLED = read_pin(${lightPinNum})
	send_message("info", pinLED)
	if (pinLED == 1) then
		send_message("info", "LED is ON, turning it OFF")
		write_pin(${lightPinNum}, "digital", 0)
		send_message("info", "LED is OFF")
	else
		send_message("info", "LED is OFF")
	end
	wait(10000)
	send_message("success", "Chance App done scanning farm")
	`;
	
	device.on("logs", (log) => {
		console.log("("+ logNumber +")New log: " + log.message);
		logNumber++;
		if (log.message == "download images now") {
			// Download images from API
			console.log("Images are being downloaded to: " + folderPaths[0]);
			console.log("Thumbnails are being created to: " + folderPaths[1]);
			console.log("Download images now...");
			downloadImages(98, folderPaths[0], folderPaths[1]);
			// Maybe delete old images
			// Move bot to next row (A1, A2, etc..)
		}
		var myStr = log.message;
		myArrStr = myStr.split(":");
		if (myArrStr[0] == "PhotoCount") { 
			var imageCount = parseInt(myArrStr[1]);
			if (imageCount<101){//We have reached end of small scan
				// Download images from API
				console.log("Images are being downloaded to: " + folderPaths[0]);
				console.log("Thumbnails are being created to: " + folderPaths[1]);
				console.log("Download images now...");
				downloadImages(imageCount-1, folderPaths[0], folderPaths[1]);
				// Maybe delete old images
				// Move bot to next row (A1, A2, etc..)
			}
			if (imageCount>101){//We have reached end of big scan
				// Download images from API
				console.log("Images are being downloaded to: " + folderPaths[0]);
				console.log("Thumbnails are being created to: " + folderPaths[1]);
				console.log("Download images now...");
				downloadImages(100, folderPaths[0], folderPaths[1]);
				// Maybe delete old images
				// Move bot to next row (A1, A2, etc..)
			}
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

async function pageStartUp() {
	// Check which user was last logged in.
	lastLoggedInUserID = parseInt(localStorage.getItem('lastLoginUserID'));
	// Get db data.
	const currentUserObj = {userId: lastLoggedInUserID},
	userCreds = await getDbRowWhere('user', currentUserObj),
	devSettings = await getDbRowWhere('device', currentUserObj);
	return new Promise((resolve, reject) => {
		// Check if a session token was passed from the previous page.
		sessionToken = window.location.hash.substring(1);

		if (sessionToken == null || sessionToken == "" || sessionToken == "undefined") {
			// If none found, generate new one.
			// Get the user's credentials from db, using lastLoggedInUserID.
			const emailAdd = userCreds[0].email,
			password = userCreds[0].password;

			// Generate a session token for this user with the API.
			var apiRequest = {
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
			$.ajax(apiRequest)
				.done(function (response) {
					sessionToken = response.token.encoded;
					console.log("Session token generated: " + sessionToken);
					apiConnected = true;
				}).then(function(response){
					resolve(response);
				});
		} else {
			setUserName();
		}

		// Pre-fill scan settings form db.
		const dbXAxis = devSettings[0].xMax,
		dbYAxis = devSettings[0].yMax,
		dbZHeight = devSettings[0].zScanHeight;

		document.getElementById('inputXAxis').value = dbXAxis;
		document.getElementById('inputYAxis').value = dbYAxis;
		document.getElementById("inputStartingZ").value = dbZHeight;
	});
}

function setUserName() {
	return new Promise((resolve, reject) => {
		var apiRequest = {
			"url": "https://my.farmbot.io/api/users",
			"method": "GET",
			"timeout": 0,
			"headers": {
				"Authorization": "Bearer " + sessionToken,
				"Access-Control-Allow-Origin": "*",
				"Content-Type": "application/json"
			},
		};

		$.ajax(apiRequest)
			.done(function (response) {
				document.getElementById("current-user-name").innerHTML = response[0].name;
			}).then(function(response){
				resolve(response);
			});
	});
}

/*  The follow code does not work due to current FarmBot API limitations.
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
	//fs.rmdirSync(folderPathFromDb, { recursive: true });

	// Delete scan entry in database.

	// Cancel scan sequence.
	var device = new farmbot.Farmbot({ token: sessionToken });
	device.connect()
	.then(function () {
		return device.rebootFirmware();
	});
	
	// Maybe load a toast to confirm scan cancellation?
} */
