const canvas = document.querySelector('#gameCanvas');
const ctx = canvas.getContext('2d');

const BASE_WIDTH = 680;
const BASE_HEIGHT = 680;
var SCREEN_WIDTH = BASE_WIDTH;
var SCREEN_HEIGHT = BASE_HEIGHT;


//* colors (falbacks if sprites are not loaded)
const white = '#ffffff';
const skyBlue = '#87ceeb';
const green = '#00c800';
const red = '#ff0000';
const darkGray = '#282828';
const groundColor = '#8b4513';

//* sounds
const pointSound = new Audio('src/assets/sounds/point.ogg');
const flapSound = new Audio('src/assets/sounds/wing.ogg');
const hitSound = new Audio('src/assets/sounds/hit.ogg');
const dieSound = new Audio('src/assets/sounds/die.ogg');
const swooshSound = new Audio("src/assets/sounds/swoosh.ogg");

//* pipe
const pipeWidth = 90;
const pipeGap = 150;
const pipeSpeed = 4;
const PIPE_SPAWN_TIME = 2500;

const PIPE_PATH = "src/assets/sprites/pipes/";
const PIPE_FILES = ["pipe-green.png", "pipe-red.png"];
var pipeSprites = [];
var pipeImg = null;

const BG_PATH = "src/assets/sprites/bg/";
const BG_FILES = ["background-day.png", "background-night.png"];
var bgSprites = [];
var bgImg = null;

//* ground
const groundHeight = 80;
const GROUND_FILE = "src/assets/sprites/others/base.png";
var groundSprite = null;

//* bird
const bird = {
	width: 50,
	height: 35,
	x: 60,
	y: SCREEN_HEIGHT / 2,
	velocity: 0,
	gravity: 0.6,
	flapStrength: -10,
	rotation: 0,
	forceAngle: null
};

const BIRD_COLORS = ["red", "yellow", "blue"];
const BIRD_PATH = "src/assets/sprites/birds/";
var birdSpritesMap = {};
var birdImg = null;
var birdFrame = 1;
var frameCount = 0;

//* score
const NUMBER_PATH = "src/assets/sprites/score/";
const NUMBER_FILES = ["0.png","1.png","2.png","3.png","4.png","5.png","6.png","7.png","8.png","9.png"];
var numberSprites = [];

//* game over
const GAMEOVER_FILE = "src/assets/sprites/others/gameover.png";
var gameOverSprite = null;

//* get ready message
const GETREADY_FILE = "src/assets/sprites/others/message.png";
var getReadySprite = null;

//* restart button
const restartButton = {
	x: SCREEN_WIDTH / 2 - 100,
	y: SCREEN_HEIGHT / 2 + 50,
	width: 100,
	height: 50,
};


//* ground and bg scrolling.
var bgX = 0;
var groundX = 0;
var BG_SPEED_MULT = 0.2
var bgSpeed = pipeSpeed * BG_SPEED_MULT;
var groundSpeed = pipeSpeed;


//* game state 
var running = true;
var gameOver = false;
var pipes = [];
var passedPipes = [];
var score = 0;
var lastPipeTime = 0;
var groundOffset = 0;

var gameState = "start";
var startTime = 0;
var floatOffset = 0;
var gameScale = 1;

var birdXRatio = 0.09
var devicePixelRatio = window.devicePixelRatio || 1;
var currentScale = 1;
var offsetX = 0;
var offsetY = 0;

//* death animation variables.
var dead = false;
var deathTimer = 0;
var hitBounce = false;
var hitDirection = "down";
var startAngle = 50;
var angleTime = 20;
var angleFrame = 0;
var flashDuration = 8;
var flashTimer = 0;

const FLOAT_HEIGHT = 15;
const FLOAT_SPEED = 0.05;


//! ============================
//! ==== PRELOADING SPRITES ====
//! ============================

const loadImg = (src) => {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = reject;
		img.src = src;
	})
}

const loadBirdSprites = async () => {
	for (const color of BIRD_COLORS) {
		//* paths for three bird animation frames
		const up = `${BIRD_PATH}${color}bird-upflap.png`;
		const mid = `${BIRD_PATH}${color}bird-midflap.png`;
		const down = `${BIRD_PATH}${color}bird-downflap.png`;

		try {
			//* to load all 3 frames simultaneously.
			const imgs = await Promise.all([loadImg(up), loadImg(mid), loadImg(down)]);
			birdSpritesMap[color] = imgs;
		} catch (err) {
			console.warn('Failed to load bird sprites for', color, err);
			birdSpritesMap[color] = null; //*fallback to drawing rectangle
		}
	}
}

