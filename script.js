const farmbot = require('farmbot');
window.$ = window.jQuery = require('jquery');
window.bootstrap = require('bootstrap');
const db = require('electron-db');
const fs = require('fs');
const path = require('path');

let lastLoggedInUserID,
sessionToken;

async function loadLastUser() {
	// Check which user was last logged in.
	lastLoggedInUserID = parseInt(localStorage.getItem('lastLoginUserID'));

	// Get the user's credentials from db, using the user ID.
	const currentUserObj = {userId: lastLoggedInUserID},
	userCreds = await getDbRowWhere('user', currentUserObj),
	emailAdd = userCreds[0].email,
	password = userCreds[0].password;

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

function setLEDon() {
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
			dateTimeOption.value = folderList[i];
			// Make it more readable.
			dateTimeOption.textContent = formatDateTimeReadable(folderList[i]);

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

function formatDateTimeReadable(dateTime) {
	const moment = require('moment'),
	momentDateTime = moment(dateTime, 'YYYY-MM-DD HH-mm-ss'),
	formattedDateTime = momentDateTime.format('D MMM YYYY hh:mm:ss A');

	return formattedDateTime;
}

async function createUserSelect() {
	// Create an array of user IDs and their emails from the database.
	var userIDList = await getDbEntireTable('user');

	// Add values to select list.
	const selectList = document.getElementById("user-select");
	for (let i = 0; i < userIDList.length; i++) {
		let userOption = document.createElement("option");
		userOption.textContent = userIDList[i].email;
		userOption.value = userIDList[i].userId;
		selectList.appendChild(userOption);
	}
}

function reloadDateTimeSelect(type) {
	const user = document.getElementById("user-select").value;

	// Remove old list.
	$('#date-time-select').empty();

	// Create new list.
	createDateTimeSelect(type, user);
}

async function addDbTableRow(tableName, rowObj) {
	// Increment the ID.
	const tableLength = await getDbTableSize(tableName),
	newId = tableLength + 1,
	idType = tableName + 'Id';
	rowObj[idType] = newId;
	
	// Insert the new row.
	const location = path.join(__dirname, 'db');
	if (db.valid(tableName, location)) {
		db.insertTableContent('user', location, rowObj, (succ, msg) => {
			console.log("Success: " + succ);
			console.log("Message: " + msg);
		})
	}
}

function getDbTableSize(tableName) {
	return new Promise((resolve, reject) => {
		// Returns the length of a table as an integer.
		const location = path.join(__dirname, 'db');
		db.count(tableName, location, (succ, data) => {
			if (succ) {
				resolve(data);
			} else {
				console.log('An error has occured.');
				console.log(data);
				reject(data);
			}
		})
	});
}

function getDbEntireTable(tableName) {
	return new Promise((resolve, reject) => {
		// Returns an array of the entire table.
		const location = path.join(__dirname, 'db');
		db.getAll(tableName, location, (succ, data) => {
			resolve(data);
		});
	});
}

function getDbRowWhere(tableName, where) {
	return new Promise((resolve, reject) => {
		// "where" is an object of values to match.
		const location = path.join(__dirname, 'db');
		db.getRows(tableName, location, where, (succ, result) => {
			if (succ) {
				// Returns an array of matching row objects.
				resolve(result);
			} else {
				console.log('An error has occured.');
				console.log(result);
				reject(result);
			}
		})
	});	
}