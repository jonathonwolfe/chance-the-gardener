$(document).ready(async function() {
	loggedInCheck();
	getSessionToken();
	createUserSelect();
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
fileToImportFilepath;

function getDeleteRenderInfo() {
	const scanUserToDelSelectEle = document.getElementById('user-select');
	renderUserEmailToDel = scanUserToDelSelectEle[scanUserToDelSelectEle.selectedIndex].text,
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
	// Delete scan folder.
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
	loadingSpinner = document.getElementById('export-progress-spinner'),
	buttons = document.getElementsByClassName('btn'),
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

	if (fileToImportFilepath === undefined) {
		// TODO: Error nothing chosen
		log.error('No file chosen for import.');
		return;
	}

	const zip = new StreamZip.async({ file: fileToImportFilepath });
	const zipContents = await zip.entries();

	const firstFilePath = Object.keys(zipContents)[0],
	importType = firstFilePath.split('/')[0];

	if (importType == 'scans' || importType == 'thumbs') {
		log.info('This is a scan!');
	} else if (importType == 'Renders') {
		log.info('This is a garden render!');
		// TODO: Check anc create render folder structure.
	} else {
		// TODO: Error.
		log.error('Invalid import');
	}

	await zip.extract(null, __dirname);

	// Close zip.
	await zip.close();

	// TODO: Toast import complete.
}