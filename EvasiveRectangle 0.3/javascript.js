
//Variables
var WIDTH = 500, HEIGHT = 500, ENTITYSTARTHEIGHT = 11;
var UpKey = 87, DownKey = 83, LeftKey = 65, RightKey = 68, SpaceBar = 32;
var pi=Math.PI;
var enemyList = [], tileList = [];
var canvas, context, keystate;
var player, score, highscore, currentTile;
//Player variables
var caught = false, jumping = false, grounded = true;
var jumpDuration = 250, jumpSpeed = 10, fallSpeed = 5;

//Objects
//Enemy/Tile objects are located below in their own class
score = {
        x: WIDTH - 100,
        y: 10,
        width: 10,
        height: 10,
        scoreKeeper: -1,
        text: null
}

highscore = {
        x: WIDTH - 100,
        y: 20,
        width: 10,
        height: 10,
        scoreKeeper: 0,
        text: null
}

player = {
        x: null,
        y: null,
        vx: 5,
        vy: null,
        width: 10,
        height: 15,
        jumpHeight: 30,
        grounded: true,
}

//Main method (executes all other primary methods)
function main() 
{
        //Create canvas
        canvas = document.createElement("canvas");
        canvas.width = WIDTH;
        canvas.height = HEIGHT;
        context = canvas.getContext("2d");
        document.body.appendChild(canvas);

        //Setup for key presses
        keystate = {};
        document.addEventListener("keydown", function(evt) {
                keystate[evt.keyCode] = true;
        });
        document.addEventListener("keyup", function(evt) {
                delete keystate[evt.keyCode];
        });

        //Initialize
        init();

        //Main game loop
        var loop = function()
        {
                //Adds extra enemy if player is doing well
                if(score.scoreKeeper == 1000)
                {
                        Enemy(WIDTH/5, HEIGHT/3, 2, 2.5, 10, 15, enemyList.length + 1, 0, 500);
                }

                //Checks to see if the player has lost
                for(var id in enemyList)
                {
                        caught = checkContact(player, enemyList[id]);
                }

                //Important method calls
                update();
                draw();
                grounded = groundCheck();

                window.requestAnimationFrame(loop, canvas);
        }
        window.requestAnimationFrame(loop, canvas);
}

//Game loop methods
function init()
{
        //Player
        player.x = WIDTH - (WIDTH/5);
        player.y = HEIGHT - (ENTITYSTARTHEIGHT + player.height);

        //Initial Ground Tiles (x, y, width, height, elevation, moving, speed, upperBoundary, lowerBoundary, id)
        Tile(0, HEIGHT - 11, 500, 10, 1, false, 0, 0, 0, 0);
        Tile(125, HEIGHT - 60, 50, 10, 1, true, 2, HEIGHT - 200, HEIGHT - 60, 1);
        Tile(325, HEIGHT - 60, 50, 10, 1, true, 1, HEIGHT - 200, HEIGHT - 60, 2);

        //First Enemy (x, y, vx, vy, width, height, id, phaseCounter, phasePeriod)
        Enemy(WIDTH/5, HEIGHT - (ENTITYSTARTHEIGHT + 15), 2, 2.5, 10, 15, 0, 0, 500);
}         

//General functions to update and draw all objects
function update()
{ 
        updateScore();
        updatePlayer();
        updateEnemies(); 
        updateTiles();   
}

function draw()
{
        context.fillRect(0, 0, WIDTH, HEIGHT);
        context.save();
        context.fillStyle = "red";
 
        drawScore();
        drawPlayer();
        drawEnemies();  
        drawTiles();

        context.restore();
}

//Score/Highscore
function updateScore()
{
        //Detects if the enemy has caught the player
        if(caught == true)
        {
                //Updates highscore if necessary
                if(score.scoreKeeper > highscore.scoreKeeper)
                {
                        highscore.scoreKeeper = score.scoreKeeper;  
                };
                //Resets score
                score.scoreKeeper = -1;
        }
        //Sets maximum score obtainable
        if(score.scoreKeeper < 999999) 
        {
                //Increases score by one every frame the player is alive
                score.scoreKeeper++;
        }
        //Updates on screen score counter
        score.text = "Score: " + score.scoreKeeper;

        //Update on screen Highscore record
        highscore.text = "Highscore: " + highscore.scoreKeeper;     
}

function drawScore()
{
        //Score
        context.fillStyle = "white";
        context.fillText(score.text, score.x, score.y);

        //Highscore
        context.fillStyle = "white";
        context.fillText(highscore.text, highscore.x, highscore.y);
}

//Player
function updatePlayer()
{
        //x-axis Key Presses
        if(keystate[LeftKey] && player.x > 0)
        {
              player.x -= player.vx;   
        }
        if(keystate[RightKey] && player.x < WIDTH - player.width) 
        {
                player.x += player.vx;
        }
        //Jumps on key press
        if(keystate[UpKey] && grounded) 
        {
                jump();
        }
        //Ground allignment
        if(grounded && typeof currentTileID != 'undefined')
        {
                player.y = tileList[currentTileID].y - player.height;
        }
        //Gravity
        if(!grounded)
        { 
                player.y += fallSpeed;
        }
        //Jumping
        if(jumping) 
        {
                player.y -= jumpSpeed;
        }
}

function drawPlayer()
{
        context.fillStyle = "blue";
        context.fillRect(player.x, player.y, player.width, player.height);
}

//Enemies
Enemy = function(x, y, vx, vy, width, height, id, phaseCounter, phasePeriod)
{
        var enemy = {  
                x: x,
                y: y,
                vx: vx,
                vy: vy,
                width: width,
                height: height,
                id: id,
                phaseCounter: phaseCounter,
                phasePeriod: phasePeriod,
                jumping: false,
                currentTileID: null
        }
        enemyList.push(enemy);
}

