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
		var farmbot123 = new farmbot.Farmbot({ token: sessionToken });

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
	var farmbot123 = new farmbot.Farmbot({ token: sessionToken });

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
	var farmbot123 = new farmbot.Farmbot({ token: sessionToken });

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
	var farmbot123 = new farmbot.Farmbot({ token: sessionToken });

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
	var farmbot123 = new farmbot.Farmbot({ token: sessionToken });

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
	var farmbot123 = new farmbot.Farmbot({ token: sessionToken });

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

function setLEDoffRPC(){
	var farmbot123 = new farmbot.Farmbot({ token: sessionToken });

	farmbot123
		.connect()
		.then(function () {
			return farmbot123.send({
				kind: "rpc_request",
				args: {
					// Every `rpc_request` must have a long, unique `label`.
					// farmbot needs this proprty to know when a command finishes.
					label: "setLEDoff",
					// This is a legacy field. Modern versions of FBOS do not
					// use it any more. You can set it to any number. It does
					// not matter.
					priority: 0
				},
				body: [
					{
						"kind": "write_pin",
						"args": {
						  "pin_value": 0,
						  "pin_mode": 0,
						  "pin_number": {
							"kind": "named_pin",
							"args": {
							  "pin_type": "Peripheral",
							  "pin_id": 14411
							}
						  }
						}
					  }
				]
			});
		}).then(function (farmbot123) {
			console.log("Completed: setLEDoff");
		})
		.catch(function (error) {
			console.log("Something went wrong :(");
		});
}

// (DEPRECATED) Exec Sequence using a sequence ID
function ExecSeq(seqId) {
	return new Promise((resolve, reject) => {
	var farmbot123 = new farmbot.Farmbot({ token: sessionToken });

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
	var farmbot123 = new farmbot.Farmbot({ token: sessionToken });

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
	var farmbot123 = new farmbot.Farmbot({ token: sessionToken });

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
			"Authorization": "Bearer " + sessionToken,
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