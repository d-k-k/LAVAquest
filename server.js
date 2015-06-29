


//---------------------------------------------------------------------------Imports
var http 			= require('http');
var sys				= require('sys');
var path 			= require('path');
var fs 				= require('fs');
var json5        	= require('json5');            // JSON format that allows comments
var exec 			= require('child_process').exec;
var spawn 			= require('child_process').spawn;

var httpServer   	= require('./src/httpServer');
var WebSocketIO		= require('./src/wsio');
var utils			= require('./src/utils');
var levelControl	= require('./src/levelFunctions');

//---------------------------------------------------------------------------Variable setup
var debug 			= true;
var hostAddress		= "127.0.0.1";
var hostPort		= 9001;
var httpServerApp	= new httpServer("public");
var mainServer		= null;
var wsioServer		= null;
var clients			= [];
var clientData		= [];
var groundBlocks	= null;

//vars for mechanics.
var mapWidth		= 500; //hard coded for now and needs to be checked later
var mapHeight 		= 500;
var pxPerSecond		= 100;
var cSpriteWidth	= 32;
var cSpriteHeight	= 48;
var timeObject		= new Date();
var startTime 		= null;
var deltaTime		= null;


//node.js has a special variable called "global" which is visible throughout the other module files.
global.cSpriteWidth = cSpriteWidth;
global.cSpriteHeight = cSpriteHeight;





//-------------------------------------------------------------Code start

//create http listener
mainServer = http.createServer( httpServerApp.onrequest ).listen(hostPort);
console.log('Server listening to port:'+hostPort);

//create ws listener
wsioServer = new WebSocketIO.Server( { server: mainServer } );
wsioServer.onconnection(openWebSocketClient);

//create timer counter in global. 
global.timeCounter = 0;

//Create an recurring function call.
setInterval( function () {
		global.timeCounter++;
		console.log(global.timeCounter * 5);
	 }
	, 5000); 
startTime = timeObject.getTime();
deltaTime = 0;

//Call the mainUpdater function.
setInterval( mainUpdater, 20); //ms. 20 = 50fps.

groundBlocks = levelControl.generateLevel1Ground();


























//------------------------------------------------------------------------------------------------------------------
//From this point on are functions.
//------------------------------------------------------------------------------------------------------------------



//old function that was used to test global works.
global.printTimeCounter = function printTimeCounter (req) { console.log ( "Request at time:" + global.timeCounter ); }



//--------------------------------------------------------------------------- WebSocket(ws) related functions 


/*
Called whenever a connection is made.
This happens on first contact through webpage entry. Regardless of if the client sends a packet.
*/
function openWebSocketClient(wsio) {
	console.log( ">Connection from: " + wsio.id + " (" + wsio.clientType + " " + wsio.clientID+ ")");
	wsio.onclose(closeWebSocketClient);
	wsio.on('addClient', wsAddClient);
}


/*
Cleanup for when a connection closes.
This isn't complete.
TODO
*/
function closeWebSocketClient(wsio) {
	console.log( ">Disconnect" + wsio.id + " (" + wsio.clientType + " " + wsio.clientID+ ")");

	utils.removeArrayElement(clients, wsio);
} //end closeWebSocketClient




/*
Params
wsio is the websocket that was used.
data is the sent packet, usually in json format.
*/
function wsAddClient(wsio, data) {
	console.log('addClient packet received');

	clients.push(wsio);
	setupListeners(wsio);
	var newClientData = addClientData(wsio, data);
	wsio.emit('serverAccepted', {clientData: newClientData} );
	sendClientListUpdates(wsio, newClientData.cid, newClientData);

	wsio.emit('groundBlocks', { groundArray: groundBlocks });
}


function wsConsoleLog(wsio, data) {
	console.log('---wsConsoleLog:' + data.comment);

	//might want to write to a file as well later
} //end class

function wsClientSendKeyStatus(wsio, data) {
	//console.log( 'Server detected client key status sent ' + "moveHori(" + data.moveHori + ") moveVert(" + data.moveVert + ") pushStatus(" + data.pushStatus + ")");

	var cid = findClientDataIndexGivenWsio(wsio);

	if(cid < 0) { console.log('unknown wsio passing key status'); return; }


	//if doing a press
	if( data.pushStatus === 'press' ) {
		if(data.moveHori !== null ) { clientData[cid].moveHori = data.moveHori; }
		if(data.moveVert !== null ) { clientData[cid].moveVert = data.moveVert; }
	}
	else if ( data.pushStatus === 'release' ) {
		if(data.moveHori !== null ) { clientData[cid].moveHori = 'none'; }
		if(data.moveVert !== null ) { clientData[cid].moveVert = 'none'; }
	}
	else { console.log( 'unknown push status:' + data.pushStatus ); return; }

	var packetData = {
		cid: clientData[cid].cid,
		x: clientData[cid].x,
		y: clientData[cid].y,
		moveHori: clientData[cid].moveHori,
		moveVert: clientData[cid].moveVert
	}

	for(var i =0; i < clientData.length; i++) {
		clientData[i].wsio.emit( 'movementUpdate', packetData );
	}

	//if(debug) { console.log( 'sending packet for player' + packetData.cid + ' reset location:' + packetData.x + ',' + packetData.y + ' hori' + packetData.moveHori + ' vert' + packetData.moveVert);}

} //end class

























