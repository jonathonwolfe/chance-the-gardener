$(document).ready(async function() {
	getSessionToken();
	createUserSelect();
	await createDateTimeSelect('scans', parseInt(localStorage.getItem('lastLoginUserID')));

	// Load modal.
	var myModal = document.getElementById('delete-scan-modal');
	var myInput = document.getElementById('delete-scan-btn');

	myModal.addEventListener('shown.bs.modal', function () {
		myInput.focus();
	});

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

	document.getElementById('chosen-scan-user').innerHTML = scanUserEmailToDel;
	document.getElementById('chosen-scan-datetime').innerHTML = formatDateTimeReadable(scanDateTimeToDel);
}

function deleteScan() {
	const successToastEle = document.getElementById('delSuccessToast'),
	successToast = bootstrap.Toast.getInstance(successToastEle),
	failToastEle = document.getElementById('delFailToast'),
	failToast = bootstrap.Toast.getInstance(failToastEle);
	
	let folderPath = "./scans/" + scanUserEmailToDel + "/" + scanDateTimeToDel;

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

	const folderPaths = [("./scans/" + emailAdd + "/" + scanDateTime), ("./thumbs/" + emailAdd + "/" + scanDateTime)];

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

	const folderPath = "./scans/" + emailAdd + "/" + scanDateTime;

	// Store which folder to view.
	localStorage.setItem("plantDataToView", JSON.stringify(folderPath));

	changePage("view-scan-plant-data.html");
}