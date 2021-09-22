const sqlite3 = require('sqlite3').verbose();

$(document).ready(function() {
	
});

let emailAdd,
password,
userID;

// DELETE THIS FUNC IN FINAL BUILD!!!
function tempLogin() {
	document.getElementById("email").value = "***REMOVED***";
	document.getElementById("password").value = "***REMOVED***";
}

function saveCredentials() {
	emailAdd = document.getElementById("email").value;
	password = document.getElementById("password").value;

	// Check if there are other past users in the app.

	// TODO: Check if email matches an existing user in db.

	// Ask to merge if no match, otherwise do it automatically.

	// If merging, update the db entry with new credentials.

	// If not merging, create new user in db.
	let db = new sqlite3.Database('./database/Chance_the_Gardener.db');

	// Insert new user into table.
	let sql = 'INSERT into User( Email, Password) values ("' + emailAdd + '", "' + password + '")';
	// Output the INSERT statement
	console.log(sql);

	db.run(sql, function(err) {
	if (err) {
		return console.error(err.message);
	}
	console.log(`Rows inserted ${this.changes}`);
	});

	// Close the database connection.
	db.close();

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

	// Save either the merged or new user ID as last logged in.
	// userID = TODO: Get userID of the matching emailAdd from db.
	// For testing purposes, this user ID will always be 1.
	userID = 1;
	localStorage.setItem('lastLoginUserID', userID);
}
