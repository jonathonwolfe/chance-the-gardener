const farmbot = require('farmbot');
window.$ = window.jQuery = require('jquery');
window.bootstrap = require('bootstrap');

// NO VALUES FOR THESE VARIABLES IN FINAL BUILD!!!
var TOKEN = "YES";
var EMAIL;
var PASSWORD;
var gardenX=2700;
var gardenY=1200;


// DELETE THIS FUNC IN FINAL BUILD!!!
function tempLogin() {
	EMAIL = "***REMOVED***";
	PASSWORD = "***REMOVED***";
	generateToken(EMAIL, PASSWORD);
}

// Save Credentials 
function saveCredentials() {
	EMAIL = document.getElementById("email").value;
	PASSWORD = document.getElementById("password").value;

	//Step here to add this info to the Database so USER don't have to enter this evertime!

	generateToken(EMAIL, PASSWORD);
}

// Generate Token
function generateToken(email, password) {
	var settings = {
		"url": "https://my.farmbot.io/api/tokens",
		"method": "POST",
		"timeout": 0,
		"headers": {
			"content-type": "application/json"
		},
		"data": JSON.stringify({
			"user": {
				"email": email,
				"password": password
			}
		}),
	};
	$.ajax(settings).done(function (response) {
		console.log(response);
		setUserProfile(response.user.name, response.token.encoded);
	});
}

// Set USER Profile & TOKEN
function setUserProfile(name, token) {
	console.log(name);
	document.getElementById("welcome-msg").innerHTML = "Hi, " + name;
	TOKEN = token;
	console.log(TOKEN);
}

// Take 1 photo at current bot coordinates
function takePhoto() {
	var farmbot123 = new farmbot.Farmbot({ token: TOKEN });

	farmbot123
		.connect()
		.then(function () {
			return farmbot123.takePhoto({});
		}).then(function (farmbot123) {
			console.log("Photo taken");
		}).catch(function (error) {
			console.log("Something went wrong :(");
		});
}

// Check current bot X Y Z
function readCoordinates() {
	return new Promise((resolve, reject) => {

	var settings = {
		"url": "https://my.farmbot.io/api/logs",
		"method": "GET",
		"timeout": 0,
		"headers": {
			"Authorization": "Bearer " + TOKEN,
			"Access-Control-Allow-Origin": "*",
			"Content-Type": "application/json"
		},
	};

	$.ajax(settings).done(function (response) {
		console.log(response[0].x, response[0].y, response[0].z);
	}).then(function(response){
		resolve(response[0].x + "," + response[0].y + "," + response[0].z);
	});
	
	});
}

// Check current bot X Y Z
function getPoints() {
	return new Promise((resolve, reject) => {

	var settings = {
		"url": "https://my.farmbot.io/api/points",
		"method": "GET",
		"timeout": 0,
		"headers": {
			"Authorization": "Bearer " + TOKEN,
			"Access-Control-Allow-Origin": "*",
			"Content-Type": "application/json"
		},
	};

	$.ajax(settings).done(function (response) {
		console.log(response);
	}).then(function(response){
		resolve(response);
	});
	
	});
}

// Toggle LED light
function toggleLight() {
	var farmbot123 = new farmbot.Farmbot({ token: TOKEN });

	farmbot123
		.connect()
		.then(function () {
			return farmbot123.togglePin({ pin_number: 7 });
		}).then(function (farmbot123) {
			console.log("Light toggled");
		}).catch(function (error) {
			console.log("Something went wrong :(");
		});
}

