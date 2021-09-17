//Z coord for Scaning Garden will be hardcoded into 0.
//User need to enter the starting coord (x1,y1), and (x2,y2)
//



function scanGardenTest () {
	//move to the desired starting position
	var x1= parseInt(document.getElementById("starting_xCoord").value);
	var y1= parseInt(document.getElementById("starting_yCoord").value);
	var x2= parseInt(document.getElementById("ending_xCoord").value);
	var y2= parseInt(document.getElementById("ending_yCoord").value);
	var y_holder = y1;

	print (x1,x2,y1,y2);
	//record the number of images taken
	var n = 0;
	var farmbot123 = new fbjs.Farmbot({ token: TOKEN });
	//check current position on Y axis
	while (y_holder<=y2) {
		//initiate  x_holder's value
		let x_holder = x1;
		//check current position on X axis
		while (x_holder <= x2){
		//move to (x_holder,y_holder), wait for 2000 ms
		farmbot123
		.connect()
		.then( async()=> {
			if (x_holder = x2) {} 
			await new Promise(r => setTimeout(r, 2000));
			return farmbot123.moveAbsolute({ x: x_holder, y: y_holder, z: 0, speed: 100 });
		});		
		//take picture, wait for 2000 ms
		farmbot123
		.connect()
		.then(async ()=> {
			await new Promise(r => setTimeout(r, 2000));
			return farmbot123.takePhoto({});
		});		
		//increment the number of images taken by 1		
		n+=1;
		//check if farmbot has taken 50 new images
		if (n%50==0){
		//save 50 new images
		var settings = {
			"url": "https://my.farm.bot/api/images",
			"method": "GET",
			"timeout": 0,
			"headers": {
			  "Authorization": "***REMOVED***",
			  "Cookie": "***REMOVED***"
			},
		  };
		  
		  // Make var to store the response
		  var savedResponse;		  
		  // Acess the response and save it to the variable
		  $.ajax(settings).done(function (response) {
			  //console.log(response);
				savedResponse = response;  
				// x is the number of images the user want to download
			  var x = 50
			  // 0 is the newest images, it will be downloaded first, then the second newest, and so on. 
			  var i = 0	  		  		  		  		  
			  while (i <= x) {	  			  
				  // Call python script and pass arguments to save the image to local folder
				  const spawn = require("child_process").spawn;
				  const pythonProcess = spawn('python',["saveImage.py", savedResponse[i].attachment_url, savedResponse[i].id]);
				  i += 1;
		}
	});
		//increment x_holder by 50mm
		x_holder += 50;
		}
		//increment y_holder by 50mm
		y_holder += 50;	
	}}
}
