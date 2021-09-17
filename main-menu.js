$(document).ready(async function() {
	await mainMenuStartUp();
	await setWelcomeMsgName();
});

function mainMenuStartUp() {
	return new Promise((resolve, reject) => {
		// Check if a session token was passed from the previous page.
		sessionToken = window.location.hash.substring(1);

		if (sessionToken == null || sessionToken == "") {
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