///////////////////////
function myfunc(){
	var logNumber=0;
	var device = new farmbot.Farmbot({ token: TOKEN });
	const myLua = `
	photo_count = 0
	
	function take_photo_and_maybe_notify()
		photo_count = photo_count + 1
		if math.fmod(photo_count, 100) == 0 then
			send_message("info", "download images now")
		end
		return take_photo()
	end
	
	function scanX(label, count)
		send_message("info", "(DO NOT TOUCH) Chance App Scanning " .. label)
	
		for i = count, 1, -1 do
			error1 = take_photo_and_maybe_notify()
			if error1 then return send_message("error", "Capture failed ") end
			p, error2 = get_position()
			if error2 then return send_message("error", inspect(error2)) end
			move_absolute(p.x + 50, p.y, p.z)
		end
	
		send_message("success", "Chance App done scanning row: " .. label)
	end
	
	-- Set a starting X coordinate to do a grid scan of.
	starting_x = 0
	starting_y = 0
	
	-- Loop 24 times, calling scanX on a different "lane" in the
	-- Y coordinate:
	for i = 0, 24 do
		wait(120000)
		move_absolute(starting_x, starting_y, 0)
		label = "A" .. i
		scanX(label, 54)
		starting_y = starting_y + 50
	end
	send_message("success", "Chance App done scanning farm")
	`;
	
	device.on("logs", (log) => {
	  console.log("("+ logNumber +")New log: " + log.message);
	  logNumber++;
	  if (log.message == "download images now") {
		// Download images from API
		downloadImages(100);
		// Maybe delete old images
		// Move bot to next row (A1, A2, etc..)
		console.log("Download images now...");
	  }
	});
	
	device
	  .connect()
	  .then(() => {
		device.send({
		  kind: "rpc_request",
		  args: { label: "---", priority: 100 },
		  body: [
			{
			  kind: "lua",
			  args: { lua: myLua }
			},
		  ]
		});
	  });
}

//////////////////////

async function jonathonGarden(){
	console.log("Moving bot to 0,0,0");
	await moveBotHome();

	console.log("Scanning 33%");
	await ExecSeq(67520);
	console.log("Done scanning 33%");

	console.log("Downloading batch 1");
	await downloadImages(432);
	console.log("Completed: Downloading batch 1");

	console.log("Scanning 66%");
	await ExecSeq(68166);
	console.log("Scanning 66%");

	console.log("Downloading batch 2");
	await downloadImages(432);
	console.log("Completed: Downloading batch 2");

	console.log("Scanning 99%");
	await ExecSeq(68167);
	console.log("Scanning 99%");

	console.log("Downloading batch 3");
	await downloadImages(432);
	console.log("Completed: Downloading batch 3");

	console.log("Completed: Garden Scan");
}
//67521
//68189
async function jonathonGarden2(){
	console.log("Moving bot to 0,0,0");
	await moveBotHome();
	console.log("Scanning Garden");
	for (let i = 0; i < 24; i++) {//24 is how many levels of y
		console.log("a1");
  		await ExecSeq(68189);
  		console.log("a2");
  		sleep(5000);
  		console.log("a3");
  		await downloadImages(54);
  		console.log("a4");
  		sleep(5000);
  		console.log("a5");
  		await ExecSeq(68190);
  		console.log("a6");
  		sleep(5000);
	}
}

// CAUSES CRASHES
async function jonathonGarden3(){
	console.log("Moving bot to 0,0,0");
	await moveBotHome();
	console.log("Scanning Garden");
	for (let i = 0; i < 24; i++) {//24 is how many levels of y
		var farmbot123 = new farmbot.Farmbot({ token: TOKEN });

	farmbot123
		.connect()
		.then(function () {
			console.log("a1");
			return farmbot123.execSequence(68189);
			console.log("a2");
		}).then(function (farmbot123) {
			console.log("a3");
			downloadImages(54);
  			console.log("a4");
		}).then(function (farmbot123) {
			console.log("a5");
  			return farmbot123.execSequence(68190);
  			console.log("a6");
		});
	}
}

async function jonathonGarden4(){
	console.log("Moving bot to 0,0,0");
	await moveBotHome();
	console.log("Scanning Garden");
	for (let i = 0; i < 24; i++) {//24 is how many levels of y
		console.log("a1");
  		await ExecSeq(68199);
  		console.log("a2");
  		sleep(5000);
  		console.log("a3");
  		//await downloadImages(10);
  		console.log("a4");
  		sleep(5000);
  		console.log("a5");
  		await ExecSeq(68190);
  		console.log("a6");
  		sleep(5000);
	}
}

function jon1(){
	var farmbot123 = new farmbot.Farmbot({ token: TOKEN });

	farmbot123
		.connect()
		.then(function () {
			return farmbot123.execSequence(68189);
		}).then(function (farmbot123) {
			console.log("Bot has stopped!");
			resolve('Completed: Sequence');
		})
		.catch(function (error) {
			console.log("Something went wrong :(");
			reject('Something went wrong :(');
		});
}

async function doNotClick(){
	var response;
	response = await rawPhoto();
	console.log(response);
}


