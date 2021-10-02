$(document).ready(function() {
	
});

// TODO: Change these to single const obj if only used in one function.
let emailAdd,
pw,
userID;

// TODO: DELETE THIS FUNC IN FINAL BUILD!!!
function tempLogin() {
	document.getElementById("emailInput").value = "***REMOVED***";
	document.getElementById("passwordInput").value = "***REMOVED***";
}

function saveCredentials() {
	emailAdd = document.getElementById("emailInput").value;
	pw = document.getElementById("passwordInput").value;

	// Check if there are other past users in the app.

	// TODO: Check if email matches an existing user in db.

	// Ask to merge if no match, otherwise do it automatically.

	// If merging, update the db entry with new credentials.

	// If not merging, create new user in db.
	// Insert new user into table.
	const userCreds = {email: emailAdd, password: pw}
	addDbTableRow('user', userCreds);

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
				"password": pw
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
