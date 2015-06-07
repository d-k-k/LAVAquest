




function kineticTestMain() {

	var workingDiv = document.getElementById('topDiv');
	workingDiv.innerHTML = "Error, If you see this the stage didn't load.";
	workingDiv.style.backgroundColor = 'blue';

	var stage = new Kinetic.Stage({
		width: 400,
		height: 400,
		container: 'topDiv'
	});

	var layer1 = new Kinetic.Layer();

	var rect = new Kinetic.Rect({
		x: -100,
		y: -100,
		width: 600,
		height: 600,
		fill: 'green'
	});
	layer1.add(rect);
	rect = new Kinetic.Rect({
		x: 190,
		y: 190,
		width: 10,
		height: 10,
		fill: 'orange',
	});
	layer1.add(rect);
	rect = new Kinetic.Rect({
		x: 200,
		y: 200,
		width: 100,
		height: 100,
		fill: 'red',
		//stroke: 'black',
		//strokeWidth: 2
	});
	layer1.add(rect);
	rect = new Kinetic.Rect({
		x: 200,
		y: 200,
		width: 10,
		height: 10,
		fill: 'orange',
	});
	layer1.add(rect);
	stage.add(layer1);

	stage.scaleX(0.5);
	stage.scaleY(0.5);
	stage.draw();

	console.log('end main');
} //end kineticTestMain