async function scanGarden() {
	// Sleep timer
	var sleepTime=5000;

	// This variable keeps track of how many images have been taken until now;
	var imagesTaken;

	// This variable is the limit for how many images to take without downloading; ABSOLUTELY DO NOT PUT ABOVE 449; TO BE SAFE KEEP AT 430, SUCH THAT ASYNC FUNCS CAN CATCH UP
	var imageLimit=430;

	// Store response of certain async functions
	var response;

	// Store bot current coordinates in array. botCoord[0]=x; botCoord[0]=y; botCoord[0]=z.
	var botCoord;

	// Flags to determine if bot has reached max values of garden axis
	var flagX=false, flagY=false;

	// Go to 0,0
	await moveBotHome();
	sleep(sleepTime);

	// Start Y axis loop
	do {
		// Log
		console.log("Starting Y axis loop");

		// Start X axis loop
		do {
			// Log
			console.log("Starting X axis loop");

			// Updates location of bot via logs on FarmBot servers
			sleep(sleepTime);
			response = await waitOnce();

			// Pull bot current coordinates 
			console.log("Pulling Coordinates Now");
			sleep(sleepTime);
			response = await readCoordinates();
			sleep(sleepTime);
			console.log("Coordinates Pulled");

			// Log the response 
			console.log(response);

			// Split the response into an array with x,y,z and store to local function variable array
			botCoord = response.split(",");

			// Log the different x,y,z
			console.log("X: " + botCoord[0]);
			console.log("Y: " + botCoord[1]);
			console.log("Z: " + botCoord[2]);

			//Log
			console.log("Checking if reached X max");

			// Check if reached X max
			if (botCoord[0]>gardenX){
				// If reached X max, then set 'flagX' to true
				flagX=true;

				// Log
				console.log("reached X max, then set 'flagX' to true");
			}else{
				// Log
				console.log("X not reached max");

				// Log
				console.log("Checking if image limit of 'imageLimit' is reached");

				// Check if image limit of 'imageLimit' is reached
				if(imagesTaken==imageLimit){
					// Log
					console.log("Image limit of 'imageLimit' is reached");

					// Log
					console.log("Downloading Images");

					// Then download the images
					await downloadImages(imageLimit);
					sleep(sleepTime);

					// Log
					console.log("Resseting images taken var back to 0");

					// Reset images taken back to 0
					imagesTaken=0;
				}
				// Log
				console.log("not reached X max, so Incrementing X then taking image");

				// Else if not reached X max, then Increment X then take image
				await moveAndShoot();
				sleep(sleepTime);

				// Increment the number of images we have taken
				imagesTaken++;

				// Log
				console.log("Number of images taken: " + imagesTaken);
			}
		// Log
		console.log("Ending X axis loop");
			
		// End X axis loop
		} while (flagX==false);
		// Log
		console.log("Checking if reached Y max");

		// Check if reached Y max
		if (botCoord[1]>gardenY){
			// Log
			console.log("Reached Y max, then set 'flagY' to true");

			// If reached Y max, then set 'flagY' to true
			flagY=true;
		}else{
			// Log
			console.log("Not reached Y max, then sending bot to x=0 and then incrementing it's Y, and seeting 'flagX' to false");

			// Else if not reached Y max, then Send bot to x=0 and then increment it's Y
			await goUp();
			sleep(sleepTime);

			// Set 'flagX' to false, so bot can scan horizontally in the row
			flagX=false;
		}
	// Log
	console.log("Ending Y axis loop");

	// End Y axis loop
	} while (flagY==false);

	// Log
	console.log("Check if we have taken some images that haven't been downloaded yet");

	// Check if we have taken some images that haven't been downloaded yet
	if(imagesTaken>0){
		// Log
		console.log("We have taken some images that haven't been downloaded yet, so we are downloading them now");

		// Then download the remaining images
		await downloadImages(imagesTaken);
		sleep(sleepTime);

		// Reset images taken back to 0; although this does not matter at this point
		imagesTaken=0;
	}

	// Output to console "Completed Garden Scan"
	console.log("Completed Garden Scan :)");
}


