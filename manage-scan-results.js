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
scanDateTimeToDel;

function getDeleteScanInfo() {
	const scanUserToDelSelectEle = document.getElementById('user-select');
	scanUserEmailToDel = scanUserToDelSelectEle[scanUserToDelSelectEle.selectedIndex].text,
	scanDateTimeToDel = document.getElementById('date-time-select').value;

	// Error and stop if no render chosen.
	if (scanDateTimeToDel == 'No scans found for this user') {
		// Show error.
		const noScanToast = new bootstrap.Toast(document.getElementById('del-no-choice-toast'));
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
	
	let scanFolderPath = path.join(__dirname, 'scans', scanUserEmailToDel, scanDateTimeToDel),
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