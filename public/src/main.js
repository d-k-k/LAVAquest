
//-------------------------------------------------------------------------------------------------------------

//kinetic manipulation
var	stage;
var backgroundLayer;
var layer1;


//constants
var cNameTextSize = 10;
var cEntityBaseHp = 100;
var cSpriteStartingWidth = 32;
var cSpriteStartingHeight = 48;


//
var clientTrackedKineticEntities = [];
var thisClientId = -1;
var thisClientKgr = null;



//-------------------------------------------------------------------------------------------------------------


function initializeKineticStage() {

	var workingDiv = document.getElementById('topDiv');
	workingDiv.innerHTML = '<div id=canvas></div>';

	stage = new Kinetic.Stage({
		width: 500,
		height: 500,
		container: 'canvas'
	});

	backgroundLayer = new Kinetic.Layer();
	stage.add(backgroundLayer);

	layer1 = new Kinetic.Layer();
	stage.add(layer1);

	stage.draw();
	if(debug) { console.log('kinetic init finished'); }
} //end initialize


//-------------------------------------------------------------------------------------------------------------

function addThisClientAvatar(data) {

	thisClientId = data.cid;
	if(thisClientId === null || thisClientId < 0) { console.log("Error with id aquisition"); alert("Error with id aquisition"); }


	if 		(data.characterType === 1) {	thisClientKgr = makeEntity('img/squire_m.png' , data.name , layer1, data); }
	else if (data.characterType === 2) {	thisClientKgr = makeEntity('img/redmage_m.png' , data.name , layer1, data); }
	else if (data.characterType === 3) {	thisClientKgr = makeEntity('img/whitemage_m.png' , data.name , layer1, data); }
	else { console.log('Error with character data type'); alert('Error with character data type'); }

	clientTrackedKineticEntities.push(thisClientKgr);

	bindControls();

	updateOneEntityScreenPositionBasedOnThisClient(thisClientKgr);
}




function bindControls() {
	document.addEventListener('keydown', handleKeyDown);
	document.addEventListener('keyup', handleKeyUp);
	document.addEventListener('click', handleClick);

	//correctly route right clicks to handler.
	window.oncontextmenu = function (e) { handleClick(e); return false; }

} //end bindControls

function handleKeyDown(event) {
	if(debug) { console.log('keydown from:' + event.type + '(' + event.key + ')'+ '(' + event.char + ')'+ '(' + event.charCode + ')'+ '(' + event.keyCode + ')' + '(' + event.location + ')') ; }

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
	} //end switch keyCode

} //end handleKeyDown



function handleKeyUp(event) {
	if(debug) { console.log('keyUp from:' + event.type + '(' + event.key + ')'+ '(' + event.char + ')'+ '(' + event.charCode + ')'+ '(' + event.keyCode + ')' + '(' + event.location + ')') ; }


	var workingEntity = clientTrackedKineticEntities[0];
	var workingEntityGroup = workingEntity.kGroup;

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

} //end handleKeyUp


function handleClick(event) {

	if(debug) { console.log('click at:' 
		+ event.clientX 
		+ '(' + event.screenX + '), '

		+ event.clientY
		+ '(' + event.screenY + ')'
		+ ' button:' +  event.button) ; }


} //end handleClick


function addOtherClientAvatar(data) {
	if 		(data.characterType === 1) {	clientTrackedKineticEntities.push( makeEntity('img/squire_m.png' , data.name , layer1, data) ); }
	else if (data.characterType === 2) {	clientTrackedKineticEntities.push( makeEntity('img/redmage_m.png' , data.name , layer1, data) ); }
	else if (data.characterType === 3) {	clientTrackedKineticEntities.push( makeEntity('img/whitemage_m.png' , data.name , layer1, data) ); }
	else { console.log('Error with character data type'); console.dir(data); alert('Error with character data type'); }

	updateOneEntityScreenPositionBasedOnThisClient( clientTrackedKineticEntities[ clientTrackedKineticEntities.length - 1 ] );
}


//-------------------------------------------------------------------------------------------------------------


