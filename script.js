const NUM_DOTS = 100;
const MOVEMENT_SPEED = 0.25;
const difficulty = 1.5; //EASY: 2, MED: 1.5, HARD: 1

var tracker;
var centeredPos = [];
var moveX = 0;
var moveY = 0;
var mode = "start";
var dots = [];
var ballSize = 10;
var player;
var offsetTop;
var offsetLeft;
const minW = -0.75 * (0.5) * window.innerWidth;
const maxW = 0.75 * (1.5) * window.innerWidth;
const minH = -(0.5) * window.innerHeight;
const maxH = (1.5) * window.innerHeight;
var restartImg;

function setup() {

    //Setup Camera and Face Tracker
    var videoInput = createCapture();
    videoInput.size(windowWidth * 0.25, windowWidth * 0.25 * (480 / 640));
    offsetLeft = windowWidth * 0.75;
    offsetTop = windowHeight - windowWidth * 0.25 * (480 / 640);
    videoInput.position(offsetLeft, offsetTop);
    videoInput.style("transform", "scaleX(-1)");
    videoInput.style("z-index", "-1");
    tracker = new clm.tracker();
    tracker.init();
    tracker.start(videoInput.elt);

    //Setup Canvas in front of camera
    var canvas = createCanvas(windowWidth, windowHeight);

    //Setup Restart Image
    imageMode(CENTER)
    restartImg = loadImage("restart.png");

    //Setup Ball
    player = new Ball(width * 0.75 / 2, height / 2, ballSize, "red");
    moveX = 0;
    moveY = 0;

    //Set Display Settings
    fill(0);
    noStroke();
    ellipseMode(CENTER);
}

function draw() {
    clear();
    fill("#DFFFFF")
    rect(0, 0, width * 0.75, height)
        //Draw Game Mode
    switch (mode) {
        case "game":
            drawGame();
            break;
        case "start":
            drawStart();
            break;
        case "end":
            gameOver();
            break;
        case "win":
            gameWin();
            break;
    }
    fill("white");
    rect(width * 0.75, 0, width * 0.25, offsetTop)
    showFace(tracker.getCurrentPosition());

    //Draw Score and Balls Left
    text("SCORE", offsetLeft + 40, 30);
    push();
    textSize(100);
    text(Math.floor(player.radius - ballSize), offsetLeft + width / 8, 100);
    pop();
    text("BALLS LEFT", offsetLeft + 40, 150);
    push();
    textSize(100);
    text(dots.length, offsetLeft + width / 8, 220);
    pop();
}

function mousePressed() {
    if (mouseX < width * 0.75) {
        if (mode == "start") {
            startGame();
        }
        if (mode == "end") {
            restartGame();
        }
    }
}


function startGame() {
    //Start game
    mode = "game";

    //Store current position as center
    centeredPos = tracker.getCurrentPosition()[62];

    //Create Dots
    for (var i = 1; i < NUM_DOTS + 1; i++) {
        var radius = ballSize ^ (i / difficulty);
        var tempBall = {
            radius: radius,
            color: [floor(random() * 255), floor(random() * 255), floor(random() * 255)]
        }
        newXY(tempBall)
        while (true) {
            var changed = false;
            for (var dot of dots) {
                if (dot.collide(tempBall)) {
                    newXY(tempBall);
                    changed = true;
                }
            }
            if (player.collide(tempBall)) {
                newXY(tempBall);
                changed = true;
            }
            if (!changed) {
                break;
            }
        }
        var tempBall = new Ball(tempBall.x, tempBall.y, tempBall.radius, tempBall.color);
        dots.push(tempBall);
    }
}

function drawStart() {
    if (tracker.getCurrentPosition()) {
        textAlign(CENTER);
        fill("black")
        text("Click The Dot", width * 0.75 / 2, height / 2 - 30);
        fill(player.color)
        ellipse(player.x, player.y, player.radius * 2);
    }
}

function drawGame() {
    //If all dots are gone show win screen
    if (dots.length == 0) {
        mode = "win";
    }


    //Get array of face marker positions [x, y]
    var positions = tracker.getCurrentPosition()[62];
    if (centeredPos && centeredPos[0] && positions && positions[0]) {

        //Set moveX and moveY based on how far the nose is off of its default value
        moveX = limit(moveX - (centeredPos[0] - positions[0]) * MOVEMENT_SPEED * (width * 0.75 / 400), maxW + width * (0.375), minW - width * (1.125));
        moveY = limit(moveY + (centeredPos[1] - positions[1]) * MOVEMENT_SPEED * (height / 300), maxH + height / 2, minH - height * 1.5);
    }
    //Display dots on screen
    for (var dot of dots) {
        fill(dot.color);
        ellipse(dot.x + moveX / 2, dot.y + moveY / 2, dot.radius * 2);
        player.x = width * (0.75) / 2 - moveX / 2;
        player.y = height / 2 - moveY / 2;
        //Check Collision
        if (player.collide(dot)) {
            if (player.radius + 1 > dot.radius) {
                //Eat the dot: grow ball and remove dot
                player.radius = sqrt(dot.radius * dot.radius + player.radius * player.radius);
                dots.splice(dots.indexOf(dot), 1);
            } else {
                mode = "end";
            }
        }
    }
    //Draw player ball to screen
    push();
    fill(player.color);
    ellipse(width * 0.75 / 2, height / 2, player.radius * 2);
    pop();
}

/**
 * Draw's win screen
 */
function gameWin() {
    fill(0, 0, 0, 200);
    rect(0, 0, width, height);
    image(restartImg, width * 0.375, height / 2, 100, 100);
}

/**
 * Draws game over screen
 */
function gameOver() {
    //Draw Balls
    for (var dot of dots) {
        fill(dot.color);
        ellipse(dot.x + moveX / 2, dot.y + moveY / 2, dot.radius * 2);
    }
    //Draw Player
    push();
    fill(player.color);
    ellipse(width * 0.75 / 2, height / 2, player.radius * 2);
    pop();

    fill(0, 0, 0, 200);
    rect(0, 0, width, height);
    image(restartImg, width * 0.375, height / 2, 100, 100);
}
/**
 * Restarts the game
 */
function restartGame() {
    moveX = 0;
    moveY = 0;
    mode = "start";
    dots = [];
    ballSize = 10;

    setup();
}



/*
 *Helper Functions
 */


/**
 * Masks a variable"s value between two numbers
 * @param   {Number} val     The variable to be masked
 * @param   {Number} max     The max number to be returned
 * @param   {Number} [min=0] Optional. The min number to be returned
 * @returns {Number} The masked value.
 */
function limit(val, max, min) {
    min = min || 0;
    return Math.min(Math.max(parseInt(val), min), max);
}

/**
 * Draws face from points
 * @param {Array} positions An array of points to draw face from
 */
function showFace(positions) {
    for (var i = 0; i < positions.length; i++) {
        fill("green")
        const flipFactor = width * 0.25 / 2;
        var xPos = -(positions[i][0] - width * 0.25 / 2) + width * 0.25 / 2;
        ellipse(xPos + offsetLeft, positions[i][1] + offsetTop, 4);
    }
}

/**
 * Generates a new X and Y and stores it on object
 * @param {object} obj The object to store the new X and Y on
 */
function newXY(obj) {
    obj.x = Math.random() * (maxW - obj.radius * 2 - minW) + minW + obj.radius;
    obj.y = Math.random() * (maxH - obj.radius * 2 - minH) + minH + obj.radius;
}
