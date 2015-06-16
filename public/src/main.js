
//-------------------------------------------------------------------------------------------------------------

//kinetic manipulation
var	stage;
var layer1;


//constants
var cNameTextSize = 10;
var cEntityBaseHp = 100;
var cSpriteStartingWidth = 32;
var cSpriteStartingHeight = 48;


//
var allEntities = [];


//-------------------------------------------------------------------------------------------------------------


function initialize() {

	bindControls();


	var workingDiv = document.getElementById('topdiv');
	workingDiv.innerHTML = '<div id=canvas></div>';

	stage = new Kinetic.Stage({
		width: 500,
		height: 500,
		container: 'canvas'
	});

	var backgroundLayer = new Kinetic.Layer();
	stage.add(backgroundLayer);
	var blackBackdrop = new Kinetic.Rect({
	  width: 600,
	  height: 600,
	  fill: 'black'
	});
	//backgroundLayer.add(blackBackdrop);

	layer1 = new Kinetic.Layer();

	stage.add(layer1);

	allEntities.push( makeEntity('img/squire_m.png' , 'p1' , layer1) );

	stage.draw();
	//layer1.draw();


	console.log('init finished');

} //end initialize


//-------------------------------------------------------------------------------------------------------------


function bindControls() {
	document.addEventListener('keydown', handleKeyDown);


} //end bindControls

function handleKeyDown(event) {
	console.log('keydown from:' + event.type + '(' + event.key + ')'+ '(' + event.char + ')'+ '(' + event.charCode + ')'+ '(' + event.keyCode + ')' + '(' + event.location + ')') ;


	var workingEntity = allEntities[0];
	var workingEntityGroup = workingEntity.kGroup;

	switch(event.keyCode){
		//	w the key. case doesn't matter since it uses the key code.
		case 87:
			workingEntity.kSprite.animation('walkAway');
			workingEntityGroup.y( workingEntityGroup.y() - 10);
			break;
		//	a
		case 65:
			workingEntity.kSprite.animation('walkLeft');
			workingEntityGroup.x( workingEntityGroup.x() - 10);
			break;
		//	s
		case 83:
			workingEntity.kSprite.animation('walkToward');
			workingEntityGroup.y( workingEntityGroup.y() + 10);
			break;
		//	d
		case 68:
			workingEntity.kSprite.animation('walkRight');
			workingEntityGroup.x( workingEntityGroup.x() + 10);
			break;
	} //end switch keyCode

} //end handleKeyDown


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
function makeEntity(fileLocation, name, layerToJoin) {

	var entityEntry = {};
	entityEntry.name = name + "";
	entityEntry.hp = cEntityBaseHp;

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

		for(var i = 0; i < allEntities.length; i++) {
			if ( allEntities[i].imgObj === this) {
				allEntities[i].kSprite.image(this);
				allEntities[i].kSprite.animation('walkToward');
				allEntities[i].kSprite.animations( {
					walkToward: [ 	0,	0,	32,	48, 	32,	0,	32,	48, 	64,	0,	32,	48, 	96,	0,	32,	48 ],
					walkLeft: 	[ 	0,	48,	32,	48, 	32,	48,	32,	48, 	64,	48,	32,	48, 	96,	48,	32,	48 ],
					walkRight: 	[ 	0,	96,	32,	48, 	32,	96,	32,	48, 	64,	96,	32,	48, 	96,	96,	32,	48 ],
					walkAway: 	[ 	0,	144,	32,	48, 	32,	144,	32,	48, 	64,	144,	32,	48, 	96,	144,	32,	48 	]
				});
				allEntities[i].kSprite.frameRate(4);
				allEntities[i].kSprite.frameIndex(0);

				console.log('Image match found and supposedly sprite updated.');
				entitySpacingRecheckBasedOnSprite(allEntities[i]);
				allEntities[i].kSprite.start();
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












