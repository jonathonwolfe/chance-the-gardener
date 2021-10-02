$(document).ready(function() {
	getSessionToken();
	createUserSelect();
	createDateTimeSelect('renders', parseInt(localStorage.getItem('lastLoginUserID')));
});