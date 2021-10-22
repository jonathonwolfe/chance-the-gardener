$(document).ready(async function() {
	await demoPageStartUp();
	createUserSelect();
	await createDateTimeSelect('renders', 1);

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

	// Load modal.
	var myModal = document.getElementById('import-modal');
	var myInput = document.getElementById('import-btn');

	myModal.addEventListener('shown.bs.modal', function () {
		myInput.focus();
	});

	// Set up detecting import filepath.
	$('#import-file-input').change(function (data) {
		const fileToImportInfo = data.target.files[0];
		if (fileToImportInfo === undefined) {
			fileToImportFilepath = undefined;
		} else {
			fileToImportFilepath = fileToImportInfo.path;
		}
	});
});

let renderUserEmailToDel,
renderDateTimeToDel,
fileToImportFilepath,
firstFilePath,
importType,
importEmail;

async function demoPageStartUp() {
	// Check if demo_user exists in db, and create if not.
	const demoUserEmailObj = {email: 'demo_user'},
	matchingDemoUser = await getDbRowWhere('user', demoUserEmailObj);
	if (matchingDemoUser.length == 0) {
		await addDbTableRow('user', demoUserEmailObj);
	}
}

function getDeleteRenderInfo() {
	const renderUserToDelSelectEle = document.getElementById('user-select');
	renderUserEmailToDel = renderUserToDelSelectEle[renderUserToDelSelectEle.selectedIndex].text,
	renderDateTimeToDel = document.getElementById('date-time-select').value;

	// Error and stop if no render chosen.
	if (renderDateTimeToDel == 'No renders found for this user') {
		// Show error.
		const noRenderToast = new bootstrap.Toast(document.getElementById('render-no-choice-toast'));
		noRenderToast.show();
	} else {
		document.getElementById('chosen-garden-user').innerHTML = renderUserEmailToDel;
		document.getElementById('chosen-garden-datetime').innerHTML = formatDateTimeReadable(renderDateTimeToDel);
		// Show confirmation modal.
		const delConfModal = new bootstrap.Modal(document.getElementById('delete-render-modal'));
		delConfModal.show();
	}
}

function deleteRender() {
	const successToastEle = document.getElementById('del-success-toast'),
	successToast = bootstrap.Toast.getInstance(successToastEle),
	failToastEle = document.getElementById('del-fail-toast'),
	failToast = bootstrap.Toast.getInstance(failToastEle);

	const folderPath = path.join(__dirname, 'garden_viewer', 'FarmBot 3D Viewer_Data', 'FarmBotData', 'Renders', renderUserEmailToDel, renderDateTimeToDel);
	// Delete render folder.
	fs.rmdirSync(folderPath, { recursive: true });

	// Check if deleted and notify user on results.
	if (!fs.existsSync(folderPath)) {
		// Success.
		successToast.show();
	} else {
		// Failure.
		failToast.show();
	}

	reloadDateTimeSelect('renders');
}

