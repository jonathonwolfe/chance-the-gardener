$(document).ready(function() {
	getSessionToken();

	// Activate tooltips.
	var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
	var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
		return new bootstrap.Tooltip(tooltipTriggerEl)
	});
});

var lightPin;
var deviceXmax, deviceYmax;

async function autoDetectFarmDetails(){
	await getFarmSize();
	await findLightPin();
	console.log("AutoDetect Results: " + lightPin + " " + deviceXmax + " " + deviceYmax);
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
			deviceXmax = myArr[1]; 
			deviceYmax = myArr[2];
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