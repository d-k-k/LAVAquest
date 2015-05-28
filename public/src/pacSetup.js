



//---------------------------------------------------------------------------Variable setup
var wsio 			= null;
var debug			= true;
var stage1SentName 	= false;
var stage2GotList	= false;

var allClients		= [];

//---------------------------------------------------------------------------Code start



//--------------------------------------------------------------------------- startup functions


/**
Setup of websockets.
 */
function initialize() {

	if(debug){console.log("Initializing client");}

	document.addEventListener('keydown', keyDownHandler, false);
	document.addEventListener('keyup', keyUpHandler, false);

	// Create a connection to server
	wsio = new WebsocketIO();
	if(debug){console.log("Websocket status:" + wsio);}
	wsio.open(function() {
		console.log("Websocket opened");

		setupListeners();

		var clientDescription = {
			clientType: "client"
		};
		wsio.emit('addClient', clientDescription);
	});

	wsio.on('close', function (evt) {

	});


	setInterval( mainUpdater, 20);

	//might want this to create listeners.
	// var sage2UI = document.getElementById('sage2UI');
	// window.addEventListener('drop',     preventDefault, false);
	// sage2UI.addEventListener('drop',      fileDrop,       false);
	// document.addEventListener('keydown',    noBackspace,  false);
} //end initialize




//--------------------------------------------------------------------------- wsio functions



function setupListeners() {
	wsio.on('serverAccepted', function(data) {
		console.log('---Has been accepted by server---');
		console.dir(data);
		document.getElementById('startLoad').style.visibility = 'hidden';
		document.getElementById('inputName').style.visibility = 'visible';
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

	userEntry = {
		topId : data.name + ':' + data.cid,
		textId : data.name + ':' + data.cid + ":text",
		cid : data.cid, 
		name : data.name,
		moveHori : data.moveHori,
		moveVert : data.moveVert
	}

	allClients.push(userEntry);

	addUserToField(data);

}

function wsFullUserList(data) {

	console.log("Got full user list packet. status of data:" + data);
	
	var userEntry;

	for( var i = 0; i < data.array.length; i++ ) {
		userEntry = {
			topId : data.array[i].name + ':' + data.array[i].cid,
			textId : data.array[i].name + ':' + data.array[i].cid + ":text",
			cid : data.array[i].cid, 
			name : data.array[i].name,
			moveHori : data.array[i].moveHori,
			moveVert : data.array[i].moveVert
		}

		allClients.push(userEntry);

		console.log('--Name:' + data.array[i].name + '. x:' + data.array[i].x + '. y:' + data.array[i].y + '. moveHori:' + data.array[i].moveHori+ '. moveVert:' + data.array[i].moveVert );
	}

	stage2GotList = true;

	showField(data);

}

function wsMovementUpdate(data) {


	for(var i = 0; i < allClients.length; i++) {
		if(allClients[i].cid === data.cid) {
			allClients[i].x = data.x;
			allClients[i].y = data.y;
			allClients[i].moveHori = data.moveHori;
			allClients[i].moveVert = data.moveVert;
			return;
		}
	}

	console.log('Error unknown CID of data for movement');

}

//--------------------------------------------------------------------------- main updater functions


function mainUpdater() {

	var workingDiv;

	for(var i = 0; i < allClients.length; i++) {

		if ( allClients[i].moveHori === 'left' ) { allClients[i].x--; }
		else if  ( allClients[i].moveHori === 'right' ) { allClients[i].x++; }
		if  ( allClients[i].moveVert === 'up' ) { allClients[i].y--; }
		else if  ( allClients[i].moveVert === 'down' ) { allClients[i].y++; }

		workingDiv = document.getElementById( allClients[i].topId );
		if(workingDiv != null) { 
			workingDiv.style.left = allClients[i].x - parseInt( workingDiv.style.width ) /2 + 'px';
			workingDiv.style.top = allClients[i].y - parseInt( workingDiv.style.height ) /2 + 'px';
		}
	}

} //end main updater



//---------------------------------------------------------------------------functions

function sendServerName() {
	console.log('Client sending name');
	var inputName = document.getElementById('sessionValue').value;
	if ( inputName.trim().length <= 2 || stage1SentName ) {
		document.getElementById('inputMessageLength').style.visibility = 'visible'; 
	}
	else { 
		//clientSendName
		wsio.emit( 'clientSendName' , { name:  inputName.trim() } );
		stage1SentName = true;


	}
}


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

function addUserToField(data) {

		var userDiv, textSpan;

		document.body.innerHTML += '<div id="' + data.name + ':' + data.cid + '"></div>';
		workingDiv = document.getElementById(data.name + ':' + data.cid);
		workingDiv.style.position = 'absolute';
		workingDiv.style.border = '1px solid black';
		workingDiv.style.width = '20px';
		workingDiv.style.height = '20px';
		workingDiv.style.top = parseInt(data.y) - parseInt(workingDiv.style.width) /2 + 'px';
		workingDiv.style.left = parseInt(data.x) - parseInt(workingDiv.style.height) /2 + 'px';

		workingDiv.innerHTML +=  '<span id="' +  data.name + ':' + data.cid + ':text"></div>';
		textSpan = document.getElementById( data.name + ':' + data.cid + ':text' );
		textSpan.id = data.name + ':' + data.cid + ":text";
		textSpan.innerHTML =  data.name;
		textSpan.style.position = 'absolute';
		textSpan.style.top =  parseInt(workingDiv.style.height) + 5  + 'px';
		textSpan.style.left = parseInt(workingDiv.style.width)/2 - parseInt(textSpan.style.width)/2 + 'px';

}

