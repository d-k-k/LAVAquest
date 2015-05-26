



//---------------------------------------------------------------------------Variable setup
var wsio	= null;

var debug 	= true;
//---------------------------------------------------------------------------Code start



//---------------------------------------------------------------------------functions


/**
Setup of websockets.
 */
function initialize() {

	if(debug){console.log("Initializing client");}


	// Create a connection to server
	wsio = new WebsocketIO();
	if(debug){console.log("Websocket status:" + wsio);}
	wsio.open(function() {
		console.log("Websocket opened");

		setupListeners();

		var clientDescription = {
			clientType: "sageUI",
			requests: {
				config: true,
				version: false,
				time: false,
				console: false
			}
		};
		wsio.emit('addClient', clientDescription);
	});

	wsio.on('close', function (evt) {

	});

	//might want this to create listeners.
	// var sage2UI = document.getElementById('sage2UI');
	// window.addEventListener('drop',     preventDefault, false);
	// sage2UI.addEventListener('drop',      fileDrop,       false);
	// document.addEventListener('keydown',    noBackspace,  false);
} //end initialize






function setupListeners() {
	wsio.on('serverAccepted', function(data) {
		console.log('---Has been accepted by server---');
		console.dir(data);
	});

	wsio.on('serverPingBack', function(data) {
		console.log('Recieved a ping back from the server');
		console.dir(data);
	});
}