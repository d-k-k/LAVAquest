

var e = createEntity();

e.moveUpdate();



/*---------------------------------------------------------------------------------------------------------
Don't call this directly.
*/
function createEntity() {
	var ent = {};

	ent.x = -100;
	ent.y = -100;
	ent.width = -1;
	ent.height = -1;
	ent.speed = -1; //You need to modify this.
	ent.moveDirection = 'none';

	ent.moveUpdate = function () { console.log("Error entity move accessed."); };

	ent.getHitBox = function () {
		var rect = {};

		rect.x = this.x;
		rect.y = this.y;
		rect.width = this.width;
		rect.height = this.height;

		return rect;
	}; //end getHitBox



	return ent; //DONT FORGET THIS

} //end createEntity

/*---------------------------------------------------------------------------------------------------------
Creates a player game object
*/
function createPlayer() {
	var ent = createEntity();

	ent.intervalShoot = 500; //milliseconds
	ent.counterShoot = 0;
	ent.speed = 3;

	ent.moveUpdate = function() {
		switch (this.moveDirection) {

			case 'up':
				this.y -= speed;
			break;
			case 'down':
				this.y += speed;
			break;
			case 'none':
			break;
			default:
				console.log('Error unknown direction');
			break;
		} //end switch moveDirection


		//need to update visuals.


	} //end moveUpdate
} //end createPlayer

