$(document).ready(async function() {
	getSessionToken();
	createUserSelect();
	await createDateTimeSelect("scans", parseInt(localStorage.getItem('lastLoginUserID')));
});

var meshroomExec;

function createRender() {
	// Grab info on which scan to generate.
	const scanUserToRenderSelectEle = document.getElementById('user-select'),
	scanUserEmailToRender = scanUserToRenderSelectEle[scanUserToRenderSelectEle.selectedIndex].text,
	scanDateTimeToRender = document.getElementById('date-time-select').value,
	scanToRenderPath = path.join(__dirname, 'scans', scanUserEmailToRender, scanDateTimeToRender),
	renderFolderPath = path.join(__dirname, 'garden_viewer', 'FarmBot 3D Viewer_Data', 'Renders', scanUserEmailToRender, scanDateTimeToRender);

	// Elements for hiding/showing when scanning.
	const startBtn = document.getElementById('start-render-btn'),
	cancelBtn = document.getElementById('cancel-render-btn'),
	loadingSpinner = document.getElementById('render-progress-spinner'),
	renderInfoHolder = document.getElementById('render-info'),
	userInfoHolder = document.getElementById('render-user-info'),
	dateTimeInfoHolder = document.getElementById('render-datetime-info'),
	backBtn = document.getElementsByClassName('btn-back')[0],
	renderSelectionForm = document.getElementById('render-selection-form');

	// Check if renders folders exists yet, and create if not.
	if (!fs.existsSync(path.join(__dirname, 'garden_viewer', 'FarmBot 3D Viewer_Data', 'Renders'))) {
		fs.mkdirSync(path.join(__dirname, 'garden_viewer', 'FarmBot 3D Viewer_Data', 'Renders'));
	}

	if (!fs.existsSync(path.join(__dirname, 'garden_viewer', 'FarmBot 3D Viewer_Data', 'Renders', scanUserEmailToRender))) {
		fs.mkdirSync(path.join(__dirname, 'garden_viewer', 'FarmBot 3D Viewer_Data', 'Renders', scanUserEmailToRender));
	}

	if (!fs.existsSync(renderFolderPath)) {
		fs.mkdirSync(renderFolderPath);
	} else {
		// Render already exists error.
		const renderExistsToast = new bootstrap.Toast(document.getElementById('render-already-exists-toast'));
		renderExistsToast.show();

		return;
	}

	// Disable and hide scan button.
	startBtn.setAttribute("disabled", "");
	startBtn.classList.add("d-none");

	// Disable back button.
	backBtn.setAttribute("disabled", "");

	// Show cancel button.
	cancelBtn.classList.remove("d-none");

	// Show loading spinner.
	loadingSpinner.classList.remove("d-none");

	// Show render info.
	userInfoHolder.innerHTML = scanUserEmailToRender;
	dateTimeInfoHolder.innerHTML = formatDateTimeReadable(scanDateTimeToRender);
	renderInfoHolder.classList.remove("d-none");

	// Hide selection form.
	renderSelectionForm.classList.add("d-none");

	// Copy farm data to render folder.
	fs.copyFile(path.join(__dirname, scanToRenderPath, 'farm_size.csv'), path.join(__dirname, renderFolderPath, 'farm_size.csv'), (err) => {
		if (err) throw err;
	});
	fs.copyFile(path.join(__dirname, scanToRenderPath, 'farm_size.csv'), path.join(__dirname, renderFolderPath, 'farm_size.csv'), (err) => {
		if (err) throw err;
	});

	// Execute Meshroom application through command line.
	const child = require('child_process').execFile;
	const executablePath = path.join(__dirname, 'Meshroom-2018.1.0', 'meshroom_photogrammetry.exe'),
	parameters = ["--input", scanToRenderPath, "--output", renderFolderPath, "--scale", "2"];

 	meshroomExec = child(executablePath, parameters, function (err, data, errData) {
		console.log(err)
		console.log(data.toString());
		console.log(errData.toString())

		let logData = data.toString();
		let progress = 0;
		progress = logData.search('[13/13]');

		if (progress != -1) {
			// Re-enable and show button.
			startBtn.removeAttribute("disabled");
			startBtn.classList.remove("d-none");
			// Re-enable back button.
			backBtn.removeAttribute("disabled");
			// Re-hide loading spinner.
			loadingSpinner.classList.add("d-none");
			// Re-hide chosen date & time.
			renderInfoHolder.classList.add("d-none");
			// Re-hide cancel button.
			cancelBtn.classList.add("d-none");
			// Re-show selection form.
			renderSelectionForm.classList.remove("d-none");

			// Success message.
			console.log(progress);
			const successModal = new bootstrap.Modal(document.getElementById('render-success-modal'));
			successModal.show();
		} else {
			// Re-enable and show button.
			startBtn.removeAttribute("disabled");
			startBtn.classList.remove("d-none");
			// Re-enable back button.
			backBtn.removeAttribute("disabled");
			// Re-hide loading spinner.
			loadingSpinner.classList.add("d-none");
			// Re-hide chosen date & time.
			renderInfoHolder.classList.add("d-none");
			// Re-hide cancel button.
			cancelBtn.classList.add("d-none");
			// Re-show selection form.
			renderSelectionForm.classList.remove("d-none");

			// Clean up failure.
			fs.rmdirSync(renderFolderPath, { recursive: true });
			// Failure message.
			// This also triggers when cancelling scan.
			const FailureModal = new bootstrap.Modal(document.getElementById('render-failure-modal'));
			FailureModal.show();
		}
	});
}

function cancelRender() {
	meshroomExec.kill('SIGINT');

	// Delete the folder.
	const userEmail = document.getElementById('render-user-info').innerHTML,
	dateTime = document.getElementById('render-datetime-info').innerHTML,
	renderFolderPath = path.join(__dirname, 'garden_viewer', 'FarmBot 3D Viewer_Data', 'Renders', userEmail, dateTime);
	
	fs.rmdirSync(renderFolderPath, { recursive: true });
}