const loadPipeSprites = async () => {
	//* to load pipe sprites (red pipe, green pipe).
	const promises = PIPE_FILES.map(fname => loadImg(PIPE_PATH + fname).catch(err => {
		console.warn("Failed to load pipe sprite", fname, err);
		return null;
	}))

	const imgs = await Promise.all(promises);
	pipeSprites = imgs;
}

const loadBgSprites = async () => {
	//* to load background sprites (day and night)
	const promises = BG_FILES.map(fname => loadImg(BG_PATH + fname).catch(err => {
		console.warn("Failed to load bg sprite", fname, err);
		return null;
	}));

	const imgs = await Promise.all(promises);
	bgSprites = imgs;
}

const loadGroundSprites = async () => {
	//* to load the ground sprite.
	try {
		groundSprite = await loadImg(GROUND_FILE);
	} catch (err) {
		console.warn("Failed to load ground sprite", err);
		groundSprite = null;
	}
}

const loadNumberSprites = async () => {
	// to load number sprites for score (0-9).
	const promises = NUMBER_FILES.map(fname => loadImg(NUMBER_PATH + fname).catch(err => {
		console.warn("Failed to load number sprite", fname, err);
		return null;
	}))

	const imgs = await Promise.all(promises);
	numberSprites = imgs;
}

const loadGameOverSprite = async () => {
	//* to load the "Game Over" text sprite.
	try {
		gameOverSprite = await loadImg(GAMEOVER_FILE);
	} catch (err) {
		console.warn("Failed to load game over sprite", err);
		gameOverSprite = null;
	}
}

const loadGetReadySprite = async () => {
	//* to load the "Get ready" sprite.
	try {
		getReadySprite = await loadImg(GETREADY_FILE);
	} catch (err) {
		console.warn("Failed to load get ready sprite", err);
		getReadySprite = null;
	}
}



//! ==================================
//! ====== CORE GAME FUNCTIONS =======
//! ==================================

const gameStart = () => {
	gameState = "playing";
	running = true;
	startTime =performance.now();
}

