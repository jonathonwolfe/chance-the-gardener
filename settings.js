$(document).ready(async function() {
	getSessionToken();
	await getCurrentSettings();

	// Activate tooltips.
	var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
	var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
		return new bootstrap.Tooltip(tooltipTriggerEl)
	});

	// Activate toasts.
	var toastElList = [].slice.call(document.querySelectorAll('.toast'));
	var toastList = toastElList.map(function (toastEl) {
		return new bootstrap.Toast(toastEl)
	});
});

var currentUserId;

async function getCurrentSettings() {
	// Get user's settings from db.
	currentUserId = parseInt(localStorage.getItem('lastLoginUserID'));
	const currentUserObj = {userId: currentUserId},
	userCreds = await getDbRowWhere('device', currentUserObj),
	xMax = userCreds[0].xMax,
	yMax = userCreds[0].yMax,
	lightPinNum = userCreds[0].lightPinNum,
	zScanHeight = userCreds[0].zScanHeight;

	// Set inputs to these values.
	document.getElementById("inputXAxis").value = xMax;
	document.getElementById("inputYAxis").value = yMax;
	document.getElementById("inputLightPinNum").value = lightPinNum;
	document.getElementById("inputZScanHeight").value = zScanHeight;
}

function enableSaveBtn() {
	document.getElementById("save-settings-btn").removeAttribute("disabled");
}

async function autoDetectFarmDetails() {
	const farmSizeXInput = document.getElementById("inputXAxis"),
	farmSizeYInput = document.getElementById("inputYAxis"),
	lightPinInput = document.getElementById("inputLightPinNum");

	// Get the farm details.
	const farmSize = await getFarmSize(),
	lightPin = await findLightPin();

	// Update form with new values.
	farmSizeXInput.value = farmSize[0];
	farmSizeYInput.value = farmSize[1];
	lightPinInput.value = lightPin;

	// Save to database new values.
	saveSettings();

	// Disable save button again if it isn't already.
	document.getElementById("save-settings-btn").setAttribute("disabled", "");
}

// Find the PIN that has LIGHTING
function findLightPin() {
	return new Promise((resolve, reject) => {

	var settings = {
		"url": "https://my.farmbot.io/api/peripherals",
		"method": "GET",
		"timeout": 0,
		"headers": {
			"Authorization": "Bearer " + sessionToken,
			"Access-Control-Allow-Origin": "*",
			"Content-Type": "application/json"
		},
	};

	$.ajax(settings).done(function (response) {
		console.log("Found this many PINs: " + response.length);
		// Loop through the PINs to find the pin with LIGHTING as its label
		for (let i = 0; i < response.length; i++) {
			if (response[i].label == "Lighting"){
				console.log("Found Light on PIN " + response[i].pin);
				resolve(response[i].pin);
			}
		}
	});
	
	});
}

function getFarmSize() {
	// Return an array with the current user's farm size.
	return new Promise((resolve, reject) => {
	var device = new farmbot.Farmbot({ token: sessionToken });
	
	// Lua Function
	var myLua = `
	function get_length(axis)
		local steps_per_mm = read_status("mcu_params",
										"movement_step_per_mm_" .. axis)
		local nr_steps =
			read_status("mcu_params", "movement_axis_nr_steps_" .. axis)
		return nr_steps / steps_per_mm
	end
	xVal = get_length("x")
	yVal = get_length("y")
	message = "FarmBot Device Size:" .. xVal .. ":" .. yVal
	send_message("info", message)
	`;

	device.on("logs", (log) => {
		let str = log.message;
		var myArr = str.split(":");
		if (myArr[0] == "FarmBot Device Size") {
			//Save the coordinates
			deviceXmax = parseFloat(myArr[1]); 
			deviceYmax = parseFloat(myArr[2]);
			console.log("FarmBot Device Size: [" + deviceXmax + "," + deviceYmax + "]");
			resolve([deviceXmax, deviceYmax]);
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
	});
}

function clearMeshroomCache() {
	const electron = require('electron'),
	successToastEle = document.getElementById('delSuccessToast'),
	successToast = bootstrap.Toast.getInstance(successToastEle),
	failToastEle = document.getElementById('delFailToast'),
	failToast = bootstrap.Toast.getInstance(failToastEle);

	const meshroomCachePath = (electron.app || electron.remote.app).getPath('temp') + '\\MeshroomCache';
	fs.rmdirSync(meshroomCachePath, { recursive: true });

	// Check if deleted and notify user on results.
	if (!fs.existsSync(meshroomCachePath)) {
		// Success.
		successToast.show();
	} else {
		// Failure.
		failToast.show();
	}
}

async function saveSettings() {
	const successToastEle = document.getElementById('autoDetectSuccessToast'),
	successToast = bootstrap.Toast.getInstance(successToastEle);
	// Get the values to save.
	const farmSizeX = document.getElementById("inputXAxis").value,
	farmSizeY = document.getElementById("inputYAxis").value,
	lightPin = document.getElementById("inputLightPinNum").value,
	zHeight = document.getElementById("inputZScanHeight").value;

	// Save them to db.
	const currentUserObj = {userId: currentUserId},
	newValuesObj = {
		xMax: farmSizeX,
		yMax: farmSizeY,
		lightPinNum: lightPin,
		zScanHeight: zHeight
	};
	await updateDbRowWhere('device', currentUserObj, newValuesObj);

	// Disable save button again.
	document.getElementById("save-settings-btn").setAttribute("disabled", "");

	// Notify user.
	successToast.show();
}