//---------------------------------------------------------------------------the mainUpdater function




function mainUpdater() {


	for(var i = 0; i < clientData.length; i++) {

		if ( clientData[i].moveHori === 'left' ) { clientData[i].x--; }
		else if  ( clientData[i].moveHori === 'right' ) { clientData[i].x++; }
		if  ( clientData[i].moveVert === 'up' ) { clientData[i].y--; }
		else if  ( clientData[i].moveVert === 'down' ) { clientData[i].y++; }

		if ( levelControl.checkIfEntityLeavingGround(clientData[i], groundBlocks) ) {

			if ( clientData[i].moveHori === 'left' ) { clientData[i].x++;  clientData[i].moveHori = 'none';}
			else if  ( clientData[i].moveHori === 'right' ) { clientData[i].x--;  clientData[i].moveHori = 'none';}
			if  ( clientData[i].moveVert === 'up' ) { clientData[i].y++;  clientData[i].moveVert = 'none'; }
			else if  ( clientData[i].moveVert === 'down' ) { clientData[i].y--;  clientData[i].moveVert = 'none'; }


			var packetData = {
				cid: clientData[i].cid,
				x: clientData[i].x,
				y: clientData[i].y,
				moveHori: clientData[i].moveHori,
				moveVert: clientData[i].moveVert
			}

			for(var j =0; j < clientData.length; j++) {
				clientData[j].wsio.emit( 'movementUpdate', packetData );
			}



		}

	}

} //end main updater

















//---------------------------------------------------------------------------Client data manipulation functions



/*
When receiving a packet of the named type, call the function.
*/
function setupListeners(wsio) {
	wsio.on('consoleLog',				wsConsoleLog);
	wsio.on('clientSendKeyStatus',		wsClientSendKeyStatus);
} //end setupListeners


function addClientData( wsio , data) {
	var newClientData = {
		wsio: wsio,
		cid: clientData.length,
		name: data.name,
		characterType: data.selection,
		hp: 100,
		maxHp: 100,
		x: mapWidth/2,
		y: mapHeight/2,
		moveHori: 'none',
		moveVert: 'none'
	};

	var reducedData = {
		cid: clientData.length,
		name: data.name,
		characterType: data.selection,
		hp: 100,
		maxHp: 100,
		x: mapWidth/2,
		y: mapHeight/2,
		moveHori: 'none',
		moveVert: 'none'
	};

	if(debug) {console.log('New entity starting at:' + reducedData.x + ',' + reducedData.y); }

	clientData.push(newClientData);

	return reducedData;
} //end


function findClientDataIndexGivenWsio(wsio) {
	for( var i = 0; i < clientData.length; i++ ) {
		if(clientData[i].wsio == wsio) {
			return i;
		}
	}
	return -1; //depending on where this is called, may error.
	console.log("Error could not find client data for given wsio");
} 

function sendClientListUpdates(wsio, passedId, reducedData) {
	console.log( 'Server preparing to send client list');

	var cid = findClientDataIndexGivenWsio(wsio);
	if(cid !== passedId) { console.log(); console.log('Error with id finder. checked values:' + cid + ',' + passedId); }

	if ( cid < 0 ) { console.log("unable to find client data"); }
	else {

		//send the new player updates to everyone else
		var fullUserList = [];
		var temp;

		for(var i = 0; i < clientData.length; i++) {
			if(i != cid) { clientData[i].wsio.emit( 'addUser', reducedData );
				temp =  {
					cid: clientData[i].cid,
					name: clientData[i].name,
					characterType: clientData[i].characterType,
					hp: clientData[i].hp,
					maxHp: clientData[i].maxHp,
					x: clientData[i].x,
					y: clientData[i].x,
					moveHori: clientData[i].moveHori,
					moveVert: clientData[i].moveVert
				};
				fullUserList.push(temp);
			}
		}

		//now send full user list to the new connected client
		wsio.emit( 'fullUserList', { array: fullUserList } );

		console.log('Finished sending new user packets.');


	} //if the client was validly adding their name


} //end sendClientListUpdates






