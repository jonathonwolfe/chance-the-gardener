const sqlite3 = require('sqlite3').verbose();

$(document).ready(function() {
	getSessionToken();
});

let emailAdd,
password,
userID;

// DELETE THIS FUNC IN FINAL BUILD!!!
function tempLogin() {
	emailAdd = "***REMOVED***";
	password = "***REMOVED***";
	generateToken(emailAdd, password);
}

function saveCredentials() {
	// Grab credentials from form.
	emailAdd = "***REMOVED***";
	password = "***REMOVED***";
	//emailAdd = document.getElementById("email").value;
	//password = document.getElementById("password").value;

	// Check if there are other past users in the app.

	// Check if email matches an existing user in db.

	// Ask to merge if no match, otherwise do it automatically.

	// If merging, update the db entry with no credentials.

	// If not merging, create new user in db.
	// Open the database connection.
	let db = new sqlite3.Database('./database/Chance_the_Gardener.db');
	// Increment User_ID.

	// Insert new user into table.
	let sql = 'INSERT into User(User_ID, Email, Password) values (1, "' + emailAdd + '", "' + password + '")';
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

	// Save either the merged or new user ID as last logged in.
	// For testing purposes, this user ID will always be 1.
	userID = 1;
	localStorage.setItem('lastLoginUserID', userID);


	generateToken(emailAdd, password);
}