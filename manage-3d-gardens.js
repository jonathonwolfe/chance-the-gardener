$(document).ready(function() {
	getSessionToken();
	createUserSelect();
	await createDateTimeSelect('renders', parseInt(localStorage.getItem('lastLoginUserID')));
});