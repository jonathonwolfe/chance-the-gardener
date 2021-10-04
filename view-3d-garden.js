$(document).ready(function() {
	getSessionToken();
});

function launchGardenViewer() {
	const child = require('child_process').execFile,
	executablePath = "./garden_viewer/FarmBot 3D Viewer.exe";

	child(executablePath, function (err, data) {
		console.log(err)
		console.log(data.toString());
	});
}