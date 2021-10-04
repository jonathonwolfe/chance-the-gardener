$(document).ready(async function() {
	getSessionToken();
	createUserSelect();
	await createDateTimeSelect("scans", parseInt(localStorage.getItem('lastLoginUserID')));
});

// Start rendering a set of images to create a 3D model
function createRenders() {
	// Check if renders folder exists yet, and create if not.
	if (!fs.existsSync("./renders")) {
		fs.mkdirSync("./renders");
	}

	// At start, setting the progress bar to 55%
	var i = 0;
	if (i == 0) {
		i = 1;
		var elem = document.getElementById("myBar");
		var width = 1;
		var id = setInterval(frame, 10);
		function frame() {
			if (width >= 55) {
				clearInterval(id);
				i = 0;
			} else {
				width++;
				elem.style.width = width + "%";
			}
		}
	}
	// progress bar stops	

	// execute meshroom application through command line
	var child = require('child_process').execFile;
	var executablePath = "Meshroom-2018.1.0\\meshroom_photogrammetry.exe";
	var parameters = ["--input", "images", "--output", "renders", "--scale", "2"];

	child(executablePath, parameters, function (err, data) {
		console.log(err)
		console.log(data.toString());

		// set progress bar to 100% if process completed.
		let str = data.toString();
		let stage = 0;
		stage = str.search("[13/13]")

		if (stage != 0) {
			var elem = document.getElementById("myBar");
			var width = 1;
			elem.style.width = 100 + "%";
		}
		// end

	});
}

function createRender() {
	
}