async function importRender() {
	const StreamZip = require('node-stream-zip');
	const successToastEle = document.getElementById('import-success-toast'),
	successToast = bootstrap.Toast.getInstance(successToastEle),
	failToastEle = document.getElementById('import-fail-toast'),
	failToast = bootstrap.Toast.getInstance(failToastEle),
	failScanToastEle = document.getElementById('import-scan-unallowed-toast'),
	failScanToast = bootstrap.Toast.getInstance(failScanToastEle),
	loadingSpinner = document.getElementById('progress-spinner'),
	buttons = document.getElementsByClassName('container-fluid')[0].getElementsByClassName('btn'),
	scanUserSelect = document.getElementById('user-select'),
	scanDateTimeSelect = document.getElementById('date-time-select');

	if (fileToImportFilepath === undefined) {
		// Error nothing chosen.
		document.getElementById('import-file-input').classList.add("is-invalid");
		return;
	} else {
		document.getElementById('import-file-input').classList.remove("is-invalid");
		$('#import-modal').modal('hide');
	}

	// Show loading spinner.
	loadingSpinner.classList.remove("d-none");

	// Disable buttons.
	for (let i = 0; i < buttons.length; i++) {
		buttons[i].setAttribute("disabled", "");
	}

	// Disable drop-downs.
	scanUserSelect.setAttribute("disabled", "");
	scanDateTimeSelect.setAttribute("disabled", "");

	// Open the import zip.
	const zip = new StreamZip.async({ file: fileToImportFilepath });
	const zipContents = await zip.entries();

	// Get path of first file/folder in zip, and then import type based on that.
	firstFilePath = Object.keys(zipContents)[0],
	importType = firstFilePath.split('/')[0];

	// Grab email from import.
	if (importType == 'scans' || importType == 'thumbs') {
		log.info('This is a scan!');
		// Scans cannot be imported here.
		// Hide loading spinner.
		loadingSpinner.classList.add("d-none");

		// Enable buttons.
		for (let i = 0; i < buttons.length; i++) {
			buttons[i].removeAttribute("disabled");
		}

		// Enable drop-downs.
		scanUserSelect.removeAttribute("disabled");
		scanDateTimeSelect.removeAttribute("disabled");

		// Notify user.
		failScanToast.show();

		return;
	} else if (importType == 'garden_viewer') {
		log.info('This is a garden render!');
		let gardenEmailPath = Object.keys(zipContents)[4];
		importEmail = gardenEmailPath.split('/')[4];
	} else {
		// Invalid import file.
		// Hide loading spinner.
		loadingSpinner.classList.add("d-none");

		// Enable buttons.
		for (let i = 0; i < buttons.length; i++) {
			buttons[i].removeAttribute("disabled");
		}

		// Enable drop-downs.
		scanUserSelect.removeAttribute("disabled");
		scanDateTimeSelect.removeAttribute("disabled");

		// Notify user.
		failToast.show();
		return;
	}

	// Check if email exists in db.
	const newUserEmailObj = {email: importEmail},
	matchingUser = await getDbRowWhere('user', newUserEmailObj);

	// Ask to merge if no match, otherwise do it automatically.
	if (matchingUser.length == 0) {
		// If no matching email, merge with demo_user.

		// Check if renders folders exist yet, and create if not.
		if (!fs.existsSync(path.join(__dirname, 'garden_viewer', 'FarmBot 3D Viewer_Data', 'FarmBotData'))) {
			fs.mkdirSync(path.join(__dirname, 'garden_viewer', 'FarmBot 3D Viewer_Data', 'FarmBotData'));
		}

		if (!fs.existsSync(path.join(__dirname, 'garden_viewer', 'FarmBot 3D Viewer_Data', 'FarmBotData', 'Renders'))) {
			fs.mkdirSync(path.join(__dirname, 'garden_viewer', 'FarmBot 3D Viewer_Data', 'FarmBotData', 'Renders'));
		}

		if (!fs.existsSync(path.join(__dirname, 'garden_viewer', 'FarmBot 3D Viewer_Data', 'FarmBotData', 'Renders', 'demo_user'))) {
			fs.mkdirSync(path.join(__dirname, 'garden_viewer', 'FarmBot 3D Viewer_Data', 'FarmBotData', 'Renders', 'demo_user'));
		}

		// Extract the files.
		await zip.extract('garden_viewer/FarmBot 3D Viewer_Data/FarmBotData/Renders/' + importEmail, path.join(__dirname, 'garden_viewer', 'FarmBot 3D Viewer_Data', 'FarmBotData', 'Renders', 'demo_user'));

		// Refresh user drop-down.
		reloadUserSelect();
	} else {
		// Extract the files.
		await zip.extract(null, __dirname);
	}

	// Close zip.
	await zip.close();
		
	reloadDateTimeSelect('renders');

	// Success toast.
	successToast.show();

	// Hide loading spinner.
	loadingSpinner.classList.add("d-none");

	// Enable buttons.
	for (let i = 0; i < buttons.length; i++) {
		buttons[i].removeAttribute("disabled");
	}

	// Enable drop-downs.
	scanUserSelect.removeAttribute("disabled");
	scanDateTimeSelect.removeAttribute("disabled");
}

function launchGardenViewer() {
	const child = require('child_process').execFile,
	executablePath = path.join(__dirname, 'garden_viewer', 'FarmBot 3D Viewer.exe');
	const launchBtn = document.getElementById("launch-viewer-btn"),
	loadMsg = document.getElementById("viewer-launch-msg"),
	loadingSpinner = document.getElementById("viewer-launch-spinner");

	// Disable launch button.
	launchBtn.setAttribute("disabled", "");

	// Show loading message.
	loadMsg.classList.remove("d-none");
	
	// Show loading spinner.
	loadingSpinner.classList.remove("d-none");

	child(executablePath, function (err, data) {
		log.error(err)
		log.info(data.toString());
	});

	setTimeout(function () {
		// Re-enable launch button.
		launchBtn.removeAttribute("disabled");

		// Hide loading message.
		loadMsg.classList.add("d-none");
		
		// Hide loading spinner.
		loadingSpinner.classList.add("d-none");
	}, 30000);
}