function updateOneEntityScreenPositionBasedOnThisClient(entityEntry) {

	if(entityEntry === thisClientKgr) {
		entityEntry.kGroup.x( stage.width()/2 );
		entityEntry.kGroup.y( stage.height()/2 );
	}
	//everything else must be offset by this client.
	else {
		var xdiff = entityEntry.wsDataRef.x - thisClientKgr.wsDataRef.x;
		var ydiff = entityEntry.wsDataRef.y - thisClientKgr.wsDataRef.y;

		entityEntry.kGroup.x( stage.width()/2 - xdiff );
		entityEntry.kGroup.y( stage.height()/2 - ydiff );
	}
} //end updateOneEntityScreenPositionBasedOnThisClient


function givenWsDataShiftBySpecifiedAmount( wsDataRef, xdiff, ydiff ) {

	var entityEntry;

	//improve: change to wsdata links
	for( var k = 0; k < clientTrackedKineticEntities.length; k++ ) {
		entityEntry = clientTrackedKineticEntities[k];
		if(entityEntry.wsDataRef == wsDataRef) {
			if( ydiff !== 0) {
				entityEntry.kGroup.y(  entityEntry.kGroup.y() + ydiff );
				if(ydiff < 0) { entityEntry.kSprite.animation('walkAway'); entityEntry.kSprite.start(); }
				else { entityEntry.kSprite.animation('walkToward'); entityEntry.kSprite.start(); }
			}
			if( xdiff !== 0) {
				entityEntry.kGroup.x(  entityEntry.kGroup.x() + xdiff );
				if(xdiff < 0) { entityEntry.kSprite.animation('walkLeft'); entityEntry.kSprite.start(); }
				else { entityEntry.kSprite.animation('walkRight'); entityEntry.kSprite.start(); }
			}
			if(xdiff == ydiff && xdiff == 0) {
				if(entityEntry.kSprite.animation() == 'walkAway') { entityEntry.kSprite.animation( 'standAway' ); }
				else if(entityEntry.kSprite.animation() == 'walkToward') { entityEntry.kSprite.animation( 'standToward' ); }
				else if(entityEntry.kSprite.animation() == 'walkLeft') { entityEntry.kSprite.animation( 'standLeft' ); }
				else if(entityEntry.kSprite.animation() == 'walkRight') { entityEntry.kSprite.animation( 'standRight' ); }
			}
		}
	}

} //end givenWsDataShiftBySpecifiedAmount



//-------------------------------------------------------------------------------------------------------------

/*
Design for an entity.

Entry for core:
{
	name
	hp

	kGroup, kSprite, kName, kHp
}

Char Group
|-Core animation
|-Overlay animation
|-Name
|-Status(bar / marker)
|-Status Icon Group 


*/
function makeEntity(fileLocation, name, layerToJoin, wsDataRef) {

	var entityEntry = {};
	entityEntry.name = name + "";
	entityEntry.hp = cEntityBaseHp;
	entityEntry.wsDataRef = wsDataRef;

	var spriteGroup = new Kinetic.Group();
	entityEntry.kGroup = spriteGroup;

	var animationSprite = makeSprite(fileLocation, entityEntry);
	spriteGroup.add(animationSprite);
	entityEntry.kSprite = animationSprite;

	var nameText = new Kinetic.Text({
		text: name,
		fontSize: cNameTextSize,
		fontFamily: 'Ariel',
		fill: 'black'
	});
	nameText.x( -nameText.getTextWidth()/2 );
	nameText.y( -nameText.getTextHeight() * 2 - cSpriteStartingHeight );
	spriteGroup.add(nameText);
	entityEntry.kName = nameText; 

	var hpContainer = new Kinetic.Rect({
		width: cSpriteStartingWidth * 2,
		height: nameText.getTextHeight() ,
		fill: 'black'
	});
	hpContainer.x( -hpContainer.width()/2 );
	hpContainer.y( cSpriteStartingHeight + nameText.getTextHeight() );
	spriteGroup.add(hpContainer);
	entityEntry.kHpContainer = hpContainer;

	var hpBar = new Kinetic.Rect({
		width: hpContainer.width(),
		height: hpContainer.height() ,
		fill: 'green',
		x: hpContainer.x(),
		y: hpContainer.y(),
	});
	spriteGroup.add(hpBar);
	entityEntry.kHpBar = hpBar;

	layerToJoin.add( spriteGroup );


	//
	// var pointOfReferenceOrigin = new Kinetic.Rect({ x: -1, y: -1, width: 2, height: 2, fill: 'red'});
	// spriteGroup.add(pointOfReferenceOrigin);


	return entityEntry;
} //end makeEntity


