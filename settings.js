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

	$('#settings-form').on('input change', function() {
		$('#save-settings-btn').attr('disabled', false);
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

async function clearMeshroomCache() {
	const { ipcRenderer } = require('electron');
	const successToastEle = document.getElementById('delSuccessToast'),
	successToast = bootstrap.Toast.getInstance(successToastEle),
	failToastEle = document.getElementById('delFailToast'),
	failToast = bootstrap.Toast.getInstance(failToastEle);

	const tempPath = await ipcRenderer.invoke('get-temp-path'),
	meshroomCachePath = path.join(tempPath, 'MeshroomCache');
	// If there, delete the cache.
	if (fs.existsSync(meshroomCachePath)) {
		fs.rmdirSync(meshroomCachePath, { recursive: true });
	}

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
	const farmSizeX = Number(document.getElementById("inputXAxis").value),
	farmSizeY = Number(document.getElementById("inputYAxis").value),
	lightPin = Number(document.getElementById("inputLightPinNum").value),
	zHeight = Number(document.getElementById("inputZScanHeight").value);

	// Check if values are valid.
	let invalidValues = false;
	if (!(farmSizeX > 0)) {
		document.getElementById("inputXAxis").classList.add("is-invalid");
		invalidValues = true;
	} else {
		document.getElementById("inputXAxis").classList.remove("is-invalid");
	}

	if (!(farmSizeY > 0)) {
		document.getElementById("inputYAxis").classList.add("is-invalid");
		invalidValues = true;
	} else {
		document.getElementById("inputYAxis").classList.remove("is-invalid");
	}

	if (lightPin == '') {
		document.getElementById("inputLightPinNum").classList.add("is-invalid");
		invalidValues = true;
	} else {
		document.getElementById("inputLightPinNum").classList.remove("is-invalid");
	}

	if (zHeight == '') {
		document.getElementById("inputZScanHeight").classList.add("is-invalid");
		invalidValues = true;
	} else {
		document.getElementById("inputZScanHeight").classList.remove("is-invalid");
	}

	if (invalidValues) {
		return;
	}

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
