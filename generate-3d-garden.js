$(document).ready(async function() {
	getSessionToken();
	createUserSelect();
	await createDateTimeSelect("scans", parseInt(localStorage.getItem('lastLoginUserID')));
});

function createRender() {
	// Grab info on which scan to generate.
	const scanUserToRenderSelectEle = document.getElementById('user-select'),
	scanUserEmailToRender = scanUserToRenderSelectEle[scanUserToRenderSelectEle.selectedIndex].text,
	scanDateTimeToRender = document.getElementById('date-time-select').value,
	scanToRenderPath = 'scans/' + scanUserEmailToRender + '/' + scanDateTimeToRender,
	renderFolderPath = './garden_viewer/FarmBot 3D Viewer_Data/Renders/' + scanUserEmailToRender + '/' + scanDateTimeToRender;

	// Elements for hiding/showing when scanning.
	const startBtn = document.getElementById('start-render-btn'),
	//cancelBtn = document.getElementById('cancel-render-btn'),
	loadingSpinner = document.getElementById('render-progress-spinner'),
	renderInfoHolder = document.getElementById('render-info'),
	userInfoHolder = document.getElementById('render-user-info'),
	dateTimeInfoHolder = document.getElementById('render-datetime-info'),
	backBtn = document.getElementsByClassName('btn-back')[0],
	renderSelectionForm = document.getElementById('render-selection-form');

	// Check if renders folders exists yet, and create if not.
	if (!fs.existsSync('./garden_viewer/FarmBot 3D Viewer_Data/Renders')) {
		fs.mkdirSync('./garden_viewer/FarmBot 3D Viewer_Data/Renders');
	}

	if (!fs.existsSync('./garden_viewer/FarmBot 3D Viewer_Data/Renders/' + scanUserEmailToRender)) {
		fs.mkdirSync('./garden_viewer/FarmBot 3D Viewer_Data/Renders/' + scanUserEmailToRender);
	}

	if (!fs.existsSync(renderFolderPath)) {
		fs.mkdirSync(renderFolderPath);
	} else {
		// TODO: render already exists error.
		console.log('no');
		return;
	}

	// TODO: Do stuff to show loading.
	// Disable and hide scan button.
	startBtn.setAttribute("disabled", "");
	startBtn.classList.add("d-none");

	// Disable back button.
	backBtn.setAttribute("disabled", "");

	// Show cancel button.
	//cancelBtn.classList.remove("d-none");

	// Show loading spinner.
	loadingSpinner.classList.remove("d-none");

	// Show render info.
	userInfoHolder.innerHTML = scanUserEmailToRender;
	dateTimeInfoHolder.innerHTML = formatDateTimeReadable(scanDateTimeToRender);
	renderInfoHolder.classList.remove("d-none");

	// Hide selection form.
	renderSelectionForm.classList.add("d-none");

	// Copy farm data to render folder.
	fs.copyFile(scanToRenderPath + '/farm_size.csv', renderFolderPath + '/farm_size.csv', (err) => {
		if (err) throw err;
	});
	fs.copyFile(scanToRenderPath + '/plant_data.csv', renderFolderPath + '/plant_data.csv', (err) => {
		if (err) throw err;
	});

	// Execute Meshroom application through command line.
	const child = require('child_process').execFile;
	const executablePath = "Meshroom-2018.1.0/meshroom_photogrammetry.exe",
	parameters = ["--input", scanToRenderPath, "--output", renderFolderPath, "--scale", "2"];

/* 	child(executablePath, parameters, function (err, data) {
		console.log(err)
		console.log(data.toString());

		let logData = data.toString();
		let progress = 0;
		progress = logData.search('[13/13]')

		if (progress != 0) {
			// TODO: Success toast.
			console.log('scan done! :)');
		}
	}); */

	// TODO: Hide the loading stuff.
}