/*
Needed: sprite creation following a particular standard.

location will be offset to be centered around 0,0

needs to be setup better to handle the callback correctly without eating cycles.

*/
function makeSprite(fileLocation, entity) {

	//create a js image object.
	var imgObj = new Image();
	var kSprite;

	entity.imgObj = imgObj;

	//setup listener for the image.
	imgObj.onload = function() {

		console.log('img callback btw, this is:' + this);
		console.dir(this);

		//when an image object finishes loading

		for(var i = 0; i < clientTrackedKineticEntities.length; i++) {
			if ( clientTrackedKineticEntities[i].imgObj === this) {
				clientTrackedKineticEntities[i].kSprite.image(this);
				clientTrackedKineticEntities[i].kSprite.animation('walkToward');
				clientTrackedKineticEntities[i].kSprite.animations( {
					standToward: 	[ 	0,	0,	32,	48 ],
					standLeft: 		[ 	0,	48,	32,	48 ],
					standRight: 	[ 	0,	96,	32,	48, ],
					standAway: 		[ 	0,	144,	32,	48, ],

					walkToward: [ 	0,	0,	32,	48, 	32,	0,	32,	48, 	64,	0,	32,	48, 	96,	0,	32,	48 ],
					walkLeft: 	[ 	0,	48,	32,	48, 	32,	48,	32,	48, 	64,	48,	32,	48, 	96,	48,	32,	48 ],
					walkRight: 	[ 	0,	96,	32,	48, 	32,	96,	32,	48, 	64,	96,	32,	48, 	96,	96,	32,	48 ],
					walkAway: 	[ 	0,	144,	32,	48, 	32,	144,	32,	48, 	64,	144,	32,	48, 	96,	144,	32,	48 	]

				});
				clientTrackedKineticEntities[i].kSprite.frameRate(4);
				clientTrackedKineticEntities[i].kSprite.frameIndex(0);

				console.log('Image match found and supposedly sprite updated.');
				entitySpacingRecheckBasedOnSprite(clientTrackedKineticEntities[i]);
				clientTrackedKineticEntities[i].kSprite.start();
				return;
			}
		}

		console.log('Unable to find image match');

		// kSprite =  new Kinetic.Sprite({
		// 	x: 0,
		// 	y: 0,
		// 	image: imgObj,
		// 	animation: 'walkToward',
		// 	animations: {
		// 		walkToward: [ 	0,	0,	32,	48, 	32,	0,	32,	48, 	64,	0,	32,	48, 	96,	0,	32,	48 ],
		// 		walkLeft:[ 		0,	48,	32,	48, 	32,	48,	32,	48, 	64,	48,	32,	48, 	96,	48,	32,	48 ],
		// 		walkRight:[ 	0,	96,	32,	48, 	32,	96,	32,	48, 	64,	96,	32,	48, 	96,	96,	32,	48 ],
		// 		walkAway:[ 		0,	144,	32,	48, 	32,	144,	32,	48, 	64,	144,	32,	48, 	96,	144,	32,	48 	]
		// 	},
		// 	frameRate:4,
		// 	frameIndex: 0,
		// 	width: 64,
		// 	height: 96
		// });
		// image.start();
	};
	imgObj.src = fileLocation;

	kSprite = new Kinetic.Sprite({
			x: 0,
			y: 0,
			width: cSpriteStartingWidth,
			height: cSpriteStartingHeight
		});

	return kSprite;
} //end makeSprite


//Needs to be correctly adjusted and called from the image.onload callback

function entitySpacingRecheckBasedOnSprite(entityEntry) {

	//first set the sprite to the center of the group
	var workingElement = entityEntry.kSprite;
	workingElement.x( - workingElement.width() / 2);
	workingElement.y( - workingElement.height() / 2);

	//name
	workingElement = entityEntry.kName;
	workingElement.x( - workingElement.getTextWidth() / 2 );
	workingElement.y( - workingElement.getTextHeight() - entityEntry.kSprite.height() / 2 );

	//hpcontainer
	workingElement = entityEntry.kHpContainer;
	workingElement.x( - workingElement.width() / 2 );
	workingElement.y( entityEntry.kSprite.height() / 2 + workingElement.height() );
	//hpbar
	workingElement = entityEntry.kHpBar;
	workingElement.x( entityEntry.kHpContainer.x() );
	workingElement.y( entityEntry.kHpContainer.y() );

} //end fillOutKineticSpacing












