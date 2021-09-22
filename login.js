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
emailAdd = document.getElementById("email").value;
	password = document.getElementById("password").value;



	let db = new sqlite3.Database('./database/Chance_the_Gardener.db');
	// Increment User_ID.

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


	//generateToken(emailAdd, password);
}
