$(document).ready(function() {
	getSessionToken();
	setUserDetails();
});

function setUserDetails() {
	lastLoggedInUserID = parseInt(localStorage.getItem('lastLoginUserID'));
	let userName, emailAdd;
	
	// Get user details from database.


	// Set the user's details.
	document.getElementById("current-user-name").innerHTML = userName;
	document.getElementById("current-email-add").innerHTML = emailAdd;		
}

function logout() {
	localStorage.removeItem('lastLoginUserID');

	window.location.href = "login.html";
}