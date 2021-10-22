$(document).ready(function() {
	loggedInCheck();
	checkSessionToken();
});

function launchGardenViewer() {
	const child = require('child_process').execFile,
	executablePath = path.join(__dirname, 'garden_viewer', 'FarmBot 3D Viewer.exe');
	const launchBtn = document.getElementById("launch-viewer-btn"),
	loadMsg = document.getElementById("viewer-launch-msg"),
	loadingSpinner = document.getElementById("viewer-launch-spinner");

	// Disable launch button.
	launchBtn.setAttribute("disabled", "");

	// Show loading message.
	loadMsg.classList.remove("d-none");
	
	// Show loading spinner.
	loadingSpinner.classList.remove("d-none");

	child(executablePath, function (err, data) {
		log.error(err)
		log.info(data.toString());
	});

	setTimeout(function () {
		// Re-enable launch button.
		launchBtn.removeAttribute("disabled");

		// Hide loading message.
		loadMsg.classList.add("d-none");
		
		// Hide loading spinner.
		loadingSpinner.classList.add("d-none");
	}, 30000);
}