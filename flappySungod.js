//flappySungod.js

// RequestAnimFrame: a browser API for getting smooth animations
window.requestAnimFrame = (function() {
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
	function(callback) {
		window.setTimeout(callback, 1000 / 60);
	};
})();


/*** Global Variables ***/
var gameWidth = 360;
var gameHeight = 640;
var sprite = document.querySelector('#spritesheet');

var canvas = document.querySelector('#canvas');
var ctx = canvas.getContext('2d');

canvas.width = gameWidth;
canvas.height = gameHeight;


/*** Classes ***/
var Sungod = function(){
	this.formNumber = 0;
	this.time = 0;

	this.width = 55;
	this.height = 40;

	//height per flap
	this.flapHeight = -6;
	this.gravity = 4;
	this.peakHeight = -60;
	this.flightStatus = 0;

	//position on spritesheet
	this.xOffset = 0;
	this.yOffset = 289;
	this.offsetWidth = 110;
	this.offsetHeight = 80;

	this.xPosition = gameWidth / 3 - this.width / 2;
	this.yPosition = gameHeight / 2 - this.height / 2;

	this.forms = [121, 289, 201, 371];
	this.draw = function(){
		ctx.drawImage(sprite, this.xOffset, this.forms[this.formNumber] ,
			this.offsetWidth, this.offsetHeight, this.xPosition, this.yPosition, 
			this.width, this.height);
		
		this.time++;
		if (this.time % 30 == 0){
			this.formNumber++;
			if (this.formNumber > 3)
				this.formNumber = 0;

			if (this.time > 120)
				this.time = 0;
		}
	};
	this.fly = function(){
		if (this.flightStatus > this.peakHeight){
			this.yPosition += this.flapHeight;
			this.flightStatus += this.flapHeight;
		}
		else{
			this.yPosition += this.gravity;
		}
	};
}

/*** END CLASSES ****/


//initializations
var sungod = new Sungod();


/*** Game Functions ***/

function init(){
	canvas.removeEventListener('click', init)
	canvas.addEventListener('click', calcSungodPosition, false);
	function calcSungodPosition(){
		sungod.flightStatus = 0;
	}

	function update(){
		sungod.fly();
		sungod.draw();
	}
	gameLoop = function(){
		update();
		requestAnimFrame(gameLoop);
	}
	gameLoop();
}

function startUpdate(){
	ctx.clearRect(0,0, gameWidth, gameHeight);
	sungod.draw();
}

var startLoop = function(){
	startUpdate();
	requestAnimFrame(startLoop);
};

startLoop();
canvas.addEventListener('click', init, false);