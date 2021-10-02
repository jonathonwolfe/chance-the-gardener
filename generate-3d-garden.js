$(document).ready(function() {
	getSessionToken();
	createUserSelect();
	createDateTimeSelect("scans", parseInt(localStorage.getItem('lastLoginUserID')));
});