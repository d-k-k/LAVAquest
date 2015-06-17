



//---------------------------------------------------------------------------Variable setup
var wsio 			= null;
var debug			= true;
var allWsClients	= [];

//---------------------------------------------------------------------------Code start



//--------------------------------------------------------------------------- startup functions


/**
Setup of websockets.
 */
function initializeWS() {
	if(debug){console.log("Initializing client");}

	// Create a connection to server
	wsio = new WebsocketIO();
	if(debug){console.log("Websocket status:" + wsio);}
	wsio.open(function() {
		console.log("Websocket opened");

		setupListeners();

		var clientDescription = {
			name: getInputName(),
			selection: getCharacterSelection(),
			clientType: "client"
		};

		console.log('Packet addClient being sent:');
		console.dir( clientDescription );
		wsio.emit('addClient', clientDescription);


		initializeKineticStage();
	});

	wsio.on('close', function (evt) {
		alert('Lost connection');
	});


	setInterval( mainUpdater, 20); //ms 20 = 50fps


	//might want this to create listeners.
	// var sage2UI = document.getElementById('sage2UI');
	// window.addEventListener('drop',     preventDefault, false);
	// sage2UI.addEventListener('drop',      fileDrop,       false);
	// document.addEventListener('keydown',    noBackspace,  false);
} //end initialize


function getInputName() {

	var inputName = document.getElementById('inputName').value;

	inputName = inputName.trim();

	if ( inputName.length <= 2 ) {
		if(inputName.length > 0) { inputName = 'User ' + inputName; }
		else { inputName = 'Blank User'; }
	}
	else if(inputName.length > 8) {  inputName = inputName.substring(0,8); }

	return inputName;
} //end getInputName


function getCharacterSelection() {
	var workingDiv = document.getElementById('fSelect');
	if(workingDiv.style.border !== 'none') { return 1; }

	workingDiv = document.getElementById('mSelect');
	if(workingDiv.style.border !== 'none') { return 2; }

	// workingDiv = document.getElementById('sSelect');
	// if(workingDiv.style.border !== 'none') { return 3; }
	return 3;

} //end getCharacterSelection



//--------------------------------------------------------------------------- wsio functions



function setupListeners() {
	wsio.on('serverAccepted', function(data) {
		console.log('---Has been accepted by server---');
		console.dir(data.clientData);

		allWsClients.push(data.clientData);
		
		addThisClientAvatar(data.clientData);

	});

	wsio.on('serverPingBack', function(data) {
		console.log('Recieved a ping back from the server');
		console.dir(data);
	});

	wsio.on('addUser', 			wsAddUser );
	wsio.on('fullUserList', 	wsFullUserList );
	wsio.on('movementUpdate', 	wsMovementUpdate);


} //end setupListeners

function wsAddUser(data) {
	console.log("Got add user packet");
	console.log('--Name:' + data.name + '. x:' + data.x + '. y:' + data.y + '. moveHori:' + data.moveHori+ '. moveVert:' + data.moveVert );

	allWsClients.push(userEntry);

	addOtherClientAvatar(data);

}

function wsFullUserList(data) {

	console.log("Got full user list packet. status of data:" + data);

	//data has .array containing all other clients.
	for(var i = 0; i < data.array.length; i++) {
		allWsClients.push( data.array[i] );
		addOtherClientAvatar( data.array[i] );
		console.log('--Name:' + data.array[i].name + '. x:' + data.array[i].x + '. y:' + data.array[i].y + '. moveHori:' + data.array[i].moveHori+ '. moveVert:' + data.array[i].moveVert );
	}
}

function wsMovementUpdate(data) {


	for(var i = 0; i < allWsClients.length; i++) {
		if(allWsClients[i].cid === data.cid) {
			allWsClients[i].x = data.x;
			allWsClients[i].y = data.y;
			allWsClients[i].moveHori = data.moveHori;
			allWsClients[i].moveVert = data.moveVert;
			return;
		}
	}

	console.log('Error unknown CID of data for movement');

}

//--------------------------------------------------------------------------- main updater functions


