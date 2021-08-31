
// NO VALUES FOR THESE VARIABLES IN FINAL BUILD!!!
var TOKEN = "yes";
var EMAIL;
var PASSWORD;


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
	document.getElementById("welcome").innerHTML = name;
	TOKEN = token;
	console.log(TOKEN);
}

// Take 1 photo at current bot coordinates
function takePhoto() {
	var farmbot123 = new fbjs.Farmbot({ token: TOKEN });

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
	});
}

// Toggle LED light
function toggleLight() {
	var farmbot123 = new fbjs.Farmbot({ token: TOKEN });

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

// SEND AND Execute Sequence to Move x right and Take 1 image (SequenceName: moveAndShoot)
function moveAndShoot() {
	var farmbot123 = new fbjs.Farmbot({ token: TOKEN });

	farmbot123
		.connect()
		.then(function () {
			return farmbot123.send({
				kind: "rpc_request",
				args: {
					// Every `rpc_request` must have a long, unique `label`.
					// FBJS needs this proprty to know when a command finishes.
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
		})
		.catch(function (error) {
			console.log("Something went wrong :(");
		});
}

// SEND AND Execute Sequence to set X to 0, then increment Y (SequenceName: goUp)
function goUp() {
	var farmbot123 = new fbjs.Farmbot({ token: TOKEN });

	farmbot123
		.connect()
		.then(function () {
			return farmbot123.send({
				kind: "rpc_request",
				args: {
					// Every `rpc_request` must have a long, unique `label`.
					// FBJS needs this proprty to know when a command finishes.
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
		})
		.catch(function (error) {
			console.log("Something went wrong :(");
		});
}

// (DEPRECATED) Exec Sequence using a sequence ID
function ExecSeq() {
	var farmbot123 = new fbjs.Farmbot({ token: TOKEN });

	farmbot123
		.connect()
		.then(function () {
			return farmbot123.execSequence(67893);
		}).then(function (farmbot123) {
			console.log("Bot has stopped!");
		})
		.catch(function (error) {
			console.log("Something went wrong :(");
		});
}

// Move the bot to a set of coordinates
function moveBotCoord() {
	var xCoordinate = parseInt(document.getElementById("xCoord").value);
	var yCoordinate = parseInt(document.getElementById("yCoord").value);
	var zCoordinate = parseInt(document.getElementById("zCoord").value);
	var farmbot123 = new fbjs.Farmbot({ token: TOKEN });

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
	var xCoordinate = document.getElementById("xCoord").value;
	var yCoordinate = document.getElementById("yCoord").value;
	var zCoordinate = document.getElementById("zCoord").value;
	var farmbot123 = new fbjs.Farmbot({ token: TOKEN });

	console.log("Bot moving to: x=0, y=0, z=0");
	farmbot123
		.connect()
		.then(function () {
			return farmbot123.sendMessage("info", "Moving to (0,0,0)");

		}).then(function () {
			return farmbot123.moveAbsolute({ x: 0, y: 0, z: 0, speed: 100 });
		}).then(function (farmbot123) {
			console.log("Bot has gone home!");
		})
		.catch(function (error) {
			console.log("Something went wrong :(");
		});
}

// Send log message to FarmBot system
function sendLogMessage() {
	var logValue = "Chance App: " + document.getElementById("logMessageText").value;
	var farmbot123 = new fbjs.Farmbot({ token: TOKEN });

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

// Downloads the latest 449 images on FarmBot system
function downloadImages() {
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
		var x = 449;
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
	});
}

// (DEPRECATED) The celery script of a basic wait
function waitSequenceScript() {
	var celeryScript = { "kind": "wait", "args": { "milliseconds": 1000 } };
	var sequenceName = "Chance App: Wait Script";
	createNewSequence(sequenceName, celeryScript);
}

// (DEPRECATED) Creates a new sequence and sends it to the FarmBot system to store in its sequences 
function createNewSequence(sequenceName, celeryScript) {
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
	});
}

$.ajax(settings).done(function (response) {
	console.log(response);
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