function updateEnemies ()
{
        for(var enemy of enemyList)
        {
                enemyGrounded = false;
                
                //Timer on increasing velocity
                enemy.phaseCounter++;
                //Follow the Player on x-axis
                if(player.x > enemy.x && enemy.x < player.x - enemy.width) 
                {
                        enemy.x += enemy.vx;
                }
                if(player.x < enemy.x && enemy.x > player.x + enemy.width) 
                {
                        enemy.x -= enemy.vx;
                }
                //Follows the Player on y-axis
                if(player.y > enemy.y)
                {
                      //Not currently in use  
                }
                //Periodically increase velocity of enemy
                if(enemy.phaseCounter > enemy.phasePeriod && enemy.vx < 4)
                { 
                        enemy.vx += 0.5, enemy.phaseCounter = 0; 
                }
                //Resets enemy/player/platforms if the player loses
                if(caught) 
                {
                        enemy.phaseCounter = 0, enemy.vx = 2;
                        enemy.x = WIDTH/5;
                        enemy.y = HEIGHT - (ENTITYSTARTHEIGHT + player.height);
                        player.x = WIDTH - (WIDTH/5);
                        player.y = HEIGHT - (ENTITYSTARTHEIGHT + player.height);
                }
                //Checks all tiles to see if the enemy is grounded
                for(var tile = 0; tile < tileList.length; tile++)
                {
                        var contact = false;
                        //Checks for x
                        if (enemy.x >= tileList[tile].x - enemy.width + 1 && 
                                enemy.x < tileList[tile].x + tileList[tile].width) 
                        {
                                //Checks for y
                                if (enemy.y >= tileList[tile].y - tileList[tile].height - 10 && 
                                                enemy.y < tileList[tile].y + tileList[tile].height) 
                                {
                                        contact = true; 
                                }
                        }
                        //If true, contact is made
                        if(contact && !enemyGrounded)
                        {
                                //Also sets the specific tile's ID to a variable
                                enemy.currentTileID = tileList[tile].id;
                                console.log("contact")
                                enemyGrounded = true;
                        }
                }
                //Ground allignment
                if(enemyGrounded && typeof enemy.currentTileID != 'undefined')
                {
                        enemy.y = tileList[enemy.currentTileID].y - enemy.height;
                }
                //Gravity
                if(!enemyGrounded)
                { 
                        enemy.y += enemy.vy;
                }
        }

        //removes extra enemies if player is caught
        if(caught)
        {
                while(enemyList.length > 1)
                {
                        enemyList.pop();
                }
                caught = false;
        }
}

function drawEnemies ()
{
        context.fillStyle = "red";

        for(var id in enemyList)
        {
                var enemy = enemyList[id];

                context.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        }
}

//Tiles
Tile = function(x, y, width, height, elevation, moving, speed, upBound, downBound, id)
{
        tile = {
                x: x,
                y: y,
                yinit: y,
                width: width,
                height: height,
                elevation: elevation,
                moving: moving,
                direction: false,
                speed: speed,
                upBound: upBound,
                downBound: downBound,
                id: id
        }
        tileList.push(tile);
}

function updateTiles()
{
        movingTile();
}

function drawTiles()
{
        context.fillStyle = "white";

        if(tileList.length > 0)
        {
                for(var tile = 0; tile < tileList.length; tile++)
                {
                        context.fillRect(tileList[tile].x, tileList[tile].y, 
                                tileList[tile].width, tileList[tile].height);
                }
        }
}

//game mechanic methods
function jump() 
{       
        //Does nothing if a jump is already in progress            
        if (!jumping) 
        {
                jumping = true;
                //Calls method land after jumpDuration amount of time
                setTimeout(land, jumpDuration);
        }
}

//Called by method jump to allow a new jump
function land() 
{                
        jumping = false;
}

//Checks to see if entity1 is touching entity2
function checkContact(entity1, entity2)
{
        //Checks for x
        if (entity1.x >= entity2.x - entity2.width && entity1.x <= entity2.x + entity2.width) 
        {
                //Checks for y
                if (entity1.y >= entity2.y - entity2.height && entity1.y <= entity2.y + entity2.height) 
                {
                        var contact = true; 
                }
        }
        //If true, contact is made
        return contact;
}

//Checks to see if the player is on a tile
function groundCheck()
{
        //Checks all tiles to see if the player is grounded
        for(var tile of tileList)
        {
                //Checks for x
                if (player.x >= tile.x - player.width + 1 && 
                        player.x < tile.x + tile.width) 
                {
                        //Checks for y
                        if (player.y >= tile.y - tile.height - 10 && 
                                        player.y < tile.y + tile.height) 
                        {
                               var contact = true; 
                        }
                }
                //If true, contact is made
                if(contact && !jumping)
                {
                        //Also sets the specific tile's ID to a variable
                        currentTileID = tile.id;
                        return true;
                }
        }
        return false;
}

//Moves a tile
//If called in loop, makes the tile a moving tile
function movingTile()
{
        //loops through all tiles
        for(var id in tileList)
        {
                tile = tileList[id];
                //checks if tile is supposed to be moving
                if(tile.moving == true)
                {
                        //Moves the tile up/down and keeps it in range
                        //for tile.direction true = up, false = down
                        if(tile.direction == true)
                        {
                                tile.y -= tile.speed;

                                if(tile.y <= tile.upBound)
                                {
                                        tile.direction = false;
                                }
                        }
                        else
                        {
                                tile.y += tile.speed;

                                if(tile.y >= tile.downBound)
                                {
                                        tile.direction = true;
                                }
                        }
                }
        }
}

//Main method call
main(); 