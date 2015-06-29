

// require variables to be declared
"use strict";

var utils			= require('../src/utils');



function generateLevel1Ground() {

	//players start at 250,250, placing initial ground plot around them.

	var floorContainer = [];
	var floorPiece = {};
	

	//create left area that encompases player.
	floorPiece.cx = 250;
	floorPiece.cy = 250;
	floorPiece.width = global.cSpriteWidth * 15;
	floorPiece.height = global.cSpriteHeight * 9;
	floorContainer.push(floorPiece);

	//create top bridge
	floorPiece = {};
	floorPiece.cx = 250 + (global.cSpriteWidth * 15);
	floorPiece.cy = 250 - (global.cSpriteWidth * 3);
	floorPiece.width = global.cSpriteWidth * 15;
	floorPiece.height = global.cSpriteWidth * 3;
	floorContainer.push(floorPiece);

	//create bottom bridge
	floorPiece = {};
	floorPiece.cx = 250 + (global.cSpriteWidth * 15);
	floorPiece.cy = 250 + (global.cSpriteWidth * 3);
	floorPiece.width = global.cSpriteWidth * 15;
	floorPiece.height = global.cSpriteWidth * 3;
	floorContainer.push(floorPiece);

	//create right area
	floorPiece = {};
	floorPiece.cx = 250 + (global.cSpriteWidth * 30);
	floorPiece.cy = 250;
	floorPiece.width = global.cSpriteWidth * 15;
	floorPiece.height = global.cSpriteHeight * 15;
	floorContainer.push(floorPiece);


	return floorContainer;

} //end generateLevel1Ground

//cSpriteWidth cSpriteHeight


function checkIfEntityLeavingGround( entity, groundBlocks ) {

	var rect1, rect2;
	rect1 = {};
	rect2 = {};

	rect2.cx = entity.x;
	rect2.cy = entity.y;
	rect2.width = cSpriteWidth;
	rect2.height = cSpriteHeight;

	for ( var i = 0; i < groundBlocks.length; i++ ) {

		rect1.cx = groundBlocks[i].cx;
		rect1.cy = groundBlocks[i].cy;
		rect1.width = groundBlocks[i].width;
		rect1.height = groundBlocks[i].height;

		if( utils.isSecondRectangleWithinFirst(rect1, rect2) ){
			return false;
		}

	}

	return true;

} //end checkIfEntityLeavingGround




exports.generateLevel1Ground = generateLevel1Ground;
exports.checkIfEntityLeavingGround = checkIfEntityLeavingGround;


