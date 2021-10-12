$(document).ready(async function() {
	loggedInCheck();
	getSessionToken();
	createUserSelect();
	createImportUserSelect();
	await createDateTimeSelect('renders', parseInt(localStorage.getItem('lastLoginUserID')));

	// Activate toasts.
	var toastElList = [].slice.call(document.querySelectorAll('.toast'));
	var toastList = toastElList.map(function (toastEl) {
		return new bootstrap.Toast(toastEl)
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
renderUserEmailToExport,
renderDateTimeToExport,
fileToImportFilepath,
firstFilePath,
importType;

async function createImportUserSelect() {
	// Create an array of user IDs and their emails from the database.
	var userIDList = await getDbEntireTable('user');

	// Add values to select list.
	const selectList = document.getElementById("import-user-select");
	for (let i = 0; i < userIDList.length; i++) {
		let userOption = document.createElement("option");
		userOption.textContent = userIDList[i].email;
		userOption.value = userIDList[i].userId;
		selectList.appendChild(userOption);
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

function getExportRenderInfo() {
	const renderUserToExportSelectEle = document.getElementById('user-select');
	renderUserEmailToExport = renderUserToExportSelectEle[renderUserToExportSelectEle.selectedIndex].text,
	renderDateTimeToExport = document.getElementById('date-time-select').value;

	// Error and stop if no render chosen.
	if (renderDateTimeToExport == 'No renders found for this user') {
		// Show error.
		const noRenderToast = new bootstrap.Toast(document.getElementById('render-no-choice-toast'));
		noRenderToast.show();
	} else {
		document.getElementById('chosen-render-export-user').innerHTML = renderUserEmailToExport;
		document.getElementById('chosen-render-export-datetime').innerHTML = formatDateTimeReadable(renderDateTimeToExport);
		const exportFileName = 'Render_' + renderUserEmailToExport + '_' + renderDateTimeToExport + '.zip',
		exportPath = path.join(__dirname, 'exports', exportFileName);
		document.getElementById('export-render-path').innerHTML = exportPath;

		// Show confirmation modal.
		const exportConfModal = new bootstrap.Modal(document.getElementById('export-render-modal'));
		exportConfModal.show();
	}
}

function exportRender() {
	const archiver = require('archiver');

	const successToastEle = document.getElementById('export-success-toast'),
	successToast = bootstrap.Toast.getInstance(successToastEle),
	failToastEle = document.getElementById('export-fail-toast'),
	failToast = bootstrap.Toast.getInstance(failToastEle),
	loadingSpinner = document.getElementById('progress-spinner'),
	buttons = document.getElementsByClassName('container-fluid')[0].getElementsByClassName('btn'),
	renderUserSelect = document.getElementById('user-select'),
	renderDateTimeSelect = document.getElementById('date-time-select');

	const renderFolderPath = path.join(__dirname, 'garden_viewer', 'FarmBot 3D Viewer_Data', 'FarmBotData', 'Renders', renderUserEmailToExport, renderDateTimeToExport),
	exportFileName = 'Render_' + renderUserEmailToExport + '_' + renderDateTimeToExport + '.zip',
	exportPath = path.join(__dirname, 'exports', exportFileName);

	// Show loading spinner.
	loadingSpinner.classList.remove("d-none");

	// Disable buttons.
	for (let i = 0; i < buttons.length; i++) {
		buttons[i].setAttribute("disabled", "");
	}

	// Disable drop-downs.
	renderUserSelect.setAttribute("disabled", "");
	renderDateTimeSelect.setAttribute("disabled", "");

	// Check if exports folder exists yet, and create if not.
	if (!fs.existsSync(path.join(__dirname, 'exports'))) {
		fs.mkdirSync(path.join(__dirname, 'exports'));
	}

	// TODO: Handle export already existing.

	// Create a .zip file to stream data to.
	const output = fs.createWriteStream(exportPath);
	const archive = archiver('zip', {
	zlib: { level: 9 } // Sets the compression level.
	});

	// Wait for finish.
	output.on('close', function() {
		log.info(archive.pointer() + ' total bytes');
		log.info('archiver has been finalized and the output file descriptor has closed.');

		// Success toast.
		successToast.show();

		// Hide loading spinner.
		loadingSpinner.classList.add("d-none");

		// Enable buttons.
		for (let i = 0; i < buttons.length; i++) {
			buttons[i].removeAttribute("disabled");
		}

		// Enable drop-downs.
		renderUserSelect.removeAttribute("disabled");
		renderDateTimeSelect.removeAttribute("disabled");
	});

	archive.on('warning', function(err) {
		if (err.code === 'ENOENT') {
			log.error(err);

			failToast.show();

			// Hide loading spinner.
			loadingSpinner.classList.add("d-none");

			// Enable buttons.
			for (let i = 0; i < buttons.length; i++) {
				buttons[i].removeAttribute("disabled");
			}

			// Enable drop-downs.
			renderUserSelect.removeAttribute("disabled");
			renderDateTimeSelect.removeAttribute("disabled");
		} else {
			log.error(err);

			failToast.show();

			// Hide loading spinner.
			loadingSpinner.classList.add("d-none");

			// Enable buttons.
			for (let i = 0; i < buttons.length; i++) {
				buttons[i].removeAttribute("disabled");
			}

			// Enable drop-downs.
			renderUserSelect.removeAttribute("disabled");
			renderDateTimeSelect.removeAttribute("disabled");

			throw err;
		}
	});

	archive.on('error', function(err) {
		log.error(err);

		failToast.show();

		// Hide loading spinner.
		loadingSpinner.classList.add("d-none");

		// Enable buttons.
		for (let i = 0; i < buttons.length; i++) {
			buttons[i].removeAttribute("disabled");
		}

		// Enable drop-downs.
		renderUserSelect.removeAttribute("disabled");
		renderDateTimeSelect.removeAttribute("disabled");

		throw err;
	});

	// Pipe data to the .zip file
	archive.pipe(output);

	// Append files from a the chosen render folder.
	archive.directory(renderFolderPath, path.join('garden_viewer', 'FarmBot 3D Viewer_Data', 'FarmBotData', 'Renders', renderUserEmailToExport, renderDateTimeToExport));

	archive.finalize();
}

// TODO: Hide/show loading spinner.
async function importScanRender() {
	const StreamZip = require('node-stream-zip');
	const successToastEle = document.getElementById('import-success-toast'),
	successToast = bootstrap.Toast.getInstance(successToastEle),
	failToastEle = document.getElementById('import-fail-toast'),
	failToast = bootstrap.Toast.getInstance(failToastEle),
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

	// Get path of first file in zip, and then import type based on that.
	firstFilePath = Object.keys(zipContents)[0],
	importType = firstFilePath.split('/')[0];

	// Grab email from import.
	let importEmail;
	if (importType == 'scans' || importType == 'thumbs') {
		log.info('This is a scan!');
		importEmail = firstFilePath.split('/')[1];
	} else if (importType == 'garden_viewer') {
		log.info('This is a garden render!');
		importEmail = firstFilePath.split('/')[4];
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
		// If no matching email, ask if they want to merge with an existing user.
		const mergeModal = new bootstrap.Modal(document.getElementById('merge-import-modal'));
		mergeModal.show();
		// Close zip.
		await zip.close();
	} else {
		// Extract the files.
		await zip.extract(null, __dirname);
		// Close zip.
		await zip.close();

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
}

async function normalImport() {
	const StreamZip = require('node-stream-zip');
	const successToastEle = document.getElementById('import-success-toast'),
	successToast = bootstrap.Toast.getInstance(successToastEle),
	loadingSpinner = document.getElementById('progress-spinner'),
	buttons = document.getElementsByClassName('container-fluid')[0].getElementsByClassName('btn'),
	scanUserSelect = document.getElementById('user-select'),
	scanDateTimeSelect = document.getElementById('date-time-select');

	// Open the import zip.
	const zip = new StreamZip.async({ file: fileToImportFilepath });

	// Extract the files.
	await zip.extract(null, __dirname);
	// Close zip.
	await zip.close();

	// Grab email from import.
	let importEmail;
	if (importType == 'scans' || importType == 'thumbs') {
		importEmail = firstFilePath.split('/')[1];
	} else if (importType == 'garden_viewer') {
		importEmail = firstFilePath.split('/')[4];
	}

	// Create new user entry in db.
	const newUserCredsObj = {email: importEmail, password: ''};
	await addDbTableRow('user', newUserCredsObj);

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

async function mergeImport() {
	const StreamZip = require('node-stream-zip');
	const successToastEle = document.getElementById('import-success-toast'),
	successToast = bootstrap.Toast.getInstance(successToastEle),
	loadingSpinner = document.getElementById('progress-spinner'),
	buttons = document.getElementsByClassName('container-fluid')[0].getElementsByClassName('btn'),
	scanUserSelect = document.getElementById('user-select'),
	scanDateTimeSelect = document.getElementById('date-time-select');

	// Grab which existing user to merge into.
	const renderUserToMergeImportSelectEle = document.getElementById('import-user-select'),
	renderUserEmailToMergeImport = renderUserToMergeImportSelectEle[renderUserToMergeImportSelectEle.selectedIndex].text;

	// Open the import zip.
	const zip = new StreamZip.async({ file: fileToImportFilepath });
	const zipContents = await zip.entries();

	if (importType == 'scans' || importType == 'thumbs') {
		let importEmail = firstFilePath.split('/')[1];

		// Check if scans & thumbs folders exist yet, and create if not.
		if (!fs.existsSync(path.join(__dirname, 'scans'))) {
			fs.mkdirSync(path.join(__dirname, 'scans'));
		}
		if (!fs.existsSync(path.join(__dirname, 'thumbs'))) {
			fs.mkdirSync(path.join(__dirname, 'thumbs'));
		}

		if (!fs.existsSync(path.join(__dirname, 'scans', renderUserEmailToMergeImport))) {
			fs.mkdirSync(path.join(__dirname, 'scans', renderUserEmailToMergeImport));
		}
		if (!fs.existsSync(path.join(__dirname, 'thumbs', renderUserEmailToMergeImport))) {
			fs.mkdirSync(path.join(__dirname, 'thumbs', renderUserEmailToMergeImport));
		}

		// Extract the files.
		await zip.extract('scans/' + importEmail, path.join(__dirname, 'scans', renderUserEmailToMergeImport));
		await zip.extract('thumbs/' + importEmail, path.join(__dirname, 'thumbs', renderUserEmailToMergeImport));
	} else if (importType == 'garden_viewer') {
		let importEmail = firstFilePath.split('/')[4];

		// Check if renders folders exist yet, and create if not.
		if (!fs.existsSync(path.join(__dirname, 'garden_viewer', 'FarmBot 3D Viewer_Data', 'FarmBotData'))) {
			fs.mkdirSync(path.join(__dirname, 'garden_viewer', 'FarmBot 3D Viewer_Data', 'FarmBotData'));
		}

		if (!fs.existsSync(path.join(__dirname, 'garden_viewer', 'FarmBot 3D Viewer_Data', 'FarmBotData', 'Renders'))) {
			fs.mkdirSync(path.join(__dirname, 'garden_viewer', 'FarmBot 3D Viewer_Data', 'FarmBotData', 'Renders'));
		}

		if (!fs.existsSync(path.join(__dirname, 'garden_viewer', 'FarmBot 3D Viewer_Data', 'FarmBotData', 'Renders', renderUserEmailToMergeImport))) {
			fs.mkdirSync(path.join(__dirname, 'garden_viewer', 'FarmBot 3D Viewer_Data', 'FarmBotData', 'Renders', renderUserEmailToMergeImport));
		}

		// Extract the files.
		await zip.extract('garden_viewer/FarmBot 3D Viewer_Data/FarmBotData/Renders/' + importEmail, path.join(__dirname, 'garden_viewer', 'FarmBot 3D Viewer_Data', 'FarmBotData', 'Renders', renderUserEmailToMergeImport));
	}

	// Close zip.
	await zip.close();

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

function showImportMergeConfirmationModal() {
	const mergeModal = new bootstrap.Modal(document.getElementById('merge-import-process-modal'));
	mergeModal.show();
}

function backToImportPrompt() {
	const mergeModal = new bootstrap.Modal(document.getElementById('merge-import-modal'));
	mergeModal.show();
}