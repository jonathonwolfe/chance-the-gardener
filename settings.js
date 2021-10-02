$(document).ready(function() {
	getSessionToken();

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

var lightPin;
var deviceXmax, deviceYmax;

async function autoDetectFarmDetails() {
	const farmSizeXInput = document.getElementById("inputXAxis"),
	farmSizeYInput = document.getElementById("inputYAxis"),
	lightPinInput = document.getElementById("inputLightPinNum"),
	successToastEle = document.getElementById('autoDetectSuccessToast'),
	successToast = bootstrap.Toast.getInstance(successToastEle);

	// Get the farm details.
	await getFarmSize();
	await findLightPin();

	// TODO: Save to database new values.

	// Update form with new values.
	farmSizeXInput.value = deviceXmax;
	farmSizeYInput.value = deviceYmax;
	lightPinInput.value = lightPin;

	// Notify user.
	successToast.show();
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
				lightPin = response[i].pin;
				resolve(response[i].pin);
			}
		}
	});
	
	});
}

function getFarmSize(){
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
			resolve(deviceXmax + "," + deviceYmax);
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

/* TODO: Delete later???
var device_id;
function save() {
	return new Promise((resolve, reject) => {

	var settings = {
		"url": "https://my.farmbot.io/api/device",
		"method": "GET",
		"timeout": 0,
		"headers": {
			"Authorization": "Bearer " + sessionToken,
			"Access-Control-Allow-Origin": "*",
			"Content-Type": "application/json"
		},
	};

	$.ajax(settings).done(function (response) {
		device_id=response.id;
		device_name=response.name;
		OS_Version = response.fbos_version;

		deviceXmax = document.getElementById("inputXAxis").value;
		deviceYmax = document.getElementById("inputYAxis").value;
		lightPin = document.getElementById("inputLightPinNum").value;
		console.log(device_id,device_name,OS_Version,deviceXmax,deviceYmax,lightPin);


		let db = new sqlite3.Database('./database/Chance_the_Gardener.db');
		let sql_select_2 = 'SELECT userID FROM value_holder WHERE id =(select max(id) from value_holder)';
		db.get(sql_select_2, function(err,row) {
		if (err) {
			return console.error(err.message);
		}
		userID=row.userID;
		console.log(userID);
		let sql = 'INSERT into Device_Settings ( device_id, Name, OS_Version,"x-max","y-max",light_pin_num,user_id) values  ('+device_id+',"' +device_name+'" ,"'+ OS_Version+'","'+deviceXmax+'","'+deviceYmax+'","'+lightPin+'",'+userID+')';
		db.run(sql, function(err) {
			if (err) {
				return console.error(err.message);
			}
			});
});		
	});
	});
} */

