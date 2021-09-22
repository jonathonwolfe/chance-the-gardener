$(document).ready(function() {
	getSessionToken();
	createUserSelect();
	createDateTimeSelect("scans", localStorage.getItem('lastLoginUserID'));
});