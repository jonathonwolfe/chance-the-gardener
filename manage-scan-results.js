$(document).ready(async function() {
	loggedInCheck();
	getSessionToken();
	createUserSelect();
	await createDateTimeSelect('scans', parseInt(localStorage.getItem('lastLoginUserID')));

	// Activate toasts.
	var toastElList = [].slice.call(document.querySelectorAll('.toast'));
	var toastList = toastElList.map(function (toastEl) {
		return new bootstrap.Toast(toastEl)
	});
});

let scanUserEmailToDel,
scanDateTimeToDel,
scanUserEmailToExport,
scanUserDateTimeToExport;

function getDeleteScanInfo() {
	const scanUserToDelSelectEle = document.getElementById('user-select');
	scanUserEmailToDel = scanUserToDelSelectEle[scanUserToDelSelectEle.selectedIndex].text,
	scanDateTimeToDel = document.getElementById('date-time-select').value;

	// Error and stop if no scan chosen.
	if (scanDateTimeToDel == 'No scans found for this user') {
		// Show error.
		const noScanToast = new bootstrap.Toast(document.getElementById('scan-no-choice-toast'));
		noScanToast.show();
	} else {
		document.getElementById('chosen-scan-user').innerHTML = scanUserEmailToDel;
		document.getElementById('chosen-scan-datetime').innerHTML = formatDateTimeReadable(scanDateTimeToDel);
		// Show confirmation modal.
		const delConfModal = new bootstrap.Modal(document.getElementById('delete-scan-modal'));
		delConfModal.show();
	}
}

function deleteScan() {
	const successToastEle = document.getElementById('del-success-toast'),
	successToast = bootstrap.Toast.getInstance(successToastEle),
	failToastEle = document.getElementById('del-fail-toast'),
	failToast = bootstrap.Toast.getInstance(failToastEle);

	const scanFolderPath = path.join(__dirname, 'scans', scanUserEmailToDel, scanDateTimeToDel),
	thumbsFolderPath = path.join(__dirname, 'thumbs', scanUserEmailToDel, scanDateTimeToDel);
	// Delete scan and thumbs folders.
	fs.rmdirSync(scanFolderPath, { recursive: true });
	fs.rmdirSync(thumbsFolderPath, { recursive: true });

	// Check if deleted and notify user on results.
	if ((!fs.existsSync(scanFolderPath)) && (!fs.existsSync(thumbsFolderPath))) {
		// Success.
		successToast.show();
	} else {
		// Failure.
		failToast.show();
	}

	reloadDateTimeSelect('scans');
}

async function loadPhotoViewer() {
	// Get the scan folder.
	const scanDateTime = document.getElementById('date-time-select').value;
	// Get user's email from db.
	const selectedUserId = parseInt(document.getElementById('user-select').value),
	currentUserObj = {userId: selectedUserId},
	userCreds = await getDbRowWhere('user', currentUserObj),
	emailAdd = userCreds[0].email;

	const folderPaths = [(path.join(__dirname, 'scans', emailAdd, scanDateTime)), (path.join(__dirname, 'thumbs', emailAdd, scanDateTime))];

	// Store which folder to view.
	localStorage.setItem("photosToView", JSON.stringify(folderPaths));

	changePage("view-scan-photos.html");
}

async function loadPlantDataViewer() {
	// Get the scan folder.
	const scanDateTime = document.getElementById('date-time-select').value;
	// Get user's email from db.
	const selectedUserId = parseInt(document.getElementById('user-select').value),
	currentUserObj = {userId: selectedUserId},
	userCreds = await getDbRowWhere('user', currentUserObj),
	emailAdd = userCreds[0].email;

	const folderPath = path.join(__dirname, 'scans', emailAdd, scanDateTime);

	// Store which folder to view.
	localStorage.setItem("plantDataToView", JSON.stringify(folderPath));

	changePage("view-scan-plant-data.html");
}

function getExportScanInfo() {
	const scanUserToExportSelectEle = document.getElementById('user-select');
	scanUserEmailToExport = scanUserToExportSelectEle[scanUserToExportSelectEle.selectedIndex].text,
	scanDateTimeToExport = document.getElementById('date-time-select').value;

	// Error and stop if no render chosen.
	if (scanDateTimeToExport == 'No scans found for this user') {
		// Show error.
		const noScanToast = new bootstrap.Toast(document.getElementById('scan-no-choice-toast'));
		noScanToast.show();
	} else {
		document.getElementById('chosen-scan-export-user').innerHTML = scanUserEmailToExport;
		document.getElementById('chosen-scan-export-datetime').innerHTML = formatDateTimeReadable(scanDateTimeToExport);
		const exportFileName = 'Scan_' + scanUserEmailToExport + '_' + scanDateTimeToExport + '.zip',
		exportPath = path.join(__dirname, 'exports', exportFileName);
		document.getElementById('export-scan-path').innerHTML = exportPath;

		// Show confirmation modal.
		const exportConfModal = new bootstrap.Modal(document.getElementById('export-scan-modal'));
		exportConfModal.show();
	}
}

function exportScan() {
	const archiver = require('archiver');

	const successToastEle = document.getElementById('export-success-toast'),
	successToast = bootstrap.Toast.getInstance(successToastEle),
	failToastEle = document.getElementById('export-fail-toast'),
	failToast = bootstrap.Toast.getInstance(failToastEle);

	const scanFolderPath = path.join(__dirname, 'scans', scanUserEmailToExport, scanDateTimeToExport),
	thumbsFolderPath = path.join(__dirname, 'thumbs', scanUserEmailToExport, scanDateTimeToExport),
	exportFileName = 'Scan_' + scanUserEmailToExport + '_' + scanDateTimeToExport + '.zip',
	exportPath = path.join(__dirname, 'exports', exportFileName);

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
	});

	archive.on('warning', function(err) {
		if (err.code === 'ENOENT') {
			// log warning
			log.error(err);
			failToast.show();
		} else {
			// throw error
			log.error(err);
			failToast.show();
			throw err;
		}
	});

	archive.on('error', function(err) {
		log.error(err);
		failToast.show();
		throw err;
	});

	// Pipe data to the .zip file
	archive.pipe(output);

	// Append files from a the chosen scan and its thumbs folders.
	archive.directory(scanFolderPath, path.join('scans', scanUserEmailToExport, scanDateTimeToExport));
	archive.directory(thumbsFolderPath, path.join('thumbs', scanUserEmailToExport, scanDateTimeToExport));

	archive.finalize();
}