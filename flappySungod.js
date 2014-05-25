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
var isGameOver = false;

/*** Classes ***/
var Ground = function(){
  var img = document.querySelector('#ground_texture');
  var texture = ctx.createPattern(img, 'repeat-x');
  ctx.fillStyle = texture;
  
  this.yBound = gameHeight - img.height;
  
  this.draw = function(){
    ctx.save();
    ctx.translate(0, gameHeight - img.height);
    ctx.fillRect(0, 0, gameWidth, img.height);
    ctx.restore();
  };
}
var Sungod = function(){
	this.formNumber = 0;
	this.time = 0;

	this.width = 88;
	this.height = 58;

	//height per flap
	this.flapHeight = -6;
	this.gravity = 4;
	this.peakHeight = -60;
	this.flightStatus = 0;

  //different forms on spritesheet
  this.forms = [
    {'x': 2, 'y': 1, 'width': 88, 'height': 58},
    {'x': 1, 'y': 60, 'width': 88, 'height': 58},
    {'x': 4, 'y': 119, 'width': 88, 'height': 58}
  ];

	this.xPosition = gameWidth / 3 - this.width / 2;
	this.yPosition = gameHeight / 2 - this.height / 2;

	this.draw = function(){
  	//position on spritesheet
    this.xOffset = this.forms[this.formNumber].x;
    this.yOffset = this.forms[this.formNumber].y;
    this.offsetWidth = this.forms[this.formNumber].width;
    this.offsetHeight = this.forms[this.formNumber].height;
  
		ctx.drawImage(sprite, this.xOffset, this.yOffset,
			this.offsetWidth, this.offsetHeight, this.xPosition, this.yPosition, 
			this.width, this.height);
		
		this.time++;
		if (this.time % 15 == 0){
			this.formNumber++;
			if (this.formNumber > 2)
				this.formNumber = 0;

			if (this.time > 45)
				this.time = 0;
		}
	};
  this.reset = function(){
    this.xPosition = gameWidth / 3 - this.width / 2;
    this.yPosition = gameHeight / 2 - this.height / 2;
  }
  
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
var ground = new Ground();

/*** Game Functions ***/

function init(){
	canvas.removeEventListener('click', init);
	canvas.addEventListener('click', calcSungodPosition, false);
	
  function calcSungodPosition(){
		sungod.flightStatus = 0;
	}
  function checkCollisions(){
    if (sungod.yPosition + sungod.height > ground.yBound){
      reset();
    }
  }
	function update(){
		sungod.fly();
		sungod.draw();
    ground.draw();
    
    checkCollisions();
	}
	gameLoop = function(){
		update();
    if ( isGameOver == true ){
      isGameOver = false;
      return;
    }
		requestAnimFrame(gameLoop);
	}
	gameLoop();
}

function reset(){
  sungod.reset();
  isGameOver = true;
  canvas.addEventListener('click', init, false);
}

function startUpdate(){
	ctx.clearRect(0,0, gameWidth, gameHeight);
	sungod.draw();
  ground.draw();
}

var startLoop = function(){
	startUpdate();
	requestAnimFrame(startLoop);
};

startLoop();
canvas.addEventListener('click', init, false);