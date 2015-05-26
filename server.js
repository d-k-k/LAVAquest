


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



//testing file read
var confContents = fs.readFileSync( "conf/cfg.json", "utf8" );
console.log("Read file:");
console.log(confContents);

var confJson = json5.parse(confContents);

console.log(confJson);
console.dir(confJson);

var constantContents = fs.readFileSync( "public/src/constants.js", "utf8" );

console.log( constantContents );

var constantJson = json5.parse(constantContents);


console.log( constantJson );
console.dir( constantJson );




//---------------------------------------------------------------------------Function definitions


global.printTimeCounter = function printTimeCounter (req) {
	console.log ( "Request at time:" + global.timeCounter );
	//console.log ( req );
}


function openWebSocketClient(wsio) {
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

	wsio.emit('serverAccepted', {} );
}

/*
When receiving a packet of the named type, call the function.
*/
function setupListeners(wsio) {
	
	wsio.on('ping',            wsPing);
	wsio.on('consoleLog',      wsConsoleLog);

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
