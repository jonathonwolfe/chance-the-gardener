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

//At start, setting the progress bar to 55%
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
//progress bar stops	


	var child = require('child_process').execFile;
	var executablePath = "Meshroom-2018.1.0\\meshroom_photogrammetry.exe";
	var parameters = ["--input", "images", "--output", "renders", "--scale", "2"];

	child(executablePath, parameters, function(err, data) {
		console.log(err)
		console.log(data.toString());

		//set progress bar to 100% if process completed.
		let str = data.toString(); 
		let stage = 0;
		stage = str.search("[13/13]")
		
		  if (stage != 0) {
		    var elem = document.getElementById("myBar");
		    var width = 1;
		    elem.style.width = 100 + "%";
		  }
		//end  
		


	});
}