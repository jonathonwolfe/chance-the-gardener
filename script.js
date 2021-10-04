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

// TODO: Delete later.
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

// TODO: Delete later.
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

// Get list of folders in a directory.
async function getFoldersList(type, user_Id) {
	const { readdirSync } = require('fs');
	let foldersList = [];
	// Get user's email from db.
	const currentUserObj = {userId: user_Id},
	userCreds = await getDbRowWhere('user', currentUserObj),
	emailAdd = userCreds[0].email;

	try {
		foldersList = 
		readdirSync(type + "\\" + emailAdd, { withFileTypes: true })
			.filter(dirent => dirent.isDirectory())
			.map(dirent => dirent.name);
	} catch (err) {
		// User folder probably doesn't exist.
		console.log("Error reading user folder.");
	}

	return foldersList;
}

async function createDateTimeSelect(type, userID) {
	const folderList = await getFoldersList(type, parseInt(userID));
	return new Promise((resolve, reject) => {
		const selectList = document.getElementById("date-time-select");

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
		resolve();
	});
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

async function reloadDateTimeSelect(type) {
	const user = document.getElementById("user-select").value;

	// Remove old list.
	$('#date-time-select').empty();

	// Create new list.
	await createDateTimeSelect(type, user);
}

async function addDbTableRow(tableName, rowObj) {
	const tableLength = await getDbTableSize(tableName);
	return new Promise((resolve, reject) => {
		// Increment the ID.
		const newId = tableLength + 1,
		idType = tableName + 'Id';
		rowObj[idType] = newId;
		
		// Insert the new row.
		const location = path.join(__dirname, 'db');
		if (db.valid(tableName, location)) {
			db.insertTableContent(tableName, location, rowObj, (succ, msg) => {
				if (succ) {
					resolve(msg);
				} else {
					reject(msg);
				}
				
			})
		}
	});
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

function updateDbRowWhere(tableName, where, newData) {
	return new Promise((resolve, reject) => {
		// "where" is an object of values to match.
		// "newData" is an object of values to update.
		const location = path.join(__dirname, 'db');
		db.updateRow(tableName, location, where, newData, (succ, result) => {
			if (succ) {
				resolve(succ);
			} else {
				console.log('An error has occured.');
				console.log(result);
				reject(result);
			}
		})
	});	
}

function findLightPin() {
	return new Promise((resolve, reject) => {
		var apiRequest = {
			"url": "https://my.farmbot.io/api/peripherals",
			"method": "GET",
			"timeout": 0,
			"headers": {
				"Authorization": "Bearer " + sessionToken,
				"Access-Control-Allow-Origin": "*",
				"Content-Type": "application/json"
			},
		};

		$.ajax(apiRequest).done(function (response) {
			console.log("Found this many PINs: " + response.length);
			// Loop through the PINs to find the pin with LIGHTING as its label
			for (let i = 0; i < response.length; i++) {
				if (response[i].label == "Lighting"){
					console.log("Found Light on PIN " + response[i].pin);
					resolve(response[i].pin);
				}
			}
		});
	});
}

function getFarmSize() {
	// Return an array with the current user's farm size.
	return new Promise((resolve, reject) => {
		var device = new farmbot.Farmbot({ token: sessionToken });
		
		// Lua Function
		var myLua = `
		function get_length(axis)
			local steps_per_mm = read_status("mcu_params",
											"movement_step_per_mm_" .. axis)
			local nr_steps =
				read_status("mcu_params", "movement_axis_nr_steps_" .. axis)
			return nr_steps / steps_per_mm
		end
		xVal = get_length("x")
		yVal = get_length("y")
		message = "FarmBot Device Size:" .. xVal .. ":" .. yVal
		send_message("info", message)
		`;

		device.on("logs", (log) => {
			let str = log.message;
			var myArr = str.split(":");
			if (myArr[0] == "FarmBot Device Size") {
				//Save the coordinates
				deviceXmax = parseFloat(myArr[1]); 
				deviceYmax = parseFloat(myArr[2]);
				console.log("FarmBot Device Size: [" + deviceXmax + "," + deviceYmax + "]");
				resolve([deviceXmax, deviceYmax]);
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
	});
}