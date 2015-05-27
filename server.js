


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

//---------------------------------------------------------------------------Variable setup
var hostAddress		= "127.0.0.1";
var hostPort		= 9001;
var httpServerApp	= new httpServer("public");
var mainServer		= null;
var wsioServer		= null;
var clients			= [];
var clientData		= [];

//vars for mechanics.
var mapWidth		= 600; //hard coded for now and needs to be checked later
var mapHeight 		= 600;
var pxPerSecond		= 100;
var timeObject		= new Date();
var startTime 		= null;
var deltaTime		= null;



//node.js has a special variable called "global" which is visible throughout the other files.


//---------------------------------------------------------------------------Code start

//create http listener

mainServer = http.createServer( httpServerApp.onrequest ).listen(hostPort);
console.log('Server listening to port:'+hostPort);


//create ws listener
wsioServer = new WebSocketIO.Server( { server: mainServer } );
wsioServer.onconnection(openWebSocketClient);

//create timer counter in global. 
global.timeCounter = 0;

//Test to create something that happens at an interval
setInterval( function () {
		global.timeCounter++;
		console.log(global.timeCounter * 5);

	}
	, 5000);



//
startTime = timeObject.getTime();
deltaTime = 0;

setInterval( mainUpdater, 20);




//---------------------------------------------------------------------------Function definitions


global.printTimeCounter = function printTimeCounter (req) {
	console.log ( "Request at time:" + global.timeCounter );
	//console.log ( req );
}


function openWebSocketClient(wsio) {
	console.log( ">Connection from: " + wsio.id + " (" + wsio.clientType + " " + wsio.clientID+ ")");
	wsio.onclose(closeWebSocketClient);
	wsio.on('addClient', wsAddClient);
}



function closeWebSocketClient(wsio) {
	console.log( ">Disconnect" + wsio.id + " (" + wsio.clientType + " " + wsio.clientID+ ")");

	removeElement(clients, wsio);
} //end closeWebSocketClient


/*
Params
wsio is the websocket that was used.
data is the sent packet, usually in json format.
*/
function wsAddClient(wsio, data) {

	clients.push(wsio);
	setupListeners(wsio);
	addClientData(wsio);

	wsio.emit('serverAccepted', {} );
}

/*
When receiving a packet of the named type, call the function.
*/
function setupListeners(wsio) {
	
	wsio.on('ping',						wsPing);
	wsio.on('consoleLog',				wsConsoleLog);
	wsio.on('clientSendName',			wsClientSendName);
	wsio.on('clientSendKeyStatus',		wsClientSendKeyStatus);

} //end setupListeners



function executeConsoleCommand( cmd ) {
	var child;
	child = exec(cmd, function (error, stdout, stderr) {
		sys.print('stdout: ' + stdout);
		sys.print('stderr: ' + stderr);
		if (error !== null) {
			console.log('Command> exec error: ' + error);
		}
	});
}

function executeScriptFile( file ) {

	output = "";

    file = path.normalize(file); // convert Unix notation to windows
    console.log('Launching script ', file);

    var proc = spawn(file, []);

    proc.stdout.on('data', function (data) {
            console.log('stdout: ' + data);
            output = output + data;
    });
    proc.stderr.on('data', function (data) {
            console.log('stderr: ' + data);
    });
    proc.on('exit', function (code) {
        console.log('child process exited with code ' + code);
        //if (socket) socket.emit('return', {status: true, stdout: output});
    });



    console.log("Setting up delayed process kill");

    setTimeout( function(){ proc.kill(); console.log("\nKilling process"); }, 6000);



    return proc;
}



function mainUpdater() {

	for(var i = 0; i < clientData.length; i++) {

		if ( clientData[i].moveHori === 'left' ) { clientData[i].x--; }
		else if  ( clientData[i].moveHori === 'right' ) { clientData[i].x++; }
		if  ( clientData[i].moveVert === 'up' ) { clientData[i].y--; }
		else if  ( clientData[i].moveVert === 'down' ) { clientData[i].y++; }

	}

} //end main updater


