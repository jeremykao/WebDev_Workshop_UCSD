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
var distBetweenPipes = 180;
var distBetweenPipeCols = 280;
var groundHeight = 67;
var gameScore = 0;
var countedScore = false;

var sprite = document.querySelector('#spritesheet');

var canvas = document.querySelector('#canvas');
var ctx = canvas.getContext('2d');

var animationFrame;

canvas.width = gameWidth;
canvas.height = gameHeight;
var isGameOver = false;

/*** Classes ***/
var Ground = function(){
  var img = document.querySelector('#ground_texture');
  var texture = ctx.createPattern(img, 'repeat-x');
  ctx.fillStyle = texture;
  
  this.yBound = gameHeight - groundHeight;
  
  this.draw = function(){
    ctx.save();
    ctx.translate(0, gameHeight - groundHeight);
    ctx.fillRect(0, 0, gameWidth, groundHeight);
    ctx.restore();
  };
}
var Sungod = function(){
	this.formNumber = 0;
	this.time = 0;

	this.width = 75;
	this.height = 50;	

	//height per flap
	this.flapHeight = -5;
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

var Pipes = function(){
  var pipePositions = [];
  this.pipeSprites = [];
  this.pipeSprites['bottom'] ={'x': 0, 'y': 255, 'width': 78, 'height': 370};
  this.pipeSprites['top'] = {'x': 93, 'y': 255, 'width': 78, 'height': 370};
  
  var pipeSprites = this.pipeSprites;
  
  var createPipe = function(){
    var topPipeHeight = Math.random() * (pipeSprites['top'].height - 50) + 50;
    var bottomPipeHeight = gameHeight - topPipeHeight - distBetweenPipes - groundHeight;
  
    var pipeColumn = {'topSpriteYOffset': pipeSprites['top'].height + pipeSprites['top'].y  - topPipeHeight, 
      'topSpriteHeight': topPipeHeight, 'xPosition': pipePositions[pipePositions.length - 1].xPosition + distBetweenPipeCols, 'topCanvasYOffset': topPipeHeight,
      'bottomSpriteHeight': bottomPipeHeight, 'yPosition': topPipeHeight + distBetweenPipes, 'bottomCanvasYOffset': bottomPipeHeight, 'valid': false };
    
    pipePositions.push(pipeColumn);
  }
  
  this.init = function(){
    pipePositions = [];
    for (var i = 0; i < 5; ++i){
      var topPipeHeight = Math.random() * (pipeSprites['top'].height - 50) + 50;
      var bottomPipeHeight = gameHeight - topPipeHeight - distBetweenPipes - groundHeight;

      var pipeColumn = {'topSpriteYOffset': pipeSprites['top'].height + pipeSprites['top'].y  - topPipeHeight, 
        'topSpriteHeight': topPipeHeight, 'xPosition': gameWidth + distBetweenPipeCols * i, 'topCanvasYOffset': topPipeHeight,
        'bottomSpriteHeight': bottomPipeHeight, 'yPosition': topPipeHeight + distBetweenPipes, 'bottomCanvasYOffset': bottomPipeHeight, 'valid': false };
      
      pipePositions.push(pipeColumn);
    }
  }
  this.draw = function(){
    pipePositions.forEach(function(element, index, array){
      ctx.drawImage(sprite, pipeSprites['top'].x, element.topSpriteYOffset,
        pipeSprites['top'].width, element.topSpriteHeight, element.xPosition, 0, 
        pipeSprites['top'].width, element.topCanvasYOffset);
      ctx.drawImage(sprite, pipeSprites['bottom'].x, pipeSprites['bottom'].y,
        pipeSprites['bottom'].width, element.bottomSpriteHeight, element.xPosition, element.yPosition, 
        pipeSprites['bottom'].width, element.bottomCanvasYOffset);
    });
  }
  
  this.move = function(){
    pipePositions.forEach(function(element, index, array){
      element.xPosition -= 2;
      if ( element.xPosition + pipeSprites['top'].width < 0 ){
        array.splice(index,1);
        createPipe();
      }
    });
  };
  
  this.reset = function(){
    this.init();
  }
  
  this.getPipePositions = function(){
    return pipePositions;
  }
  
  this.getCurrentPipe = function(){
    if ( pipePositions[0].valid == false )
      return pipePositions[0];
    else
      return pipePositions[1];
  }
  
  this.init();
}

/*** END CLASSES ****/


//initializations
var sungod = new Sungod();
var pipes = new Pipes();
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
    
    var hasHitPipe = false;
    if ( sungod.xPosition + sungod.width >= pipes.getCurrentPipe().xPosition ){      
      if ( pipes.getCurrentPipe().valid == false && 
        (sungod.yPosition < pipes.getCurrentPipe().topCanvasYOffset ||
        sungod.yPosition + sungod.height > pipes.getCurrentPipe().yPosition) ){
          console.log('hit');
          hasHitPipe = true;
          reset();
      }
      if (sungod.xPosition > pipes.getCurrentPipe().xPosition + 78){
          pipes.getCurrentPipe()['valid'] = true;
          countedScore = false;
      }
    }
    if (hasHitPipe == false && countedScore == false ){
      gameScore += 1;
      console.log(gameScore);
      countedScore = true;
    }
  }
  
	function update(){
		sungod.fly();
		sungod.draw();
    pipes.draw();
    
    checkCollisions();
    pipes.move();
    
    ground.draw();
    

	}
	gameLoop = function(){
    if ( isGameOver == false ){
      update();
      animationFrame = requestAnimFrame(gameLoop);
    }
    else{
      isGameOver = false;
    }
	}
	gameLoop();
}

function reset(){
  sungod.reset();
  pipes.reset();
  gameScore = 0;
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