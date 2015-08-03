
'use strict';

var lqMapSources	= [];
lqMapSources.push( require('../src/lqz-m00') );


//---------------------------------------------------------------------------initializeMapArray()
/**
 * Fill out the map array with correct map values.
 */
function initializeMapArray(allMaps) {

	console.log('lqMap: Implement me');


	//needs to create map objects
	for( var i = 0; i < lqMapSources.length; i++ ) {
		allMaps.push( createNewMap() );
		allMaps[ allMaps.length - 1 ].groundSetup( lqMapSources[i].get2dArray() );
	}


	//put into the map objects the correct values


} //end initializeMapArray
//----------------------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------createNewMap()
/**
 * Creates a new map object and returns it.
 */
function createNewMap() {
	var mobj = {};

	//variables
	mobj.playersOnMap 		= [];
	mobj.entitiesOnMap 		= [];
	mobj.mapEffects 		= [];
	mobj.layout				= null;
	mobj.walkableBlocks		= null;

	//functions
	mobj.update 		= function(dTime) { //--------------------------------update()

		//update all the entities.
		//included among other things is movement.
		//maybe also give walkable blocks to prevent movement if necessary

		//collision checks and effects.

		//final updates

	} //end update

	mobj.groundSetup 		= function( strings ) { //--------------------------------groundSetup()
		this.layout = convertArrayOfStringsTo2dChar( strings );
		this.walkableBlocks = convert2dCharToBlockArray( this.layout );
		if(global.d.map) { console.log('groundSetup needs to be implemented.'); console.log();}
	} //end groundSetup


	return mobj;
} //end createNewMap
//----------------------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------convertArrayOfStringsTo2dChar()
/**
Converts an array of strings into 2d char arrays. TODO double check the getChar type.

TODO: determine if map needs features on it.

 */
function convertArrayOfStringsTo2dChar(strings) {
	var width = strings[0].length;
	var height = strings.length;
	//error check:
	for(var i = 1; i < strings; i++) {
		if( strings[i].length !== strings[i-1].length ) {
			console.log('ERROR in map source');
			//force error
			strings[ -1 ] = 5;
		}
	}

	var layout = [];
	for(var i = 0; i < width; i++) {
		layout.push([]);
	}
	for(var i = 0; i < height; i++) {
		for(var c = 0; c < width; c++) {
			layout[c][i] = strings[i].charAt(c);
		}
	}

	if(global.d.map) {
		var line = "";
		for(var i = 0; i < width; i++) { line+='-'; }
		console.log( line );
		console.log('|Returning map 2d array:');
		console.log( line );
		for(var y = 0; y < height; y++) {
			line = "";
			for (var x = 0; x < width; x++) {
				line+= layout[x][y];
			}
			line += '|';
			console.log(line);
		}
		line = "";
		for(var i = 0; i < width; i++) { line+='-'; }
		console.log( line );
	}

	return layout;
} //end convertArrayOfStringsTo2dChar
//----------------------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------convert2dCharToBlockArray()
/**
Converts a 2d char array into an array of blocks.
The array is in [x][y] format.

TODO: determine if more efficient method is available.

 */
function convert2dCharToBlockArray( car ) {
	var blocks = [];
	var nb;

	for(var y = 0; y < car[0].length; y++) {
		for(var x = 0; x < car.length; x++) {

			switch( car[x][y] ) {
				
				case '.' :
					nb = {};
					nb.x = global.c.mapBlockWidth/2 + (x * global.c.mapBlockWidth); //
					nb.y = global.c.mapBlockHeight/2 + (y * global.c.mapBlockHeight);
					nb.width = global.c.mapBlockWidth;
					nb.height = global.c.mapBlockHeight;
					blocks.push(nb);
					break;

				case ' ' : break; //don't do anything for spaces, they aren't walkable.
				default:
					console.log('Error lqMap:convert2dCharToBlockArray unknown char on map:' + car[x][y] );
					break;
			} //end switch

		} //x
	} //y

	if(global.d.map) {
		console.log();
		console.log('---The following blocks are registered---');
		for(var i = 0; i < blocks.length; i++) {
			console.log('  ' + blocks[i].x + ',' + blocks[i].y);
		}
		console.log();
	}

	return blocks;
} //end convert2dCharToBlockArray
//----------------------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------isPointsWithinBlocks()
/**
Will go through all blocks and see if the given points are contained / touching any block.
The points may have to be 

@param point is an array of objects {x, y}
@param blocks is an array of objects {x, y, width, height}

 */
function isPointsWithinBlocks( points, blocks ) {
	for(var p = 0; p < points.length; p++ ) {
		points[p].isInsideAnyBlock = false;
	}

	for (var b = 0; b < blocks.length; b++) {
		for(var p = 0; p < points.length; p++) {
			if( isPointInRect( points[p] , blocks[b] ) ) {
				points[p].isInsideAnyBlock = true;
			}
		}
	}

	for(var p = 0; p < points.length; p++ ) {
		if( ! points[p].isInsideAnyBlock ) {
			return false;
		}
	}
	return true;
} //end isPointsWithinBlocks
//----------------------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------isPointInRect()
/**
Checks is a point in within or touching a given rect.

@param point is an object {x, y}
@param rect is an object {x, y, width, height}

 */
function isPointInRect( point, rect ) {
	if(
		point.x >= rect.x - rect.width/2
		&& point.x <= rect.x + rect.width/2
		&& point.y >= rect.y - rect.height/2
		&& point.y <= rect.y + rect.height/2) {
		return true;
	}
	return false;
} //end isPointInRect
//----------------------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------
exports.initializeMapArray = initializeMapArray;


