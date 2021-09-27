$(document).ready(function() {
	getSessionToken();
	createUserSelect();
	createDateTimeSelect("renders", localStorage.getItem('lastLoginUserID'));
});