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
var countedScore = false;
var gameLoopStarted = false;
var vxGame = 3;

//get images for the bird and pipes
var sprite = document.querySelector('#spritesheet');
//area to display current game score
var score = document.querySelector('#score');
//area to dispaly high score
var highScoreText = document.querySelector('#highScore');
//where game is drawn/played
var canvas = document.querySelector('#canvas');
var ctx = canvas.getContext('2d');

//set high score to either 0 or something in localStorage
var highScore = localStorage.getItem('highScore') | 0;
//display the updated high score
highScoreText.innerHTML = highScore;

canvas.width = gameWidth;
canvas.height = gameHeight;
var isGameOver = false;

/*** Classes ***/
var Game = function(){
  this.score = 0;
  
  this.incrementScore = function(){
    /*** TODO: Add procedures that add 1 to the score and
    **** update the score on the webpage
    ****/
  };

  this.resetScore = function(){
    //this if block checks if the score of the game is greater than the
    //high score stored in localStorage
    if (this.score > highScore){
      highScore = this.score; //set new high score to current score
      localStorage.setItem('highScore', highScore); //set new high score in localStorage
      highScoreText.innerHTML = highScore; //display the updated high score
    }
    this.score = 0; //reset the score back to zero
    score.innerHTML = this.score; //display the updated score
    
  }
};

var Ground = function(){
  var img = document.querySelector('#ground_texture');
  var vxBg = 0;
  
  this.yBound = gameHeight - groundHeight;
  
  this.draw = function(){
  
    ctx. drawImage(img, 0, gameHeight - groundHeight);

    /**** TODO: Make ground move to the left continuously by vxGame ***/
  };
};

