

//---------------------------------------------------------------------------------------------------------Constants

var cNameTextSize 			= 10;
var cEntityBaseHp 			= 100;
var cSpriteStartingWidth 	= 32;
var cSpriteStartingHeight 	= 48;

var cGsInWorld				= 1; //check if javscript has enum equivalents.

var cIsMap					= 1;
var cIsMenu					= 2;

var debug					= true; 



//---------------------------------------------------------------------------------------------------------Globals

var gameState 				= cGsInWorld;
var interactionState		= cIsMap;


//Packet
var wsio 					= null;
var allWsClients			= [];



//kinetic manipulation
var	stage 					= null;
var backgroundLayer 		= null;
var layer1 					= null;

var groundTiles 			= [];
var groundTileImage 		= null;
var groundGroup 			= null;

var clientTrackedKineticEntities = [];
var thisClientId 			= -1;
var thisClientKgr 			= null;






