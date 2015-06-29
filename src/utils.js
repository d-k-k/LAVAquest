
"use strict";


var fs     = require('fs');                  // filesystem access



/**
 * Test if file is exists and readable
 *
 * @method fileExists
 * @param filename {String} name of the file to be tested
 * @return {Bool} true if readable
 */
function fileExists(filename) {
	if (process.version === 10 || process.version === 11) {
		return fs.existsSync(filename);
	} else {
		// Versions 1.x or above
		try {
			fs.accessSync(filename, fs.R_OK);
			return true;
		} catch (err) {
			return false;
		}
	}
}

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



/*
Takes two objects with attributes
cx, cy, width, height.
*/
function isSecondRectangleWithinFirst(firstRect, secondRect) {

	if( firstRect.cx - firstRect.width/2 < secondRect.cx - secondRect.width/2 ) {
		if(firstRect.cx + firstRect.width/2 > secondRect.cx + secondRect.width/2) {

			if(firstRect.cy - firstRect.height/2 < secondRect.cy - secondRect.height/2) {
				if(firstRect.cy + firstRect.height/2 > secondRect.cy + secondRect.height/2) {

					return true;

				}
			}

		}
	}

	return false;

} //end


/*
Takes two objects with attributes
cx, cy, width, height.
*/
function areRectanglesTouching(firstRect, secondRect) {

	if( firstRect.cx - firstRect.width/2 <= secondRect.cx + secondRect.width/2 ) {
		if(firstRect.cx + firstRect.width/2 >= secondRect.cx - secondRect.width/2) {

			if(firstRect.cy - firstRect.height/2 <= secondRect.cy + secondRect.height/2) {
				if(firstRect.cy + firstRect.height/2 >= secondRect.cy - secondRect.height/2) {

					return true;

				}
			}
		}
	}
	return false;
} //end



exports.fileExists = fileExists;
exports.removeArrayElement = removeElement;
exports.moveArrayElementToEnd = moveElementToEnd;
exports.isSecondRectangleWithinFirst = isSecondRectangleWithinFirst;
exports.areRectanglesTouching = areRectanglesTouching;