// SEND AND Execute Sequence to take_photo_raw (SequenceName: take_photo_raw) 
function rawPhoto() {
	return new Promise((resolve, reject) => {
	var farmbot123 = new farmbot.Farmbot({ token: TOKEN });

	farmbot123
		.connect()
		.then(function () {
			return farmbot123.send({
				kind: "rpc_request",
				args: {
					// Every `rpc_request` must have a long, unique `label`.
					// farmbot needs this proprty to know when a command finishes.
					label: "take_photo_raw",
					// This is a legacy field. Modern versions of FBOS do not
					// use it any more. You can set it to any number. It does
					// not matter.
					priority: 0
				},
				body: [
					{
						"kind": "send_message",
						"args": {
							"message": "Chance App: take_photo_raw",
							"message_type": "success"
						}
					},
					{
						"kind": "channel",
    					"args": {
        					"channel_name": "alpha"
    					}
    				},
					{
						"kind": "take_photo_raw",
						"args": {}
					}
				]
			});
		}).then(function (farmbot123) {
			console.log("Completed: take_photo_raw");
			resolve('Completed: take_photo_raw');
		})
		.catch(function (error) {
			console.log("Something went wrong :(");
			reject('Something went wrong :(');
		});
	});
		

	
}


// SEND AND Execute Sequence to wait once (SequenceName: waitOnce) // Used to update bot location to its logs on the server
function waitOnce() {
	return new Promise((resolve, reject) => {
	var farmbot123 = new farmbot.Farmbot({ token: TOKEN });

	farmbot123
		.connect()
		.then(function () {
			return farmbot123.send({
				kind: "rpc_request",
				args: {
					// Every `rpc_request` must have a long, unique `label`.
					// farmbot needs this proprty to know when a command finishes.
					label: "waitOnce",
					// This is a legacy field. Modern versions of FBOS do not
					// use it any more. You can set it to any number. It does
					// not matter.
					priority: 0
				},
				body: [
					{
						"kind": "send_message",
						"args": {
							"message": "Chance App: Waiting",
							"message_type": "success"
						}
					},
					{
						"kind": "wait",
						"args": {
							"milliseconds": 1000
						}
					}
				]
			});
		}).then(function (farmbot123) {
			console.log("Completed: waitOnce");
			resolve('Completed: waitOnce');
		})
		.catch(function (error) {
			console.log("Something went wrong :(");
			reject('Something went wrong :(');
		});
	});
		

	
}

// SEND AND Execute Sequence to Move x right and Take 1 image (SequenceName: moveAndShoot)
function moveAndShoot() {
	return new Promise((resolve, reject) => {
	var farmbot123 = new farmbot.Farmbot({ token: TOKEN });

	farmbot123
		.connect()
		.then(function () {
			return farmbot123.send({
				kind: "rpc_request",
				args: {
					// Every `rpc_request` must have a long, unique `label`.
					// farmbot needs this proprty to know when a command finishes.
					label: "moveAndShoot",
					// This is a legacy field. Modern versions of FBOS do not
					// use it any more. You can set it to any number. It does
					// not matter.
					priority: 0
				},
				body: [
					{
						"kind": "send_message",
						"args": {
							"message": "Chance App: Incrementing X and taking a photo (Please Do Not Touch)",
							"message_type": "success"
						}
					},
					{
						"kind": "wait",
						"args": {
							"milliseconds": 1000
						}
					}, {
						"kind": "move",
						"args": {},
						"body": [
							{
								"kind": "axis_addition",
								"args": {
									"axis": "x",
									"axis_operand": {
										"kind": "numeric",
										"args": {
											"number": 50
										}
									}
								}
							},
							{
								"kind": "axis_addition",
								"args": {
									"axis": "y",
									"axis_operand": {
										"kind": "numeric",
										"args": {
											"number": 0
										}
									}
								}
							},
							{
								"kind": "axis_addition",
								"args": {
									"axis": "z",
									"axis_operand": {
										"kind": "numeric",
										"args": {
											"number": 0
										}
									}
								}
							}
						]
					}, {
						"kind": "wait",
						"args": {
							"milliseconds": 500
						}
					}, {
						"kind": "take_photo",
						"args": {}
					}, {
						"kind": "wait",
						"args": {
							"milliseconds": 500
						}
					}, {
						"kind": "send_message",
						"args": {
							"message": "Chance App: Incremented X and taken a photo (Please Do Not Touch)",
							"message_type": "success"
						}
					}
				]
			});
		}).then(function (farmbot123) {
			console.log("Completed: moveAndShoot");
			resolve('Completed: moveAndShoot');
		})
		.catch(function (error) {
			console.log("Something went wrong :(");
			reject('Something went wrong :(');
		});
	});
		

	
}