const isMobile = () => {
	return window.innerWidth < 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

var scaleGroundHeight = groundHeight;
const resizeCanvas = () => {
	devicePixelRatio = window.devicePixelRatio || 1;

	//* to get the current window size.
	const cssWidth = window.innerWidth;
	const cssHeight = window.innerHeight;

	SCREEN_WIDTH = cssWidth;
	SCREEN_HEIGHT = cssHeight;

	//* to calculate global scale factor for all sprites.
	if (isMobile()) {
		//* scale based on screen size
		const scaleX = SCREEN_WIDTH / BASE_WIDTH;
		const scaleY = SCREEN_HEIGHT / BASE_HEIGHT;
		gameScale = Math.min(scaleX, scaleY);
		gameScale = Math.max(0.5, gameScale);
	} else {
		gameScale = 1
	}

	//* to make ground proportionally bigger on smaller screens
	if (isMobile()) {
		scaleGroundHeight = Math.max(groundHeight * gameScale, SCREEN_HEIGHT * 0.12);
	} else {
		scaleGroundHeight = groundHeight ;
	}
	
	currentScale = 1;

	offsetX = 0;
	offsetY = 0;

	//* set css size (how big the game appears on the screen)
	canvas.style.width = cssWidth + 'px';
	canvas.style.height = cssHeight + 'px';
	canvas.style.position = 'fixed';
	canvas.style.top = "0"
	canvas.style.left = "0";

	canvas.width = Math.floor(cssWidth * devicePixelRatio);
	canvas.height = Math.floor(cssHeight * devicePixelRatio);

	//* to scale the rendering context.
	ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

	//* to reposition bird based on every screen size.
	bird.x = Math.max(60, SCREEN_WIDTH * birdXRatio);

	//* to keep bird in a good position if screen got smaller.
	if (bird.y > SCREEN_HEIGHT / 2) {
        bird.y = SCREEN_HEIGHT / 2;
    }

	//* restart button positioning.
	restartButton.width = 110 * gameScale;
	restartButton.height = 60 * gameScale;
	restartButton.x = Math.round((SCREEN_WIDTH - restartButton.width) / 2);
	restartButton.y = Math.round(SCREEN_HEIGHT * 0.6);

};


const getPointer = (evt) => {
	const rect = canvas.getBoundingClientRect();

	//* to handle both mouse and touch events.
	const clientX = evt.touches && evt.touches[0] ? evt.touches[0].clientX : evt.clientX;
	const clientY = evt.touches && evt.touches[0] ? evt.touches[0].clientY : evt.clientY;

	//* to convert from screen coordinates to canvas coordinates
	const cssX = clientX - rect.left;
	const cssY = clientY - rect.top;

	const insideX = cssX - offsetX;
	const insideY = cssY - offsetY;

	//* to check if the click is within the game area.
	if (
		insideX < 0 ||
		insideY < 0 ||
		insideX > SCREEN_WIDTH * currentScale ||
		insideY > SCREEN_HEIGHT * currentScale
	) {
		return null;
	}

	const x = insideX / currentScale;
	const y = insideY / currentScale;
	return { x, y };
};

const spawnPipe = () => {
	const scaledPipeGap = pipeGap * gameScale;
	const scaledPipeWidth = pipeWidth * gameScale;

	const minTop = 100 * gameScale;
	const maxTop = SCREEN_HEIGHT - scaledPipeGap - scaleGroundHeight - (100 * gameScale);

	//* random height for the top pipe.
	const height = Math.random() * Math.max(0, maxTop - minTop) + minTop;

	//* to spawn pipes on the right side
	const spawnX = SCREEN_WIDTH + scaledPipeWidth;

	//* pick a random pipe sprite.
	const sprite = pipeImg || null;

	//* create top pipe
	const topPipe = {
		x: spawnX,
		y: 0,
		width: scaledPipeWidth,
		height: height,
		sprite: sprite
	};

	//* create bottom pipe
	const bottomPipe = {
		x: spawnX,
		y: height + scaledPipeGap,
		width: scaledPipeWidth,
		height: SCREEN_HEIGHT - (height + scaledPipeGap) - scaleGroundHeight,
		sprite: sprite
	};

	return [topPipe, bottomPipe];
};

const movePipes = () => {
	const scaledPipeWidth = pipeWidth * gameScale;

	//* looping backwards so we can safely remove pipes.
	for (var i = pipes.length - 1; i >= 0; i--) {
		//* move pipe left.
		pipes[i].x -= pipeSpeed ;

		//* removing the pipes that are not be able to see on screen.
		if (pipes[i].x + pipes[i].width < -scaledPipeWidth) {
			const removePipe = pipes[i];
			pipes.splice(i, 1);

			const passedIndex = passedPipes.indexOf(removePipe);
			if (passedIndex > -1) {
				passedPipes.splice(passedIndex, 1);
			}
		}
	}
};

const rectCollisions = (rect1, rect2) => {
	//* rectangles collission detection.
	return (
		rect1.x < rect2.x + rect2.width &&
		rect1.x + rect1.width > rect2.x &&
		rect1.y < rect2.y + rect2.height &&
		rect1.y + rect1.height > rect2.y
	);
};

const checkCollisions = () => {
	//* create bird's collision rectangle.
	const birdRect = {
		x: bird.x,
		y: bird.y,
		width: bird.width,
		height: bird.height,
	};
 
	//* to check the collisions with each pipe.
	for (var pipe of pipes) {
		if (rectCollisions(birdRect, pipe)) {
			//* DETERMINE HIT DIRECTION based on which part of pipe was hit.
			const birdCenterY = bird.y + bird.height / 2;
			const pipeCenterY = pipe.y + pipe.height / 2;

			//* to check if the bird hit the top part of bottom pipe.
			if (pipe.y > 0) {
				const pipeTopY = pipe.y;
				const hitTopPart = birdCenterY < pipeTopY + (pipe.height * 0.3);

				if(hitTopPart) {
					hitDirection = "up";
				} else {
					hitDirection = "down";
				}
			}

			hitSound.currentTime = 0;
			hitSound.play();

			dead = true;
			deathTimer = 30;
			flashTimer = flashDuration;
			return true;
		}
	}

	//* to check ground boundary
	
	if (bird.y + bird.height > SCREEN_HEIGHT - scaleGroundHeight) {
		//* hit and die sounds will play at the same time if the bird collides in ground.
		hitSound.currentTime = 0;
		hitSound.play();
		dieSound.currentTime = 0;
		dieSound.play();

		dead= true
		deathTimer = 0;
		flashTimer = flashDuration;
		return true;
	}

	//* to allow bird to fly above screen
	if (bird.y < -bird.height / 2) {
		bird.y = -bird.height / 2;
	}

	return false;
};

const updateScore = () => {
	//* to update the score when bird passes pipes.
	for (var pipe of pipes) {
		if (pipe.x + pipe.width < bird.x && !passedPipes.includes(pipe)) {
			score += 0.5;
			passedPipes.push(pipe);
			pointSound.currentTime = 0;
			pointSound.play();
		}
	}
};

const drawScore = (score) => {
	const scoreStr = Math.floor(score).toString();
	const digits = scoreStr.split("").map(d => parseInt(d, 10));

	//* scale digits based on screen size
	const digitWidth = (numberSprites[0]?.width || 30) * gameScale * 1.8;
	const digitHeight = (numberSprites[0]?.height || 40) * gameScale * 1.8;

	var totalWidth = digits.length * digitWidth;
	var startX = (SCREEN_WIDTH - totalWidth) / 2;
	var y ; //* score distance from top

	if (running) {
		y = Math.max(50, SCREEN_HEIGHT * 0.02);
	} else {
		y = SCREEN_HEIGHT * 0.45;
	}

	digits.forEach(digit => {
		const img = numberSprites[digit];
		if (img) {
			ctx.drawImage(img, startX, y, digitWidth, digitHeight);
		} else {
			ctx.fillStyle = "white";
			ctx.font = `${digitHeight}px Arial`;
			ctx.textAlign ="left";
			ctx.fillText(digit, startX, y + digitHeight);
		}
		startX += digitWidth;
	})
};

const drawRect = (x, y, width, height, color) => {
	ctx.fillStyle = color;
	ctx.fillRect(x, y, width, height);
};

const drawText = (text, x, y, color, fontSize = 72) => {
	ctx.fillStyle = color;
	ctx.font = `${fontSize}px Arial`;
	ctx.textAlign = 'center';
	ctx.fillText(text, x, y);
};

const drawBird = () => {
	const img = birdImg ? birdImg[birdFrame] : null;

	var birdY = bird.y ;
	var rotation = bird.rotation;

	if (gameState === "start") {
		birdY = bird.y + Math.sin(floatOffset) * (FLOAT_HEIGHT * gameScale);
		rotation = Math.sin(floatOffset * 0.5) * 5;

	} else if (dead && bird.forceAngle !== null) {
		rotation = bird.forceAngle;

	} else {
		var baseRotation = Math.max(-25, Math.min(45, bird.velocity * 2));

		var rotationMult = 1;
		if(isMobile()) {
			//* on mobile, increase rotation by inverse of gameScale
			rotationMult = 1 + (1 - gameScale) * 1.5;
			rotationMult = Math.max(1.2, rotationMult)
		}

		rotation = baseRotation *rotationMult;

		rotation = Math.max(-35, Math.min(60, rotation));
	}

	const angleRad = (rotation * Math.PI) / 180;

	//bird rotation
	ctx.save();

	const cx = bird.x + bird.width / 2;
	const cy = birdY + bird.height / 2;
	ctx.translate(cx, cy);
	ctx.rotate(angleRad);

	//draw bird
	if (img) {
		ctx.drawImage(img, -bird.width / 2, -bird.height / 2, bird.width, bird.height);
	} else {
		ctx.fillStyle = red;
		ctx.fillRect(-bird.width / 2, -bird.height / 2, bird.width, bird.height);
	}

	ctx.restore();
};

const drawGetReady = () => {
	if (getReadySprite) {
		//* calculating the size of the get ready message. 
		const width = 300;
		const height = 200;
		const x = (SCREEN_WIDTH - width) / 2;
		const y = (SCREEN_HEIGHT - height) / 2;
		
		ctx.drawImage(getReadySprite, x, y, width, height);
	}
}

const drawStartScreen = () => {
	ctx.save();
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = '#000'; 
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.restore();

	//* bg
	if (bgImg) {
		const scaledBgWidth = bgImg.width * gameScale;
		// const scaledBgHeight = bgImg.height * gameScale;
        const numBgTiles = Math.ceil(SCREEN_WIDTH / scaledBgWidth) + 1;
        
        for (var i = 0; i < numBgTiles; i++) {
			//* to add small overlap to prevent seams
			var x = Math.floor((bgX % scaledBgWidth) + (i * scaledBgWidth));

			var tileWidth = scaledBgWidth;
			if(i > 0) {
				x -= 1;
				tileWidth += 1;
			}
			if(i < numBgTiles - 1) {
				tileWidth += 1;
			}

            ctx.drawImage(bgImg, x, 0, tileWidth, SCREEN_HEIGHT);
        }
	} else {
		ctx.fillStyle = skyBlue;
		ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
	}

	//* draw floating bird
	drawBird();

	//* ground
	
	const groundY = SCREEN_HEIGHT - scaleGroundHeight;

	if (typeof groundSprite !== "undefined" && groundSprite) {
		const scaledGroundWidth = groundSprite.width * gameScale;
        const numGroundTiles = Math.ceil(SCREEN_WIDTH / scaledGroundWidth) + 2;
        
        for (var i = 0; i < numGroundTiles; i++) {
			var x = Math.floor((groundX % scaledGroundWidth) + (i * scaledGroundWidth));

			var tileWidth = scaledGroundWidth;
			if(i > 0) {
				x -= 1;
				tileWidth += 1;
			}
			if (i < numGroundTiles - 1) {
				tileWidth += 1;
			}
            ctx.drawImage(groundSprite, x, groundY, tileWidth, scaleGroundHeight);
        }
	} else {
		ctx.fillStyle = groundColor;
        ctx.fillRect(0, groundY, SCREEN_WIDTH, scaleGroundHeight);
	}

	//* draw get ready message
	if (getReadySprite) {
		const width = Math.min(300 * gameScale, SCREEN_WIDTH * 0.55);
		const height = width * (getReadySprite.height / getReadySprite.width); 
		const x = (SCREEN_WIDTH - width) / 2;
		const y = SCREEN_HEIGHT * 0.25;

		ctx.drawImage(getReadySprite, x, y, width, height)
	}else {
		const fontSize = Math.min(48, SCREEN_WIDTH / 12);
		const smallFontSize = Math.min(32, SCREEN_WIDTH / 18);

		drawText('Get Ready!', SCREEN_WIDTH / 2, SCREEN_HEIGHT * 0.35, white, fontSize);
		drawText('Tap to Start', SCREEN_WIDTH / 2, SCREEN_HEIGHT * 0.45, white, smallFontSize);
	}
}

const drawPipe = (pipe) => {
	const img = pipe.sprite;
	if (!img) {
		//fallback
		drawRect(pipe.x, pipe.y, pipe.width, pipe.height, green);
		return;
	}

	const SRC_CAP = 0.12;
	const DEST_CAP_MULTIPLIER = 0.80;
	const MIN_CAP = 6;
	const MAX_CAP = Math.round(pipe.width * 0.6);

	const srcCap = Math.max(1, Math.round(img.height * SRC_CAP));

	var destCap = Math.max(MIN_CAP, Math.round(pipe.width * DEST_CAP_MULTIPLIER));
	destCap = Math.min(destCap, MAX_CAP);

	//* to ensure the caps will fit into pipe height
	if (destCap * 2 > pipe.height) {
		destCap = Math.floor(pipe.height / 2);
	}

	const srcMiddleH = Math.max(0, img.height - srcCap * 2);
	const destMiddleH = Math.max(0, pipe.height - destCap * 2);

	//* draw bottom pipe
	if (pipe.y > 0) {
		ctx.drawImage(img, 0, 0, img.width, srcCap, pipe.x, pipe.y, pipe.width, destCap);

		if (destMiddleH > 0 && srcMiddleH > 0) {
      		ctx.drawImage(img, 0, srcCap, img.width, srcMiddleH, pipe.x, pipe.y + destCap, pipe.width, destMiddleH);
		}

		//* bottom cap
		ctx.drawImage(img, 0, img.height - srcCap, img.width, srcCap, pipe.x, pipe.y + destCap + destMiddleH, pipe.width, destCap);
    	return;
	}

	//* draw top pipe
	ctx.save();
	ctx.translate(pipe.x, pipe.height);
	ctx.scale(1, -1);
	ctx.drawImage(img, 0, 0, img.width, srcCap, 0, 0, pipe.width, destCap);

	if (destMiddleH > 0 && srcMiddleH > 0) {
		ctx.drawImage(img, 0, srcCap, img.width, srcMiddleH, 0, destCap, pipe.width, destMiddleH);
	}

	ctx.drawImage(img, 0, img.height - srcCap, img.width, srcCap, 0, destCap + destMiddleH, pipe.width, destCap);
  	ctx.restore();
}

const drawButton = () => {
	const x = restartButton.x;
	const y = restartButton.y;
	const width = restartButton.width;
	const height = restartButton.height;
	const cornerRad = 8 * gameScale;

	ctx.save();

	//* draw white gradient background box.
	const gradient = ctx.createLinearGradient(x, y, x, y + height);
	gradient.addColorStop(0, "#ffffff");
	gradient.addColorStop(1, "#d0d0d0");

	ctx.fillStyle = gradient;
	ctx.strokeStyle = "#b0b0b0";
	ctx.lineWidth = 1.5 * gameScale;

	ctx.beginPath();
	ctx.roundRect(x, y, width, height, cornerRad);
	ctx.fill();
	ctx.stroke();

	//* draw green triangle on the center.
	const centerX = x + width / 2;
	const centerY = y + height / 2;
	const triangleRad = 2 * gameScale;
	const triangleWidth = width * 0.2;
	const triangleHeight = height * 0.4;

	const leftX = centerX - triangleWidth * 0.4;
	const leftTopY = centerY - triangleWidth / 2;
	const leftBottomY = centerY + triangleHeight / 2;
	const rightX = centerX + triangleWidth * 0.4;
	const rightY = centerY;

	ctx.fillStyle = "#4caf50";
	ctx.strokeStyle = "#45a049";
	ctx.lineWidth = 1;
	ctx.lineJoin = "round";
	ctx.lineCap = "round"

	ctx.beginPath();
	
	//* triangle pointing right
	ctx.moveTo(leftX, leftTopY + triangleRad);

	ctx.quadraticCurveTo(leftX, leftTopY, leftX + triangleRad *1.2, leftTopY + triangleRad * 0.5);
	ctx.lineTo(rightX - triangleRad, rightY - triangleRad * 0.8);

	ctx.quadraticCurveTo(rightX + triangleRad * 1.2, rightY, rightX - triangleRad, rightY + triangleRad * 0.8);
	ctx.lineTo(leftX + triangleRad * 1.2, leftBottomY - triangleRad * 0.5);

	ctx.quadraticCurveTo(leftX, leftBottomY, leftX, leftBottomY - triangleRad);
	ctx.closePath();

	ctx.fill();
	ctx.stroke();

	//*inner shadow to the box for more depth
	ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.roundRect(x + 1, y + 1, width - 2, height - 2, cornerRad - 1);
	ctx.stroke();

	ctx.restore();

}

const drawFlashEffect = () => {
	if (flashTimer > 0) {
		ctx.save();
		ctx.globalAlpha = (flashTimer / flashDuration) * 0.5;
		ctx.fillStyle = "white";
		ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
		ctx.restore();
	}
}

const drawGame = (drawBirdOnTop = false) => {
	ctx.save();
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = '#000';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.restore();

	//* bg
	if (bgImg) {
		const scaledBgWidth = bgImg.width * gameScale;
        const numBgTiles = Math.ceil(SCREEN_WIDTH / scaledBgWidth) + 2;
        
        for (var i = 0; i < numBgTiles; i++) {
			var x = Math.floor((bgX % scaledBgWidth) + (i * scaledBgWidth));

			var tileWidth = scaledBgWidth;
			if (i > 0) {
				x -= 1;
				tileWidth += 1;
			}
			if (i < numBgTiles -1) {
				tileWidth += 1;
			}

            ctx.drawImage(bgImg, x, 0, tileWidth, SCREEN_HEIGHT);
        }
	} else {
		ctx.fillStyle = skyBlue;
		ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
	}

	//* bird
	if (!drawBirdOnTop) {
		drawBird();
	}

	//* pipes
	for (var pipe of pipes) {
		drawPipe(pipe);
	}

	//* ground
	
	const groundY = SCREEN_HEIGHT - scaleGroundHeight;

	if (typeof groundSprite !== "undefined" && groundSprite) {
		const scaledGroundWidth = groundSprite.width * gameScale;
        const numGroundTiles = Math.ceil(SCREEN_WIDTH / scaledGroundWidth) + 2;
        
        for (var i = 0; i < numGroundTiles; i++) {
			var x = Math.floor((groundX % scaledGroundWidth) + (i * scaledGroundWidth));

			var tileWidth = scaledGroundWidth;
			if (i > 0) {
				x -= 1;
				tileWidth += 1;
			}
			if (i < numGroundTiles - 1) {
				tileWidth += 1
			}

            ctx.drawImage(groundSprite, x, groundY, tileWidth, scaleGroundHeight);
        }
	} else {
		ctx.fillStyle = groundColor;
        ctx.fillRect(0, groundY, SCREEN_WIDTH, scaleGroundHeight);
	}

	if (drawBirdOnTop) {
		drawBird();
	}

	//* flash effect if the bird die.
	drawFlashEffect();

	// score
	drawScore(score);
};

const drawGameOver = () => {
	drawGame(true);

	if (gameOverSprite) {
		const gameOverWidth = Math.min(360 * gameScale, SCREEN_WIDTH * 0.8);
		const gameOverHeight = Math.min(60 * gameScale, gameOverWidth * (60/360));
		const gameOverX = (SCREEN_WIDTH - gameOverWidth) / 2;
		const gameOverY = SCREEN_HEIGHT * 0.28;

		ctx.drawImage(gameOverSprite, gameOverX, gameOverY, gameOverWidth, gameOverHeight);
	} else {
		//* fallback text if the game over sprite failed to load.
		const fontSize = Math.min(72, SCREEN_WIDTH / 8);
		drawText('Game Over', SCREEN_WIDTH / 2, SCREEN_HEIGHT * 0.3, white, fontSize);
	}
	
	drawScore(score);


	//* draw restart button
	drawButton()
};

const resetGame = () => {
	const color = BIRD_COLORS[Math.floor(Math.random() * BIRD_COLORS.length)];
	birdImg = birdSpritesMap[color] || null;

	//* to randomly pick pipe sprite every time the game reset
	if (pipeSprites && pipeSprites.length > 0) {
		var idx = Math.floor(Math.random() * pipeSprites.length);

		if (!pipeSprites[idx]) {
			const firstValid = pipeSprites.find(img => img !== null);
			idx = pipeSprites.indexOf(firstValid);
		}

		pipeImg = pipeSprites[idx] || null;
	} else {
		pipeImg = null;
	}

	//* to randomly pick background sprite every time the game reset.
	if (bgSprites && bgSprites.length > 0) {
		var idx = Math.floor(Math.random() * bgSprites.length);
		if (!bgSprites[idx]) {
			const firstValid = bgSprites.find(img => img !== null);
			idx = bgSprites.indexOf(firstValid);
		}
		bgImg = bgSprites[idx] || null;
	} else {
		bgImg = null;
	}

	//* scale bird
	bird.width = 50 * gameScale;
	bird.height = 35 * gameScale;

	birdFrame = 1;
	frameCount= 0;

	//* reset physics.
	bird.y = SCREEN_HEIGHT / 2;
	bird.x = Math.max(60, SCREEN_WIDTH * birdXRatio);
	bird.velocity = 0;
	bird.forceAngle = null;

	dead = false;
	deathTimer = 0;
	hitBounce = false;
	angleFrame = 0;
	flashTimer = 0;
	hitDirection ="down";

	pipes = [];
	passedPipes = [];
	score = 0;
	running = true;
	gameOver = false;
	gameState = "start";
	lastPipeTime = 0;
	startTime = 0;
	floatOffset = 0;

	bgX = 0;
	groundX = 0;
	bgSpeed = pipeSpeed * BG_SPEED_MULT;
	groundSpeed = pipeSpeed;

	canvas.style.cursor = "default";

};

const handleClick = (event) => {
	event.preventDefault(); //* to prevent zooming on mobile.

	const p = getPointer(event);
	if (!p) return;

	const clickX = p.x;
	const clickY = p.y;

	
	if (gameState === "start") {
		flapSound.currentTime = 0;
		flapSound.play();
		swooshSound.currentTime = 0;
		swooshSound.play();
		bird.velocity = bird.flapStrength * gameScale;
		gameStart();
	} else if (gameState === "gameOver") {
		//* to check if restart button was clicked
		const touchPadding = isMobile() ? 20 : 0;
		if (
			clickX >= restartButton.x - touchPadding &&
			clickX <= restartButton.x + restartButton.width + touchPadding &&
			clickY >= restartButton.y - touchPadding &&
			clickY <= restartButton.y + restartButton.height + touchPadding
		) {
			resetGame();
		}
	} else if (gameState === "playing" && !dead) {
		flapSound.currentTime = 0;
		flapSound.play();
		
		//* flap the bird
		bird.velocity = bird.flapStrength * gameScale;
	}
};

const gameLoop = (currentTime) => {
	if (gameState === "start") {

		floatOffset += FLOAT_SPEED;

		//* animate bird frames.
		frameCount++;
		if (frameCount % 10 === 0) {
			birdFrame = (birdFrame + 1) % 3;
		}

		//* scrolling for visual appeal (background)
		bgX -= bgSpeed * 0.3;
		groundX -= groundSpeed * 0.3;

		if (bgImg) {
			const bgWidth = bgImg.width * gameScale;
			if(bgX <= -bgWidth) {
				bgX = 0;
			}
		} else {
			if (bgX <= -SCREEN_WIDTH) {
				bgX = 0;
			}
		}

		//* scrolling for visual appeal (ground)
		if (groundSprite) {
			const groundWidth = groundSprite.width * gameScale;
			if(groundX <= -groundWidth) {
				groundX = 0;
			}
		} else {
			if (groundX <= -SCREEN_WIDTH) {
				groundX = 0;
			}
		}

		drawStartScreen();

	} else if (gameState === "playing")  {
		//* spawn pipes
		if (currentTime - lastPipeTime > PIPE_SPAWN_TIME) {
			pipes.push(...spawnPipe());
			lastPipeTime = currentTime;
		}

		//* update bird
		if (!dead) {
			bird.velocity += bird.gravity * gameScale;
			bird.y += bird.velocity;

		} else {
			//* to handle death animation.
			if (deathTimer > 0) {
				deathTimer -=1;

				//* transition angle animation
				const progress = angleFrame / angleTime;
				const ease = 1 - Math.pow(1 - progress, 2);
				
				if (hitDirection === "up") {
					//* face up
					bird.forceAngle = (1 - ease) * -startAngle;
				} else {
					//* face down
					bird.forceAngle = (1 - ease) * startAngle;
				}

				angleFrame += 1;

				//* bird bounce when hit.
				if(!hitBounce) {
					if (hitDirection === "up") {
						bird.velocity = -7.0 * gameScale;
					} else {
						bird.velocity = -5.5 * gameScale;
					}
					
					bird.y += bird.velocity;
					hitBounce = true;
				}

				dieSound.currentTime = 0;
				dieSound.play();

			} else {
				bird.forceAngle = null;
				bird.velocity += bird.gravity * gameScale;
				bird.y += bird.velocity;

				//* falling stop at the ground.
				
				if(bird.y + bird.height >= SCREEN_HEIGHT - scaleGroundHeight) {
					bird.y = SCREEN_HEIGHT - scaleGroundHeight - bird.height;
					// swooshSound.currentTime = 0;
					// swooshSound.play();

					if( flashTimer <= 0) {
						gameState ="gameOver";
						running = false;
						gameOver = true;
					}
				}
			}
		}

		frameCount++;
		if(frameCount % 5 === 0) {
			birdFrame = (birdFrame + 1) % 3;
		}

		//* full speed scrolling
		if (!dead) {
			bgX -= bgSpeed ;
			groundX -= groundSpeed ;

			if (bgImg) {
				const bgWidth = bgImg.width * gameScale;
				if(bgX <= -bgWidth) {
					bgX = 0;
				}
			} else {
				if (bgX <= -SCREEN_WIDTH) {
					bgX = 0;
				}
			}

			if (groundSprite) {
				const groundWidth = groundSprite.width * gameScale;
				if(groundX <= -groundWidth) {
					groundX = 0;
				}
			} else {
				if (groundX <= -SCREEN_WIDTH) {
					groundX = 0;
				}
			}

			movePipes();

			checkCollisions();

			updateScore();
		}

		if (flashTimer > 0) {
			flashTimer -= 1
		}

		drawGame(true);

	} else if(gameState === "gameOver") {
		drawGameOver();
	}

	requestAnimationFrame(gameLoop);
};



//! =========================
//! ==== EVENT LISTENERS ====
//! =========================

canvas.addEventListener('click', handleClick);

canvas.addEventListener('touchstart',(evt) => {
	evt.preventDefault();
	handleClick(evt);
}, { passive: false });

//* to show pointer cursor when hovering the restart button.
canvas.addEventListener("mousemove", (evt) => {
	const p = getPointer(evt);
	if(!p) {
		canvas.style.cursor = "default";
		return;
	}

	//* only show pointer when the restart button is visible.
	const overButton = (gameState === "gameOver") &&
	p.x >= restartButton.x &&
	p.x <= restartButton.x + restartButton.width &&
	p.y >= restartButton.y &&
	p.y <= restartButton.y + restartButton.height;

	canvas.style.cursor = overButton ? "pointer" : "default";
})


window.addEventListener('resize', resizeCanvas);
resizeCanvas();

Promise.all([
	loadBirdSprites(), 
	loadPipeSprites(), 
	loadBgSprites(), 
	loadGroundSprites(),
	loadNumberSprites(),
	loadGameOverSprite(),
	loadGetReadySprite(),
]).then(() => {
	resetGame();
	requestAnimationFrame(gameLoop);
}).catch((err) => {
	console.warn("Error loading sprites:", err);
	resetGame();
	requestAnimationFrame(gameLoop);
})

//* handling spacebar for flapping and others.
document.addEventListener('keydown', function (event) {
	if (event.code === "Space" && !event.repeat) {
		event.preventDefault();

		if (gameState === "start") {
			bird.velocity = bird.flapStrength * gameScale;
			flapSound.currentTime = 0;
			flapSound.play();
			gameStart();

		} else if (gameState === "gameOver") {
			resetGame();

		} else if (gameState === "playing" && !dead) {
			bird.velocity = bird.flapStrength * gameScale;
			flapSound.currentTime = 0;
			flapSound.play();
		}
	}
});

// resetGame();
// requestAnimationFrame(gameLoop);
