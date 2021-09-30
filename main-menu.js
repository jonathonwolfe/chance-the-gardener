$(document).ready(async function() {
	appStartUp();
});

async function appStartUp() {
	const fs = require('fs');
	// Check if user database exists.
	if (fs.existsSync('./db/User.csv')) {
		// Check if there's actually data in it.
		const userDbLength = await getDbLength('User');
		console.log(userDbLength);
		if (userDbLength >= 1) {
			await mainMenuStartUp();
			await setWelcomeMsgName();
		}
	} else {
		// Fresh install, go to login and set up files.
		// Check if database folder exists yet, and create if not.
		if (!fs.existsSync('./db')) {
			fs.mkdirSync('./db');
		}
		await createNewDb('Device', 'Device_ID INTEGER NOT NULL, Name TEXT, OS_Version TEXT, X_max REAL, Y_max REAL, Light_pin_num INTEGER, User_ID INTEGER, PRIMARY KEY(Device_ID)');
		await createNewDb('Render', 'Render_ID INTEGER NOT NULL, DateTime TEXT NOT NULL, Folder_path TEXT NOT NULL, User_ID INTEGER NOT NULL, PRIMARY KEY(Render_ID)');
		await createNewDb('Scan', 'Scan_ID INTEGER, DateTime TEXT, Folder_path TEXT, User_ID INTEGER, PRIMARY KEY(Scan_ID)');
		await createNewDb('User', 'Email TEXT UNIQUE, Password TEXT, User_ID INTEGER, PRIMARY KEY(User_ID)');

		//await importDbTable();
		//await addDbUser();
		//await updateDbTableCSV();
	}
}

function createNewDb(tableName, fields) {
	return new Promise((resolve, reject) => {
		var myDb = new alasql.Database();
		myDb.exec('CREATE TABLE ' + tableName + ' ('+ fields + ')');
		// TODO: Delete testing lines.
//		myDb.exec('INSERT INTO ' + tableName + ' (Email, Password) VALUES ("***REMOVED***", "***REMOVED***");');
//		myDb.exec('INSERT INTO ' + tableName + ' (Email, Password) VALUES ("notjon@email.com", "***REMOVED***");');

		var tableContent = myDb.exec('SELECT * FROM ' + tableName);
		alasql.promise('SELECT * INTO CSV("./db/' + tableName + '.csv", {headers:true}) FROM ?',[tableContent])
			.then(function() {
				console.log(tableName + ' table created.');
				resolve();
			}).catch(function(err) {
				console.log('Error:', err);
			});;
	});
}

function importDbTable(tableName) {
	return new Promise((resolve, reject) => {
		alasql.promise([
			'CREATE TABLE ' + tableName + ' (Email TEXT UNIQUE, Password TEXT, User_ID INTEGER, PRIMARY KEY(User_ID))',
			'SELECT * INTO User FROM CSV("./db/' + tableName + '.csv", {headers:true})'
		])
			.then(function(data) {
				console.log(data);
				resolve();
			}).catch(function(err) {
				console.log('Error:', err);
			});
	});
}

function addDbUser() {
	return new Promise((resolve, reject) => {
		alasql.promise('SELECT * FROM User ORDER BY User_ID DESC LIMIT 1')
			.then(function(data){
				console.log(data);
				var latestUserID = data[0].User_ID;
				alasql('INSERT INTO User (Email, Password, User_ID) VALUES ("thirdjon@3mail.com", "***REMOVED***", '+ (latestUserID + 1) +');');
				console.log(alasql("SELECT * FROM User"));
				resolve();
			}).catch(function(err){
				console.log('Error:', err);
			});
	});
}

function mainMenuStartUp() {
	return new Promise((resolve, reject) => {
		// Check if a session token was passed from the previous page.
		sessionToken = window.location.hash.substring(1);

		if (sessionToken == null || sessionToken == "" || sessionToken == "undefined") {
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
			setWelcomeMsgName();
		}
	});
}

function setWelcomeMsgName() {
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
			document.getElementById("welcome-msg").innerHTML = "Hi, " + response[0].name;
		}).then(function(response){
			resolve(response);
		});
	});
}
