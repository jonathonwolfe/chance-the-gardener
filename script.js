const farmbot = require('farmbot');
window.$ = window.jQuery = require('jquery');
window.bootstrap = require('bootstrap');
const db = require('electron-db');
const fs = require('fs');
const path = require('path');
const log = require('electron-log');

let lastLoggedInUserID,
sessionToken,
apiConnected = false;

async function loadLastUser() {
	// Check which user was last logged in.
	lastLoggedInUserID = parseInt(localStorage.getItem('lastLoginUserID'));

	// Get the user's credentials from db, using the user ID.
	const currentUserObj = {userId: lastLoggedInUserID},
	userCreds = await getDbRowWhere('user', currentUserObj),
	emailAdd = userCreds[0].email,
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
			log.info("Session token generated: " + sessionToken);
			apiConnected = true;
		});
}

function changePage(pagePath) {
	window.location.href = pagePath + '#' + sessionToken;
}

function getSessionToken() {
	return new Promise((resolve, reject) => {
		// Check if a session token was passed from the previous page.
		sessionToken = window.location.hash.substring(1);
	});
}

async function checkSessionToken() {
	await getSessionToken();

	if (sessionToken == null || sessionToken == "" || sessionToken == "undefined") {
		// If none found, generate new one.
		loadLastUser();
	}
}

// Get list of folders in a directory.
async function getFoldersList(type, user_Id) {
	const { readdirSync } = require('fs');
	let foldersList = [];
	// Get user's email from db.
	const currentUserObj = {userId: user_Id},
	userCreds = await getDbRowWhere('user', currentUserObj),
	emailAdd = userCreds[0].email;
	if (type == 'scans') {
		try {
			foldersList = 
			readdirSync(path.join(__dirname, 'scans', emailAdd), { withFileTypes: true })
				.filter(dirent => dirent.isDirectory())
				.map(dirent => dirent.name);
		} catch (err) {
			// User folder probably doesn't exist.
			log.error(err);
		}
	} else if (type =='renders') {
		try {
			foldersList = 
			readdirSync(path.join(__dirname, 'garden_viewer', 'FarmBot 3D Viewer_Data', 'FarmBotData', 'Renders', emailAdd), { withFileTypes: true })
				.filter(dirent => dirent.isDirectory())
				.map(dirent => dirent.name);
		} catch (err) {
			// User folder probably doesn't exist.
			log.error(err);
		}
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
				log.error('An error has occured.');
				log.error(data);
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
				log.error('An error has occured.');
				log.error(result);
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
				log.error('An error has occured.');
				log.error(result);
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

		$.ajax(apiRequest)
			.done(function (response) {
				log.info("Found this many PINs: " + response.length);
				// Loop through the PINs to find the pin with LIGHTING as its label
				for (let i = 0; i < response.length; i++) {
					if (response[i].label == "Lighting"){
						log.info("Found Light on PIN " + response[i].pin);
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

		device.on("logs", (logs) => {
			let str = logs.message;
			var myArr = str.split(":");
			if (myArr[0] == "FarmBot Device Size") {
				//Save the coordinates
				deviceXmax = parseFloat(myArr[1]); 
				deviceYmax = parseFloat(myArr[2]);
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

async function loggedInCheck() {
	// Check if there's data in the user db.
	const userDbLength = await getDbTableSize('user');
	if (userDbLength >= 1) {
		// Check if a user has logged in yet.
		if (localStorage.getItem('lastLoginUserID') == null) {
			changePage('login.html');
		}
	} else {
		changePage('login.html');
	}
}