var Sungod = function(){
	this.formNumber = 0; //which form of the bird is currently displayed
	this.tick = 0; //just a little counter that will be used to switch between bird forms

  //width and height of the bird in the game.
	this.width = 75;
	this.height = 50;	

	//height per flap
	this.flapHeight = -5;
	this.gravity = 5;
	this.peakHeight = -60;
	this.flightStatus = 0;

  //different forms on spritesheet; the x and y mark the top left corner;
  //the width and height mark the offsets from the x,y that enclose the bird
  this.forms = [
    {'x': 2, 'y': 1, 'width': 88, 'height': 58},
    {'x': 1, 'y': 60, 'width': 88, 'height': 58},
    {'x': 4, 'y': 119, 'width': 88, 'height': 58}
  ];

  //Initially set (x,y) to (1/3 the width of the game, 1/2 the height of the game)
	this.xPosition = gameWidth / 3 - this.width / 2;
	this.yPosition = gameHeight / 2 - this.height / 2;

  // This function places Sungod sprite on the canvas 
	this.draw = function(){
  	//positions on spritesheet
    this.xOffset = this.forms[this.formNumber].x;
    this.yOffset = this.forms[this.formNumber].y;
    this.offsetWidth = this.forms[this.formNumber].width;
    this.offsetHeight = this.forms[this.formNumber].height;
  
		ctx.drawImage(sprite, this.xOffset, this.yOffset,
			this.offsetWidth, this.offsetHeight, this.xPosition, this.yPosition, 
			this.width, this.height);
		
    /*** TODO: Have Sungod sprite change forms every 15 frames ***/
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
  this.pipeSprites['bottom'] ={'x': 0, 'y': 181, 'width': 78, 'height': 372};
  this.pipeSprites['top'] = {'x': 93, 'y': 181, 'width': 78, 'height': 372};
  
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
    for (var i = 0; i < 3; ++i){
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
      element.xPosition -= vxGame;
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
};

/*** END CLASSES ****/


//initializations
var game = new Game();
var sungod = new Sungod();
var pipes = new Pipes();
var ground = new Ground();
/*** Game Functions ***/

function init(){
  gameLoopStarted = true; //game loop shall be started
  
	canvas.removeEventListener('click', init); //remove click listener on canvas
  //change click listener to call calcSungodPosition
	canvas.addEventListener('click', calcSungodPosition, false);
	
  function calcSungodPosition(){
		sungod.flightStatus = 0;
  }
  this.reset = function(){
    //remove click listener on canvas
    canvas.removeEventListener('click', calcSungodPosition);
  };
  function checkCollisions(){
    /*** TODO: Call reset for when the bird hits the ground ***/
    
    var hasHitPipe = false;
    //check if sungod's top right corner is past the first pipe's X coordinate
    if ( sungod.xPosition + sungod.width >= pipes.getCurrentPipe().xPosition ){      
      //checking if sungod has hit a pipe, so
      //if upcoming pipe is still not passed yet 
      //AND (sungod's top is above the top pipe's y coordinate
      //OR sungod's bottom is under the bottom pipe's y coordinate)
      if ( pipes.getCurrentPipe().valid == false && 
        (sungod.yPosition < pipes.getCurrentPipe().topCanvasYOffset ||
        sungod.yPosition + sungod.height > pipes.getCurrentPipe().yPosition) ){
          console.log('hit');
          hasHitPipe = true; //signal that pipe has been hit
          countedScore = false; //we may start counting score now
          reset(); //signal to call reset
      }
      
      //if sungod's top left corner has passed the first pipe entirely
      if (sungod.xPosition > pipes.getCurrentPipe().xPosition + 78){
          pipes.getCurrentPipe()['valid'] = true; //set the first pipe's valid to true. valid means has passed.
          countedScore = false; //we may continue counting score
      }
    }
    
    //if pipe has not been hit AND we did not count the score yet AND sungod's right side passed half of pipe's width
    if (hasHitPipe == false && countedScore == false && sungod.xPosition + sungod.width > pipes.getCurrentPipe().xPosition + 39 ){
      game.incrementScore(); //add 1 to score
      countedScore = true; //signal to game that we have counted the score
    }
  }
  
	function update(){
    ctx.clearRect(0,0, gameWidth, gameHeight); //clear canvas before drawing
		sungod.fly(); //tell sungod to fly
		sungod.draw(); //draw sungod
    pipes.draw(); //draw pipes
    
    checkCollisions(); //check if there is a collision
    pipes.move(); //move the pipes
    
    ground.draw(); //draw the ground
    

	}
  
  //This is the game loop. It is separate from the startLoop.
	gameLoop = function(){
    if ( isGameOver == false ){ //if game is not over yet,
      update(); //then keep updating canvas
      requestAnimFrame(gameLoop); //continue calling game loop
    }
    else{
      isGameOver = false; //reset the isGameOver
    }
	}
	gameLoop();
}


/****** NON GAME LOOP FUNCTIONS ******/
function reset(){
	ctx.clearRect(0,0, gameWidth, gameHeight); //clear canvas
  sungod.reset(); //reset sungod
  pipes.reset(); //reset pipes
  game.resetScore(); //reset score
  isGameOver = true; //game is over
  gameLoopStarted = false; //game loop shall be stopped
  startLoop(); //go back to startLoop
  canvas.addEventListener('click', init, false); //if click on canvas, start init()
}

//the function contains all the code that updates the canvas at every frame
function startUpdate(){
  //clear the canvas starting from (x,y) = (0,0) up to (gameWidth, gameHeight);
	ctx.clearRect(0,0, gameWidth, gameHeight); 
	sungod.draw(); //draw Sungod
  ground.draw(); //draw Ground
}

var startLoop = function(){
  //checks if gameLoop has started. 
  if (gameLoopStarted == false){
    startUpdate(); //if not, then call startUpdate()
    requestAnimFrame(startLoop); //at every frame, call startLoop
  }
};
/**** END NON GAME LOOP FUNCTIONS *****/

startLoop();
canvas.addEventListener('click', init, false);