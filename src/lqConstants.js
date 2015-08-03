
'use strict';

/**
 * Fill out the constants to the global object
 */
function fillConstantsToGlobal() {

	//debug
	global.d 			= {};
	var d 				= global.d;
	d.general 				= true;
	d.mainUpdater 			= true;
	d.map 					= true;

	//constants
	global.c 			= {};
	var c 				= global.c;

	//map constants
	c.mapBlockWidth			= 96;
	c.mapBlockHeight		= 96;

	//player constants
	c.pSpeed 				= 100;
	c.spriteWidth			= 32;
	c.spriteHeight			= 48;




} //end fillConstantsToGlobal



exports.fillConstantsToGlobal = fillConstantsToGlobal;


