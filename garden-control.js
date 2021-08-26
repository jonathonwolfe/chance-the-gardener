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

function scanGardenTest () {
	//move to the desired starting position
	var x1= parseInt(document.getElementById("starting_xCoord").value);
	var y1= parseInt(document.getElementById("starting_yCoord").value);
	var x2= parseInt(document.getElementById("ending_xCoord").value);
	var y2= parseInt(document.getElementById("ending_yCoord").value);
	var z = 0;
	var y_holder = y1;
  //needs to install sleep module
	var sleep = require('sleep');
	//record the number of images taken
	var n = 0;
	var farmbot123 = new fbjs.Farmbot({ token: TOKEN });
	//check current position on Y axis
	while (y_holder<=y2) {
		//initiate  x_holder's value
		let x_holder = x1;
		//check current position on X axis
		while (x_holder <= x2){
		//move to (x_holder,y_holder)
		farmbot123
		.connect()
		.then( function () {
      //sleep for 60 secs
			sleep.sleep(60)
			return farmbot123.moveAbsolute({ x: x_holder, y: y_holder, z: z, speed: 100 });
		})
		.then( function () {
			sleep.sleep(60)
		return farmbot123.takePhoto({});
		});
		//increment the number of images taken by 1
		n+=1;

		//check if farmbot has taken 50 new images
		if (n%400==0){
		//save 400 new images
		var settings = {
			"url": "https://my.farm.bot/api/images",
			"method": "GET",
			"timeout": 0,
			"headers": {
			  "Authorization": "***REMOVED***",
			  "Cookie": "***REMOVED***"
		},};
		  
		  // Make var to store the response
		  var savedResponse;		  
		  // Acess the response and save it to the variable
		  $.ajax(settings).done(function (response) {
			  //console.log(response);
				savedResponse = response;  
				// x is the number of images the user want to download
			    var NumOfImg = 400
			    // 0 is the newest images, it will be downloaded first, then the second newest, and so on. 
			    var ImgCounter = 0	  		  		  		  		  
			    while (ImgCounter <= NumOfImg) {	  			  
				    // Call python script and pass arguments to save the image to local folder
				    const spawn = require("child_process").spawn;
				    const pythonProcess = spawn('python',["saveImage.py", savedResponse[ImgCounter].attachment_url, savedResponse[ImgCounter].id]);
				   i += 1;}});}
		//increment x_holder by 50mm
		x_holder += 50;
	}
		//increment y_holder by 50mm
		y_holder += 50;	
}
}