//---------------------------------------------------------------------------websocket listener functions


function wsPing(wsio, data) {
	console.log('---wsPing:' + data.time);
	wsio.emit('serverPingBack', data);
} //end class


function wsConsoleLog(wsio, data) {
	console.log('---wsConsoleLog:' + data.comment);
	//executeConsoleCommand( "echo wsConsoleLog activating executeConsoleCommand" );
	
	//executeConsoleCommand( "open -a TextEdit.app" );

	executeScriptFile( "script/testScript" );
} //end class


function wsClientSendName(wsio, data) {
	console.log( 'Server detected client name sent:' + data.name );

	var cdi = findClientDataIndexGivenWsio(wsio);

	if ( cdi < 0 ) { console.log("unable to find client data"); }
	else {
		clientData[cdi].name = data.name;
		console.log( 'Setting name to:' + clientData[cdi].name );



		//send the new player updates to everyone else
		var nud = {
			name: clientData[cdi].name,
			cid: clientData[cdi].cid,
			x: clientData[cdi].x,
			y: clientData[cdi].y,
			moveHori: clientData[cdi].moveHori,
			moveVert: clientData[cdi].moveVert
		};
		var fullUserList = [];
		var temp;

		for(var i = 0; i < clientData.length; i++) {
			if(i != cdi) {
				clientData[i].wsio.emit( 'addUser', nud );
			}

			temp = {
				name: clientData[i].name,
				cid: clientData[i].cid,
				x: clientData[i].x,
				y: clientData[i].y,
				moveHori: clientData[i].moveHori,
				moveVert: clientData[i].moveVert
			};
			fullUserList.push(temp);
		}

		//now send full user list to the new connected client
		wsio.emit( 'fullUserList', { array: fullUserList } );

		console.log('Finished sending new user packets.');


	} //if the client was validly adding their name


} //end class


function wsClientSendKeyStatus(wsio, data) {
	//console.log( 'Server detected client key status sent ' + "moveHori(" + data.moveHori + ") moveVert(" + data.moveVert + ") pushStatus(" + data.pushStatus + ")");

	var cdi = findClientDataIndexGivenWsio(wsio);

	if(cdi < 0) { console.log('unknown wsio passing key status'); return; }


	//if doing a press
	if( data.pushStatus === 'press' ) {
		if(data.moveHori !== null ) { clientData[cdi].moveHori = data.moveHori; }
		if(data.moveVert !== null ) { clientData[cdi].moveVert = data.moveVert; }
	}
	else if ( data.pushStatus === 'release' ) {
		if(data.moveHori !== null ) { clientData[cdi].moveHori = 'none'; }
		if(data.moveVert !== null ) { clientData[cdi].moveVert = 'none'; }
	}
	else { console.log( 'unknown push status:' + data.pushStatus ); return; }

	var packetData = {
		cid: clientData[cdi].cid,
		name: clientData[cdi].name,
		x: clientData[cdi].x,
		y: clientData[cdi].y,
		moveHori: clientData[cdi].moveHori,
		moveVert: clientData[cdi].moveVert
	}

	for(var i =0; i < clientData.length; i++) {
		clientData[i].wsio.emit( 'movementUpdate', packetData );
	}


} //end class




//---------------------------------------------------------------------------Client data manipulation functions

function addClientData( wsio ) {
	var ncd = {
		wsio: wsio,
		cid: clientData.length,
		name: "unknown",
		x: mapWidth/2,
		y: mapHeight/2,
		moveHori: 'none',
		moveVert: 'none'
	};
	clientData.push(ncd);
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


//---------------------------------------------------------------------------Utility functions



function removeElement(list, elem) {
	if(list.indexOf(elem) >= 0){
		moveElementToEnd(list, elem);
		list.pop();
	}
}

function moveElementToEnd(list, elem) {
	var i;
	var pos = list.indexOf(elem);
	if(pos < 0) return;
	for(i=pos; i<list.length-1; i++){
		list[i] = list[i+1];
	}
	list[list.length-1] = elem;
}
