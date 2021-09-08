$(document).ready(function() {
	loadLastUser();
	setWelcomeMsgName();
});

function setWelcomeMsgName() {
	$.ajax(settings).done(function (response) {
		document.getElementById("welcome-msg").innerHTML = "Hi, " + response.user.name;
	});
}