// SEND AND Execute Sequence to set X to 0, then increment Y (SequenceName: goUp)
function goUp() {
	return new Promise((resolve, reject) => {
	var farmbot123 = new farmbot.Farmbot({ token: TOKEN });

	farmbot123
		.connect()
		.then(function () {
			return farmbot123.send({
				kind: "rpc_request",
				args: {
					// Every `rpc_request` must have a long, unique `label`.
					// farmbot needs this proprty to know when a command finishes.
					label: "goUp",
					// This is a legacy field. Modern versions of FBOS do not
					// use it any more. You can set it to any number. It does
					// not matter.
					priority: 0
				},
				body: [
					{
						"kind": "send_message",
						"args": {
							"message": "Chance App: Setting X=0; Incrementing Y (Please Do Not Touch)",
							"message_type": "success"
						}
					},
					{
						"kind": "find_home",
						"args": {
							"axis": "x",
							"speed": 100
						}
					}
					, {
						"kind": "move",
						"args": {},
						"body": [
							{
								"kind": "axis_addition",
								"args": {
									"axis": "x",
									"axis_operand": {
										"kind": "numeric",
										"args": {
											"number": 0
										}
									}
								}
							},
							{
								"kind": "axis_addition",
								"args": {
									"axis": "y",
									"axis_operand": {
										"kind": "numeric",
										"args": {
											"number": 50
										}
									}
								}
							},
							{
								"kind": "axis_addition",
								"args": {
									"axis": "z",
									"axis_operand": {
										"kind": "numeric",
										"args": {
											"number": 0
										}
									}
								}
							}
						]
					}, {
						"kind": "wait",
						"args": {
							"milliseconds": 1000
						}
					}, {
						"kind": "send_message",
						"args": {
							"message": "Chance App: X=0; Incremented Y (Please Do Not Touch)",
							"message_type": "success"
						}
					}
				]
			});
		}).then(function (farmbot123) {
			console.log("Completed: goUp");
			resolve('Completed: goUp');
		})
		.catch(function (error) {
			console.log("Something went wrong :(");
			reject('Something went wrong :(');
		});
	});
}

// (DEPRECATED) Exec Sequence using a sequence ID
function ExecSeq(seqId) {
	return new Promise((resolve, reject) => {
	var farmbot123 = new farmbot.Farmbot({ token: TOKEN });

	farmbot123
		.connect()
		.then(function () {
			return farmbot123.execSequence(seqId);
		}).then(function (farmbot123) {
			console.log("Bot has stopped!");
			resolve('Completed: Sequence');
		})
		.catch(function (error) {
			console.log("Something went wrong :(");
			reject('Something went wrong :(');
		});
	});
}

// Move the bot to a set of coordinates
function moveBotCoord() {
	var xCoordinate = parseInt(document.getElementById("xCoord").value);
	var yCoordinate = parseInt(document.getElementById("yCoord").value);
	var zCoordinate = parseInt(document.getElementById("zCoord").value);
	var farmbot123 = new farmbot.Farmbot({ token: TOKEN });

	console.log("Bot moving to: x=" + xCoordinate + ", y=" + yCoordinate + ", z=" + zCoordinate);
	// Need to pull bot's curr pos here, and set as default value for those variables that were not inputted. ex: z was not inputted!
	farmbot123
		.connect()
		.then(function () {
			return farmbot123.moveAbsolute({ x: xCoordinate, y: yCoordinate, z: zCoordinate, speed: 100 });
		});
}

// Move the bot to home Coordinates 0,0,0
function moveBotHome() {
	return new Promise((resolve, reject) => {
	var farmbot123 = new farmbot.Farmbot({ token: TOKEN });

	console.log("Bot moving to: x=0, y=0, z=0");
	farmbot123
		.connect()
		.then(function () {
			return farmbot123.sendMessage("info", "Moving to (0,0,0)");

		}).then(function () {
			return farmbot123.moveAbsolute({ x: 0, y: 0, z: 0, speed: 100 });
		}).then(function () {
			return farmbot123.sendMessage("info", "Moved to (0,0,0)");

		}).then(function (farmbot123) {
			console.log("Bot has gone home!");
			resolve('Bot has gone home!');
		})
		.catch(function (error) {
			console.log("Something went wrong :(");
			reject('Bot has gone home!');
		});
	});
}

// Send log message to FarmBot system
function sendLogMessage() {
	var logValue = "Chance App: " + document.getElementById("logMessageText").value;
	var farmbot123 = new farmbot.Farmbot({ token: TOKEN });

	farmbot123
		.connect()
		.then(function () {
			return farmbot123.sendMessage("success", logValue);

		}).then(function (farmbot123) {
			console.log("Log Sent");
		}).catch(function (error) {
			console.log("Something went wrong :(");
		});
}

