$(document).ready(function() {
	getSessionToken();
	createUserSelect();
	await createDateTimeSelect("scans", parseInt(localStorage.getItem('lastLoginUserID')));
});