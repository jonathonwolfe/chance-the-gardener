var TOKEN = "***REMOVED***";
		
function takePhoto() {
  var farmbot123 = new fbjs.Farmbot({ token: TOKEN });

  farmbot123
  .connect()
  .then(function () {
	return farmbot123.takePhoto({});
  });
}

function toggleLight() {
  var farmbot123 = new fbjs.Farmbot({ token: TOKEN });

  farmbot123
  .connect()
  .then(function () {
	return farmbot123.togglePin({ pin_number: 7 });
  });
}

function myFunction(xx,yy,zz) {
  var farmbot123 = new fbjs.Farmbot({ token: TOKEN });

  farmbot123
  .connect()
  .then(function () {
	return farmbot123.moveAbsolute({ x: xx, y: yy, z: zz, speed: 100 });
  });
}

function sendLogMessage() {
  var farmbot123 = new fbjs.Farmbot({ token: TOKEN });

  farmbot123
  .connect()
  .then(function () {
	return farmbot123.sendMessage("info", "Hello, this is Jessica testing the logs through the JS API");

  });
}