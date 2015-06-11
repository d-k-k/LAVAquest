



function initialize() {


	var workingDiv = document.getElementById('topdiv');
	workingDiv.innerHTML = '<div id=canvas></div>';

	var stage = new Kinetic.Stage({
		width: 500,
		height: 500,
		container: 'canvas'
	});

	var layer1 = new Kinetic.Layer();

	stage.add(layer1);


	var imgObj = new Image();
	imgObj.onload = function() {
		var image =  new Kinetic.Sprite({
			x: 0,
			y: 0,
			image: imgObj,
			animation: 'walkToward',
			animations: {
				walkToward: [
					0,	0,	32,	48,
					32,	0,	32,	48,
					64,	0,	32,	48,
					96,	0,	32,	48
				],
				walkLeft:[
					0,	48,	32,	48,
					32,	48,	32,	48,
					64,	48,	32,	48,
					96,	48,	32,	48
				],
				walkRight:[
					0,	96,	32,	48,
					32,	96,	32,	48,
					64,	96,	32,	48,
					96,	96,	32,	48
				],
				walkAway:[
					0,	144,	32,	48,
					32,	144,	32,	48,
					64,	144,	32,	48,
					96,	144,	32,	48
				]
			},
			frameRate:4,
			frameIndex: 0,
			width: 64,
			height: 96
		});
		layer1.add(image);
		image.start();
		console.log('finished loading image');
		stage.draw();
	};
	imgObj.src = 'squire_m.png';


	console.log('init finished');

} //end initialize