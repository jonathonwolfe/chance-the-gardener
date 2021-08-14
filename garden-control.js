var TOKEN = "***REMOVED***";
		
function takePhoto() {
	var farmbot123 = new fbjs.Farmbot({ token: TOKEN });

	farmbot123
	.connect()
	.then(function () {
		return farmbot123.takePhoto({});
	});
}

function toggleLight() {
	var farmbot123 = new fbjs.Farmbot({ token: TOKEN });

	farmbot123
	.connect()
	.then(function () {
		return farmbot123.togglePin({ pin_number: 7 });
	});
}

function myFunction(xx,yy,zz) {
	var farmbot123 = new fbjs.Farmbot({ token: TOKEN });

	farmbot123
	.connect()
	.then(function () {
		return farmbot123.moveAbsolute({ x: xx, y: yy, z: zz, speed: 100 });
	});
}

function sendLogMessage() {
	var farmbot123 = new fbjs.Farmbot({ token: TOKEN });

	farmbot123
	.connect()
	.then(function () {
		return farmbot123.sendMessage("info", "Log Test: 02 JS API");

	});
}

function createRenders() {
	var child = require('child_process').execFile;
	var executablePath = "Meshroom-2018.1.0\\meshroom_photogrammetry.exe";
	var parameters = ["--input", "images", "--output", "renders", "--scale", "2"];

	child(executablePath, parameters, function(err, data) {
		console.log(err)
		console.log(data.toString());
	});
}