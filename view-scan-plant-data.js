$(document).ready(async function() {
	getSessionToken();
	//loadFolderPhotos(JSON.parse(localStorage.getItem('plantDataToView')));
	createUserSelect();

	// Set dropdown values to loaded plant data.
	// Find user ID of current scan's user email.
	const loadedScanFilepathSplit = JSON.parse(localStorage.getItem("plantDataToView")).split("/"),
	userEmailToLoad = loadedScanFilepathSplit[2],
	userToLoadObj = {email: userEmailToLoad},
	loadedUserDetails = await getDbRowWhere('user', userToLoadObj);
	$(function() {
		$('#user-select').find('option').filter(function() {
			return this.innerHTML == userEmailToLoad;
		}).attr("selected", true);
	});
	
	await createDateTimeSelect('scans', loadedUserDetails[0].userId);
	document.getElementById("date-time-select").value = loadedScanFilepathSplit[3];

	// Load the plant data file.
	const plantData = await loadCsv(JSON.parse(localStorage.getItem("plantDataToView")));
	loadPlantDataTable(plantData, loadedScanFilepathSplit[3]);
});

function loadCsv(csvFilepath) {
	return new Promise((resolve, reject) => {
		const csv = require('@fast-csv/parse');
		let plantData = [];

		csv.parseFile(csvFilepath + '/plant_data.csv', { headers: true })
			.on('error', error => console.error(error))
			.on('data', row => plantData.push(row))
			.on('end', rowCount => resolve(plantData));
	});
}

function loadPlantDataTable(plantData, dateTime) {
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