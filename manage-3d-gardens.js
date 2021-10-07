$(document).ready(async function() {
	getSessionToken();
	createUserSelect();
	await createDateTimeSelect('renders', parseInt(localStorage.getItem('lastLoginUserID')));

	// Load modal.
	var myModal = document.getElementById('delete-render-modal');
	var myInput = document.getElementById('delete-render-btn');

	myModal.addEventListener('shown.bs.modal', function () {
		myInput.focus();
	});

	// Activate toasts.
	var toastElList = [].slice.call(document.querySelectorAll('.toast'));
	var toastList = toastElList.map(function (toastEl) {
		return new bootstrap.Toast(toastEl)
	});
});

let renderUserEmailToDel,
renderDateTimeToDel;

function getDeleteRenderInfo() {
	const scanUserToDelSelectEle = document.getElementById('user-select');
	renderUserEmailToDel = scanUserToDelSelectEle[scanUserToDelSelectEle.selectedIndex].text,
	renderDateTimeToDel = document.getElementById('date-time-select').value;

	// TODO: Error and stop if no render chosen.

	document.getElementById('chosen-garden-user').innerHTML = renderUserEmailToDel;
	document.getElementById('chosen-garden-datetime').innerHTML = formatDateTimeReadable(renderDateTimeToDel);
}

function deleteRender() {
	const successToastEle = document.getElementById('delSuccessToast'),
	successToast = bootstrap.Toast.getInstance(successToastEle),
	failToastEle = document.getElementById('delFailToast'),
	failToast = bootstrap.Toast.getInstance(failToastEle);
	
	const folderPath = path.join(__dirname, 'garden_viewer', 'FarmBot 3D Viewer_Data', 'Renders', renderUserEmailToDel, renderDateTimeToDel);
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