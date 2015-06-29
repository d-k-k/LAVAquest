



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

} //end initialize


/*
Used on connection to server to get the name submitted by user.
*/
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


/*
Used on connection to server to get the char selected by user.
*/
function getCharacterSelection() {
	var workingDiv = document.getElementById('fSelect');
	if(workingDiv.style.border !== 'none') { return 1; }

	workingDiv = document.getElementById('mSelect');
	if(workingDiv.style.border !== 'none') { return 2; }

	//else 
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
	wsio.on('groundBlocks', 	wsGroundBlocks );
	wsio.on('movementUpdate', 	wsMovementUpdate);


} //end setupListeners

function wsAddUser(data) {
	console.log("Got add user packet");
	console.log('--Name:' + data.name + '. x:' + data.x + '. y:' + data.y + '. moveHori:' + data.moveHori+ '. moveVert:' + data.moveVert );

	allWsClients.push(data);

	addOtherClientAvatar(data);

}

function wsFullUserList(data) {

	console.log("Got full user list packet. status of data:" + data);
	console.dir(data);

	//data has .array containing all other clients.
	for(var i = 0; i < data.array.length; i++) {
		allWsClients.push( data.array[i] );
		addOtherClientAvatar( data.array[i] );
		console.log('--Name:' + data.array[i].name + '. x:' + data.array[i].x + '. y:' + data.array[i].y + '. moveHori:' + data.array[i].moveHori+ '. moveVert:' + data.array[i].moveVert );
	}
}


function wsGroundBlocks(data) {

	if(debug) {
		console.log("Generating ground blocks:");
		for(var i = 0; i < data.groundArray.length; i++) {
			console.log( data.groundArray[i].cx + ',' +  data.groundArray[i].cy + ' center with dimensions: ' + data.groundArray[i].width + ',' + data.groundArray[i].height);
		}
	} //end debug output

	createGroundTiles(data.groundArray);
}


function wsMovementUpdate(data) {
	// if(debug){console.log("Movement update packet");}

	// if(debug){
	// 	console.log('stage:' + stage);
	// 	console.log();
	// }

	for(var i = 0; i < allWsClients.length; i++) {
		if(allWsClients[i].cid === data.cid) {
			allWsClients[i].x = data.x;
			allWsClients[i].y = data.y;
			allWsClients[i].moveHori = data.moveHori;
			allWsClients[i].moveVert = data.moveVert;

			//reducing down to one update to lower resource consumption. Maybe should focus on functionality rather than efficiency.
			repositionOneEntityCorrectly( allWsClients[i] );
			//repositionAllEntitiesCorrectly();

			return;
		}
	}

	console.log('Error unknown CID of data for movement');

}

