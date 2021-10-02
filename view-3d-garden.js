$(document).ready(function() {
	getSessionToken();
	createUserSelect();
	createDateTimeSelect('renders', parseInt(localStorage.getItem('lastLoginUserID')));
});

function launchGardenViewer() {
	const child = require('child_process').execFile,
	executablePath = "garden_viewer\\FarmBot 3D Viewer.exe";
	//parameters = ["--input", "images", "--output", "renders", "--scale", "2"];

	// child(executablePath, parameters, function (err, data) {
	child(executablePath, function (err, data) {
		console.log(err)
		console.log(data.toString());
	});
}