// Start rendering a set of images to create a 3D model
function createRenders() {
	// Check if renders folder exists yet, and create if not.
	const fs = require("fs");

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

// Downloads the latest images on FarmBot system
function downloadImages(numberOfImagesToDownload) {
	return new Promise((resolve, reject) => {
	// Get current date-time.
	// Also adjust date/month for single digits.
	let dateObj = new Date();
	let currentDateTime = dateObj.getFullYear() + "-" + ("0" + (dateObj.getMonth() + 1)).slice(-2) + "-" + (("0" + dateObj.getDate()).slice(-2)) + " " + ("0" + (dateObj.getHours() + 1)).slice(-2) + "-" + ("0" + (dateObj.getMinutes() + 1)).slice(-2) + "-" + ("0" + (dateObj.getSeconds() + 1)).slice(-2);

	// Create folder with current date-time.
	const fs = require("fs");
	var dir = "./images/" + currentDateTime;

	// Check if images folder exists yet, and create if not.
	if (!fs.existsSync("./images")) {
		fs.mkdirSync("./images");
	}

	// Create the date-time folder.
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir);
	}

	// Set the settings for the API request	
	var settings = {
		"url": "https://my.farm.bot/api/images",
		"method": "GET",
		"timeout": 0,
		"headers": {
			"Authorization": "Bearer " + TOKEN
		},
	};

	// Make var to store the response
	var savedResponse;

	// Acess the response and save it to the variable
	$.ajax(settings).done(function (response) {
		//console.log(response);
		savedResponse = response;
		console.log(savedResponse[0]);

		// x is the number of images the user want to download (FarmBot has a limit of storing the latest 449 images on their servers, hence 449 is the max number here)
		var x = numberOfImagesToDownload;
		// 0 is the newest images, it will be downloaded first, then the second newest, and so on. 
		var i = 0;

		while (i <= x) {

			// Print the ith image's url
			console.log(i);
			console.log(savedResponse[i].attachment_url);

			// Call python script and pass arguments to save the image to appropraite folder.
			const spawn = require("child_process").spawn;
			const pythonProcess = spawn('python', ["saveImage.py", savedResponse[i].attachment_url, savedResponse[i].id, dir]);
			i += 1;
		}
	}).then(function(response){
		resolve('Done dowloading  images');
	});
});
}

// (DEPRECATED) The celery script of a basic wait
function waitSequenceScript() {
	return new Promise((resolve, reject) => {
	var celeryScript = { "kind": "wait", "args": { "milliseconds": 1000 } };
	var sequenceName = "Chance App: Wait Script";
	createNewSequence(sequenceName, celeryScript);
	resolve('Done');
});
}

// (DEPRECATED) Creates a new sequence and sends it to the FarmBot system to store in its sequences 
function createNewSequence(sequenceName, celeryScript) {
	return new Promise((resolve, reject) => {
	var settings = {
		"url": "https://my.farmbot.io/api/sequences",
		"method": "POST",
		"timeout": 0,
		"headers": {
			"Authorization": "Bearer " + TOKEN,
			"Access-Control-Allow-Origin": "*",
			"Content-Type": "application/json"
		},
		"data": JSON.stringify({
			"color": "red",
			"name": sequenceName,
			"pinned": false,
			"kind": "sequence",
			"body": [
				celeryScript
			]
		}),
	};

	$.ajax(settings).done(function (response) {
		console.log(response);
	}).then(function(response){
		resolve(response);
	});
});
}

function getFoldersList(mainFolder) {
	const { readdirSync } = require('fs');

	const foldersList = source =>
		readdirSync(source, { withFileTypes: true })
			.filter(dirent => dirent.isDirectory())
			.map(dirent => dirent.name);

	return foldersList(mainFolder);
}

function createDateTimeSelect(folder) {
	var selectList = document.getElementById("dateTimeSelect");
	var folderList = getFoldersList(folder);

	for (let i = 0; i < folderList.length; i++) {
		let dateTimeVal = folderList[i];
		let dateTimeOption = document.createElement("option");
		dateTimeOption.textContent = dateTimeVal;
		dateTimeOption.value = dateTimeVal;
		selectList.appendChild(dateTimeOption);
	}

	return;
}


// Sleep Function to delay calls to FarmBot, so MQTT dosent complain
function sleep(milliseconds) {
	console.log("Sleeping now");
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
  console.log("Waking up now");
}