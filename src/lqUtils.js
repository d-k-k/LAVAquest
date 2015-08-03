
'use strict';

/**
 * Given an array see if the value is within the top level of containment.
 * 
 * @param arr {Array} the array to check if value exists.
 * @param value { Object } usually an object but really could be anything to check if is in the array.
 * @return true if value is in the array, false otherwise.
 */
function givenArrayDoesItContainValue(arr, value) {

	if(!arr) { console.log('lqUtils:givenArrayDoesItContainValue: Error on array, ' + arr); return; }
	if(!value) { console.log('lqUtils:givenArrayDoesItContainValue: Error on value, ' + value); return; }


	console.log('use array check function here');

} //end initializeMapArray


/**
 * Given an array add value only if it isn't already within.
 * 
 * @param arr {Array} the array to check if value exists.
 * @param value { Object } usually an object but really could be anything to check if is in the array.
 * @return true if value is in the array, false otherwise.
 */
function givenArrayAddValueIfDoesntHave(arr, value) {

	if(!arr) { console.log('lqUtils:givenArrayAddValueIfDoesntHave: Error on array, ' + arr); return; }
	if(!value) { console.log('lqUtils:givenArrayAddValueIfDoesntHave: Error on value, ' + value); return; }

	console.log( 'use array check and push function here TF return value' );

} //end initializeMapArray


/**
 * Given an array remove the value.
 * 
 * @param arr {Array} the array to check if value exists.
 * @param value { Object } usually an object but really could be anything to check if is in the array.
 * @return true if value was removed, false otherwise.
 */
function givenArrayRemoveValue(arr, value) {

	if(!arr) { console.log('lqUtils:givenArrayRemoveValue: Error on array, ' + arr); return; }
	if(!value) { console.log('lqUtils:givenArrayRemoveValue: Error on value, ' + value); return; }

	console.log( 'use array check and remove  here TF return value' );

} //end initializeMapArray


exports.givenArrayDoesItContainValue = givenArrayDoesItContainValue;
exports.givenArrayAddValueIfDoesntHave = givenArrayAddValueIfDoesntHave;
exports.givenArrayRemoveValue = givenArrayRemoveValue;


