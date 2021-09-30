$(document).ready(async function() {
	appStartUp();
});

async function appStartUp() {
	const fs = require('fs');
	// Check if database exists.
	if (fs.existsSync("./database/db.json")) {
		await mainMenuStartUp();
		await setWelcomeMsgName();
	} else {
		// Fresh install, go to login and set up files.
/*  		const dbStore = new Store();
/*		var mybase = new alasql.Database();
		mybase.exec('CREATE TABLE User (Email TEXT UNIQUE, Password TEXT, User_ID INTEGER AUTO_INCREMENT, PRIMARY KEY(User_ID))');
		mybase.exec('INSERT INTO User (Email, Password) VALUES ("***REMOVED***", "***REMOVED***");');
		mybase.exec('INSERT INTO User (Email, Password) VALUES ("notjon@email.com", "***REMOVED***");');
		var results = mybase.exec("SELECT * FROM User");
		console.log(results);
		dbStore.set('UserDb', results);
		console.log(dbStore.get('UserDb'));
 		var storedDb = dbStore.get('UserDb');
		console.log(storedDb);
/* 		var testDb = new alasql.Database();
		testDb.exec('CREATE TABLE User; SELECT * INTO User FROM JSON(' + storedDb + ')');
		var results = testDb.exec("SELECT * FROM User"); 
		console.log(results); 

		var results = alasql('SELECT User_ID, COUNT(*) AS Email FROM ? GROUP BY User_ID',[storedDb]);
		console.log(results); */

		/* This also works?
		var myDb = new alasql.Database();
		myDb.exec('CREATE TABLE User (Email TEXT UNIQUE, Password TEXT, User_ID INTEGER AUTO_INCREMENT, PRIMARY KEY(User_ID))');
		myDb.exec('INSERT INTO User (Email, Password) VALUES ("***REMOVED***", "***REMOVED***");');
		myDb.exec('INSERT INTO User (Email, Password) VALUES ("notjon@email.com", "***REMOVED***");');

		var results = myDb.exec("SELECT * FROM User");
		alasql.promise('SELECT * INTO CSV("test.csv", {headers:true}) FROM ?',[results])
			.then(function(){
				console.log('Data saved');
			}).catch(function(err){
				console.log('Error:', err);
			});;

		 */
		
/* 		 // This section works??
		alasql.promise('SELECT * FROM CSV("test.csv", {headers:true}) WHERE Email="***REMOVED***"')
			.then(function(data){
					console.log('SQL Statement: SELECT * FROM User WHERE Email="***REMOVED***"');
					console.log("Results:");
					console.log(data); 
			}).catch(function(err){
					console.log('Error:', err);
			}); */

	
		await getDbTable();
		await addDbUser();
		await updateDbTableCSV();
		
/* 		var usersTable = alasql("SELECT * FROM User");
		alasql.promise('SELECT * INTO CSV("test.csv", {headers:true}) FROM ?',[usersTable])
			.then(function(){
				console.log('Data saved');
			}).catch(function(err){
				console.log('Error:', err);
			});; */

		
/* 		var testDb = new alasql.Database();
		testDb.exec('CREATE TABLE User (Email TEXT UNIQUE, Password TEXT, User_ID INTEGER AUTO_INCREMENT, PRIMARY KEY(User_ID)); SELECT * INTO User FROM CSV("test.csv")');
		console.log('SQL Statement: SELECT * FROM User WHERE User_ID="***REMOVED***"')
		var results = testDb.exec('SELECT * FROM User WHERE User_ID="***REMOVED***"'); 
		console.log("Results:");
		console.log(results); */
	}
}

function getDbTable() {
	return new Promise((resolve, reject) => {
		alasql.promise([
			'CREATE TABLE User (Email TEXT UNIQUE, Password TEXT, User_ID INTEGER, PRIMARY KEY(User_ID))',
			'SELECT * INTO User FROM CSV("test.csv", {headers:true})'
		])
			.then(function(data){
				console.log(data);
				resolve();
			}).catch(function(err){
				console.log('Error:', err);
			});
	});
}

function updateDbTableCSV() {
	return new Promise((resolve, reject) => {
		var table = alasql("SELECT * FROM User");
		alasql.promise('SELECT * INTO CSV("test.csv", {headers:true}) FROM ?',[table])
			.then(function(){
				console.log('Data saved');
				resolve();
			}).catch(function(err){
				console.log('Error:', err);
			});;
	});
}

function addDbUser() {
	return new Promise((resolve, reject) => {
		alasql.promise('SELECT * FROM User ORDER BY User_ID DESC LIMIT 1')
			.then(function(data){
				console.log(data);
				var latestUserID = data[0].User_ID;
				alasql('INSERT INTO User (Email, Password, User_ID) VALUES ("thirdjon@3mail.com", "***REMOVED***", '+ (latestUserID + 1) +');');
				console.log(alasql("SELECT * FROM User"));
				resolve();
			}).catch(function(err){
				console.log('Error:', err);
			});
	});
}

function mainMenuStartUp() {
	return new Promise((resolve, reject) => {
		// Check if a session token was passed from the previous page.
		sessionToken = window.location.hash.substring(1);

		if (sessionToken == null || sessionToken == "" || sessionToken == "undefined") {
			// If none found, generate new one.
			// Check which user was last logged in.
			lastLoggedInUserID = localStorage.getItem('lastLoginUserID');

			// Get the user's credentials from db, using the user ID.
			// For testing purposes, these are hard coded as Jonathon's.
			let emailAdd = "***REMOVED***",
			password = "***REMOVED***";

			// Generate a session token for this user with the API.
			var settings = {
				"url": "https://my.farmbot.io/api/tokens",
				"method": "POST",
				"timeout": 0,
				"headers": {
					"content-type": "application/json"
				},
				"data": JSON.stringify({
					"user": {
						"email": emailAdd,
						"password": password
					}
				}),
			};
			$.ajax(settings).done(function (response) {
				sessionToken = response.token.encoded;
				console.log("Session token generated: " + sessionToken);
			}).then(function(response){
				resolve(response);
			});
		} else {
			setWelcomeMsgName();
		}
	});
}

function setWelcomeMsgName() {
	return new Promise((resolve, reject) => {
		var settings = {
			"url": "https://my.farmbot.io/api/users",
			"method": "GET",
			"timeout": 0,
			"headers": {
				"Authorization": "Bearer " + sessionToken,
				"Access-Control-Allow-Origin": "*",
				"Content-Type": "application/json"
			},
		};

		$.ajax(settings).done(function (response) {
			document.getElementById("welcome-msg").innerHTML = "Hi, " + response[0].name;
		}).then(function(response){
			resolve(response);
		});
	});
}
