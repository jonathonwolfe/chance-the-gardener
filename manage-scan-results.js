$(document).ready(function() {
	getSessionToken();
	createUserSelect();
	createDateTimeSelect("scans", localStorage.getItem('lastLoginUserID'));

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

let scanUser,
scanDateTime,
folderPath;

function getDeleteScanInfo() {
	scanUser = document.getElementById('user-select').value,
	scanDateTime = document.getElementById('date-time-select').value;

	document.getElementById('chosen-scan-user').innerHTML = scanUser;
	document.getElementById('chosen-scan-datetime').innerHTML = scanDateTime;
}

function deleteScan() {
	const successToastEle = document.getElementById('delSuccessToast'),
	successToast = bootstrap.Toast.getInstance(successToastEle),
	failToastEle = document.getElementById('delFailToast'),
	failToast = bootstrap.Toast.getInstance(failToastEle);
	
	folderPath = "./scans/" + scanUser + "/" + scanDateTime;

	// TODO: Test this when getting user lists from db is done.
	// Delete scan folder.
	//fs.rmdirSync(folderPath, { recursive: true });

	// Check if deleted and notify user on results.
	if (!fs.existsSync(folderPath)) {
		// Success.
		successToast.show();
	} else {
		// Failure.
		failToast.show();
	}
}

function loadPhotoViewer() {
	// TODO: Test this when getting user lists from db is done.
	// Get the scan folder.
	//scanUser = document.getElementById('user-select').value,
	scanUser = "1";
	scanDateTime = document.getElementById('date-time-select').value;
	folderPath = "./scans/" + scanUser + "/" + scanDateTime;

	// Store which folder to view.
	localStorage.setItem('photosToView', folderPath);

	changePage("view-scan-photos.html");
}

function loadPlantDataViewer() {

	changePage("view-scan-plant-data.html");
}