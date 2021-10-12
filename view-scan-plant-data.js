$(document).ready(async function() {
	loggedInCheck();
	getSessionToken();
	createUserSelect();

	// Set dropdown values to loaded plant data.
	// Find user ID of current scan's user email.
	const loadedScanFilepathSplit = JSON.parse(localStorage.getItem("plantDataToView")).split(path.sep),
	userEmailToLoad = loadedScanFilepathSplit[loadedScanFilepathSplit.length - 2],
	userToLoadObj = {email: userEmailToLoad},
	loadedUserDetails = await getDbRowWhere('user', userToLoadObj);
	$(function() {
		$('#user-select').find('option').filter(function() {
			return this.innerHTML == userEmailToLoad;
		}).attr("selected", true);
	});
	
	await createDateTimeSelect('scans', loadedUserDetails[0].userId);
	document.getElementById("date-time-select").value = loadedScanFilepathSplit[loadedScanFilepathSplit.length - 1];

	// Load the plant data file.
	loadPlantDataTable(JSON.parse(localStorage.getItem("plantDataToView")), loadedScanFilepathSplit[loadedScanFilepathSplit.length - 1]);
});

function loadPlantDataCsv(scanFolder) {
	return new Promise((resolve, reject) => {
		const csv = require('@fast-csv/parse');
		let plantData = [];

		csv.parseFile(scanFolder + '/plant_data.csv', { headers: true })
			.on('error', error => reject(error))
			.on('data', row => plantData.push(row))
			.on('end', rowCount => resolve(plantData));
	});
}

async function loadPlantDataTable(scanFolder, dateTime) {
	const plantData = await loadPlantDataCsv(scanFolder);
	const moment = require('moment');
	const tableBody = document.getElementById('plant-data-table').children[1];
	for (let i = 0; i < plantData.length; i++) {
		// Calculate plant age.
		let plantedDateTime = moment(plantData[i].planted_at),
		scanDateTime = moment(dateTime, 'YYYY-MM-DD HH-mm-ss'),
		plantAge = scanDateTime.diff(plantedDateTime, 'days');

		// Create and append table row.
		let tableRowEle = document.createElement("tr");
		tableRowEle.innerHTML = '<td>' + plantData[i].id +'</td><td>' + plantData[i].name +'</td><td>'+ plantAge +' days</td><td>' + plantData[i].x +'</td><td>' + plantData[i].y +'</td><td>' + plantData[i].z +'</td><td>' + plantData[i].plant_stage +'</td>';
		tableBody.appendChild(tableRowEle);
	}
}

async function reloadPlantDataTable() {
	// When user or scan selection changes, load the new plant data.
	const user = parseInt(document.getElementById("user-select").value),
	dateTime = document.getElementById("date-time-select").value,
	// Get user's email from db.
	currentUserObj = {userId: user},
	userCreds = await getDbRowWhere('user', currentUserObj),
	emailAdd = userCreds[0].email,
	folder = path.join(__dirname, 'scans', emailAdd, dateTime);

	// Delete current plant data.
	document.getElementById("plant-data-table").children[1].innerHTML = "";

	// Check if this user actually has plant data to view.
	if (fs.existsSync(folder)) {
		// Load new plant data.
		loadPlantDataTable(folder, dateTime);
	} else {
		// TODO: Error.
	}
}

async function plantDataUserSelectChange(userId) {
	await reloadDateTimeSelect('scans', userId);
	reloadPlantDataTable();
}