function mainUpdater() {

	for(var i = 0; i < allWsClients.length; i++) {

		var xdiff = 0, ydiff = 0;

		if ( allWsClients[i].moveHori === 'left' ) { allWsClients[i].x--;  xdiff = -1;}
		else if  ( allWsClients[i].moveHori === 'right' ) { allWsClients[i].x++; xdiff = 1;}
		if  ( allWsClients[i].moveVert === 'up' ) { allWsClients[i].y--; ydiff = -1;}
		else if  ( allWsClients[i].moveVert === 'down' ) { allWsClients[i].y++; ydiff = 1;}

		givenWsDataShiftBySpecifiedAmount( allWsClients[i], xdiff, ydiff );

	}

} //end main updater



//---------------------------------------------------------------------------functions


function keyDownHandler(event) {
	if (event.target === document.getElementById('sessionValue') &&
		(event.keyCode === 13 || event.which === 13) )
	{
		sendServerName();
	}
	else if( stage2GotList ) {
		var keyData = { moveHori:null, moveVert:null, pushStatus: 'press' } ;
		var shouldSend = false;

		//console.log('Keypress:' + event.keyCode);


		if (event.keyCode === 87 || event.which === 87) { keyData.moveVert = 'up'; shouldSend = true; } //w
		else if (event.keyCode === 65 || event.which === 65) { keyData.moveHori = 'left'; shouldSend = true; } //a
		else if (event.keyCode === 83 || event.which === 83) { keyData.moveVert = 'down'; shouldSend = true; } //s
		else if (event.keyCode === 68 || event.which === 68) { keyData.moveHori = 'right'; shouldSend = true; } //d

		if(shouldSend) {
			wsio.emit('clientSendKeyStatus', keyData);
		}

	} //end check for key press on direction control

} //end keyDownHandler


function keyUpHandler(event) {

	if( stage2GotList ) {
		var keyData = { moveHori:null, moveVert:null, pushStatus: 'release' } ;
		var shouldSend = false;

		//console.log('Keypress:' + event.keyCode);


		if (event.keyCode === 87 || event.which === 87) { keyData.moveVert = 'up'; shouldSend = true; } //w
		else if (event.keyCode === 65 || event.which === 65) { keyData.moveHori = 'left'; shouldSend = true; } //a
		else if (event.keyCode === 83 || event.which === 83) { keyData.moveVert = 'down'; shouldSend = true; } //s
		else if (event.keyCode === 68 || event.which === 68) { keyData.moveHori = 'right'; shouldSend = true; } //d

		if(shouldSend) {
			wsio.emit('clientSendKeyStatus', keyData);
		}

	} //end check for key press on direction control

} //end keyDownHandler


function showField(data) {

	var workingDiv = document.getElementById('inputName');
	workingDiv.style.visibility = 'hidden';
	workingDiv.style.top = -1000;
	workingDiv.style.left = -1000;
	workingDiv = document.getElementById('inputMessageLength');
	workingDiv.style.visibility = 'hidden';

	for( var i = 0; i < data.array.length; i++ ) {
		addUserToField(data.array[i]);
	}

} //end showField



//obsolete because using kinetic adder now

// function addUserToField(data) {

// 		var userDiv, textSpan;

// 		document.body.innerHTML += '<div id="' + data.name + ':' + data.cid + '"></div>';
// 		workingDiv = document.getElementById(data.name + ':' + data.cid);
// 		workingDiv.style.position = 'absolute';
// 		workingDiv.style.border = '1px solid black';
// 		workingDiv.style.width = '20px';
// 		workingDiv.style.height = '20px';
// 		workingDiv.style.top = parseInt(data.y) - parseInt(workingDiv.style.width) /2 + 'px';
// 		workingDiv.style.left = parseInt(data.x) - parseInt(workingDiv.style.height) /2 + 'px';

// 		workingDiv.innerHTML +=  '<span id="' +  data.name + ':' + data.cid + ':text"></div>';
// 		textSpan = document.getElementById( data.name + ':' + data.cid + ':text' );
// 		textSpan.id = data.name + ':' + data.cid + ":text";
// 		textSpan.innerHTML =  data.name;
// 		textSpan.style.position = 'absolute';
// 		textSpan.style.top =  parseInt(workingDiv.style.height) + 5  + 'px';
// 		textSpan.style.left = parseInt(workingDiv.style.width)/2 - parseInt(textSpan.style.width)/2 + 'px';

// }

