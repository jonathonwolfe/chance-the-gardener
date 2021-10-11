$(document).ready(async function() {
	appStartUp();
});

async function appStartUp() {
	// Check if user database exists.
	if (fs.existsSync(path.join(__dirname, 'db', 'user.json'))) {
		// Check if there's actually data in it.
		const userDbLength = await getDbTableSize('user');
		if (userDbLength >= 1) {
			// Check if a user has logged in yet.
			if (localStorage.getItem('lastLoginUserID') != null) {
				await mainMenuStartUp();
				await setWelcomeMsgName();
			} else {
				changePage('login.html');
			}
		} else {
			changePage('login.html');
		}
	} else {
		// Fresh install, go to login and set up files.
		setupDbFiles();

		changePage('login.html');
	}
}

function setupDbFiles() {
	// Check if database folder exists yet, and create if not.
	if (!fs.existsSync(path.join(__dirname, 'db'))) {
		fs.mkdirSync(path.join(__dirname, 'db'));
	}

	// Create new db files.
	createNewDbTable('device');
	createNewDbTable('user');
}

function createNewDbTable(tableName) {
	const location = path.join(__dirname, 'db');
	db.createTable(tableName, location, (succ, msg) => {
		if (succ) {
			console.log(msg + 'JSON db created.')
		} else {
			console.log('An error has occured. ' + msg)
		}
	});
}

async function mainMenuStartUp() {
	// Check which user was last logged in.
	lastLoggedInUserID = parseInt(localStorage.getItem('lastLoginUserID'));
	// Get db data.
	const currentUserObj = {userId: lastLoggedInUserID},
	userCreds = await getDbRowWhere('user', currentUserObj);
	return new Promise((resolve, reject) => {
		// Check if a session token was passed from the previous page.
		sessionToken = window.location.hash.substring(1);

		if (sessionToken == null || sessionToken == "" || sessionToken == "undefined") {
			// If none found, generate new one.
			// Get the user's credentials from db, using the user ID.
			const emailAdd = userCreds[0].email,
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
