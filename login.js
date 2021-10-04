let emailAdd,
pw;

// TODO: DELETE THIS FUNC IN FINAL BUILD!!!
function tempLogin() {
	document.getElementById("emailInput").value = "***REMOVED***";
	document.getElementById("passwordInput").value = "***REMOVED***";
}

function logIn() {
	emailAdd = document.getElementById("emailInput").value;
	pw = document.getElementById("passwordInput").value;

	// Check if credentials are valid, and generate a session token with the API.
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
				"password": pw
			}
		}),
	};
	$.ajax(apiRequest)
		.done(function (response) {
			// If valid, save the session token and proceed with db stuff.
			sessionToken = response.token.encoded;
			console.log("Session token generated: " + sessionToken);
			saveCredentials();
		})
		.fail(function (err) {
			if (err.responseJSON.auth == "Bad email or password.") {
				// TODO: Tell user incorrect credentials.
				console.log('Invalid login credentials');
			} else {
				// TODO: Generic fail error.
			}
		});
}

async function saveCredentials() {
	// Check if there are other past users in the app.
	const newUserEmailObj = {email: emailAdd},
	matchingUser = await getDbRowWhere('user', newUserEmailObj);

	// Ask to merge if no match, otherwise do it automatically.
	if (matchingUser.length > 0) {
		// If there's a match, update the db entry with new password.
		const newUserPwObj = {password: pw}
		await updateDbRowWhere('user', newUserEmailObj, newUserPwObj);
	} else {
		// If no matching email, ask if they updated email and want to merge.
		const mergeModal = new bootstrap.Modal(document.getElementById('merge-user-modal'));
		mergeModal.show();
	}
}

async function saveUserToDb() {
	// Create new user in db.
	const newUserCredsObj = {email: emailAdd, password: pw};
	await addDbTableRow('user', newUserCredsObj);

	// Save the new user ID as last logged in.
	const newUserEmailObj = {email: emailAdd},
	newUserObj = await getDbRowWhere('user', newUserEmailObj),
	newUserId = newUserObj[0].userId;
	localStorage.setItem('lastLoginUserID', newUserId);

	// Get their farm details and save to db.
	const lightPin = await findLightPin(),
	farmSize = await getFarmSize(),
	newDeviceObj = {
		xMax: farmSize[0],
		yMax: farmSize[1],
		lightPinNum: lightPin,
		zScanHeight: 0,
		userId: newUserId
	};

	await addDbTableRow('device', newDeviceObj);

	changePage('main-menu.html')
}