$(document).ready(function() {
	loggedInCheck();
	checkSessionToken();
	setUserDetails();
});

async function setUserDetails() {
	lastLoggedInUserID = parseInt(localStorage.getItem('lastLoginUserID'));
	
	// Get user details from database and API.
	const currentUserObj = {userId: lastLoggedInUserID},
	userCreds = await getDbRowWhere('user', currentUserObj),
	emailAdd = userCreds[0].email;

	var apiRequest = {
		"url": "https://my.farmbot.io/api/users",
		"method": "GET",
		"timeout": 0,
		"headers": {
			"Authorization": "Bearer " + sessionToken,
			"Access-Control-Allow-Origin": "*",
			"Content-Type": "application/json"
		},
	};

	// Set the user's details.
	$.ajax(apiRequest)
		.done(function (response) {
			document.getElementById("current-user-name").innerHTML = response[0].name;
			apiConnected = true;
		}).then(function(response){
			resolve(response);
		});

	document.getElementById("current-email-add").innerHTML = emailAdd;		
}

function logout() {
	localStorage.removeItem('lastLoginUserID');

	window.location.href = "login.html";
}