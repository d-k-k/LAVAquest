
/*

Updaters at the top of the file.

key bind and handler at bottom of file.

*/



//--------------------------------------------------------------------------- main updater functions


function mainUpdater() {

	switch(gameState) {
		case cGsInWorld:
			updateMoveAllEntities();
		break;

		default:
		console.log('Error unknown gameState:' + gameState);
		break;

	} //end switch


} //end main updater


//--------------------------------------------------------------------------- updateMoveAllEntities

function updateMoveAllEntities() {

	for(var i = 0; i < allWsClients.length; i++) {

		var xdiff = 0, ydiff = 0;

		if ( allWsClients[i].moveHori === 'left' ) { allWsClients[i].x--;  xdiff = -1;}
		else if  ( allWsClients[i].moveHori === 'right' ) { allWsClients[i].x++; xdiff = 1;}
		if  ( allWsClients[i].moveVert === 'up' ) { allWsClients[i].y--; ydiff = -1;}
		else if  ( allWsClients[i].moveVert === 'down' ) { allWsClients[i].y++; ydiff = 1;}


		givenWsDataShiftBySpecifiedAmount( allWsClients[i], xdiff, ydiff );

	}

	if(stage !== null) { stage.draw(); }

} //end updateMoveAllEntities














































//--------------------------------------------------------------------------- bindControls()


function bindControls() {
	document.addEventListener('keydown', handleKeyDown);
	document.addEventListener('keyup', handleKeyUp);
	document.addEventListener('click', handleClick);

	//correctly route right clicks to handler.
	window.oncontextmenu = function (e) { handleClick(e); return false; }

} //end bindControls


//--------------------------------------------------------------------------- handleKeyDown

function handleKeyDown(event) {

	switch(interactionState) {
		case cIsMap:
			interactionMapHandleKeyDown();
		break;
		case cIsMenu:
			interactionMenuHandleKeyDown();
		default:
		console.log('Error: unknown interactionState');
	}

} //end handleKeyDown

function interactionMapHandleKeyDown() {

	//if(debug) { console.log('keydown from:' + event.type + '(' + event.key + ')'+ '(' + event.char + ')'+ '(' + event.charCode + ')'+ '(' + event.keyCode + ')' + '(' + event.location + ')') ; }

	//currently the packet will cause an over write because it doesn't include a value for the opposite, meaning it will be undefined rather than null

	switch(event.keyCode){
		//	w the key. case doesn't matter since it uses the key code.
		case 87:
			wsio.emit('clientSendKeyStatus', {pushStatus: 'press', moveVert:'up'});
			break;
		//	a
		case 65:
			wsio.emit('clientSendKeyStatus', {pushStatus: 'press', moveHori:'left'});
			break;
		//	s
		case 83:
			wsio.emit('clientSendKeyStatus', {pushStatus: 'press', moveVert:'down'});
			break;
		//	d
		case 68:
			wsio.emit('clientSendKeyStatus', {pushStatus: 'press', moveHori:'right'});
			break;

		//p - debug activator
		case 80:
			thisClientKgr.showDebugVisuals = !(thisClientKgr.showDebugVisuals);
			thisClientKgr.kDebugCanvasCoordinates.visible(thisClientKgr.showDebugVisuals);
			thisClientKgr.kDebugWsCoordinates.visible(thisClientKgr.showDebugVisuals);
			console.log('Debug visuals:' + thisClientKgr.showDebugVisuals);
			break;
	} //end switch keyCode

}// end interactionMapHandleKeyDown


function interactionMenuHandleKeyDown() {
	console.log('Currently interactionMenuHandleKeyDown is not implemented.');
}

//--------------------------------------------------------------------------- handleKeyUp

function handleKeyUp(event) {

	//if(debug) { console.log('keyUp from:' + event.type + '(' + event.key + ')'+ '(' + event.char + ')'+ '(' + event.charCode + ')'+ '(' + event.keyCode + ')' + '(' + event.location + ')') ; }

	switch(interactionState) {
		case cIsMap:
			interactionMapHandleKeyUp();
		break;
		case cIsMenu:
			interactionMenuHandleKeyUp();
		default:
		console.log('Error: unknown interactionState');
	}


} //end handleKeyUp

function interactionMapHandleKeyUp() {

	switch(event.keyCode){
		case 87: //	w 
			wsio.emit('clientSendKeyStatus', {pushStatus: 'release', moveVert:'up'});
			break;
		case 65: //a
			wsio.emit('clientSendKeyStatus', {pushStatus: 'release', moveVert:'left'});
			break;
		case 83: //s
			wsio.emit('clientSendKeyStatus', {pushStatus: 'release', moveVert:'down'});
			break;
		case 68: //d
			wsio.emit('clientSendKeyStatus', {pushStatus: 'release', moveVert:'right'});
			break;
	} //end switch keyCode

} //end interactionMapHandleKeyUp

function interactionMenuHandleKeyUp() {
	console.log('Currently interactionMenuHandleKeyUp is not implemented');

} //end interactionMenuHandleKeyUp

//--------------------------------------------------------------------------- handleClick

function handleClick(event) {

	if(debug) { console.log('click at:' 
		+ event.clientX 
		+ '(' + event.screenX + '), '

		+ event.clientY
		+ '(' + event.screenY + ')'
		+ ' button:' +  event.button) ; }

} //end handleClick
