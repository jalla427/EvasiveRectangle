//Constants
var WIDTH = 600, HEIGHT = 600, ENTITYSTARTHEIGHT = 11;
//Controls
var UpKey = 87, DownKey = 83, LeftKey = 65, RightKey = 68, SpaceBar = 32;
//Variables
var canvas, context, keystate;
var player, score, highscore;
var enemyTileX, enemyTileW;
//Array Variables
var enemyList = [], tileList = [], tileMap = [];

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
        entity: "player",
        x: WIDTH - (WIDTH/5),
        y: HEIGHT - (ENTITYSTARTHEIGHT + 15),
        vx: 0,
        vy: 0,
        speedx: 5,
        speedy: 10,
        width: 10,
        height: 15,
        jumpDuration: 250,
        jumping: false,
        currentTileID: null,
        grounded: true,
        caught: false
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
                        Enemy(WIDTH/5, HEIGHT/3, 2, 10, 10, 15, enemyList.length + 1, 0, 500);
                }

                //Checks to see if the player has lost
                for(var id in enemyList)
                {
                        player.caught = checkContact(player, enemyList[id]);
                }

                //Important method calls
                update();
                draw();

                window.requestAnimationFrame(loop, canvas);
        }
        window.requestAnimationFrame(loop, canvas);
}

//Game loop methods
function init()
{
        //Initial Ground Tiles 
        //(x, y, width, height, elevation, moving, direction, speed, upperBoundary, lowerBoundary, id)
        /* Preparation for tile map, platform physics update required */
        var tileCount = (WIDTH/10) * (HEIGHT/10);
        //var counter = 0;
        var lentally = 0;
        var htally = 0;
        for(var counter = 0; counter < tileCount; counter++)
        {
                //If statement true push 1, else push 0
                tileMap.push(counter < (tileCount - (tileCount/60))?0:1);
        }
        
        // do
        // {
        //         if(counter < (tileCount - (tileCount/60)))
        //         {
        //                 tileMap[counter++] = 1;
        //         }
        //         else
        //         {
        //                 tileMap[counter++] = 0;
        //         }
        // }while(counter < tileCount);
        for(var ncounter = 0; ncounter < tileCount; ncounter++)
        {
                if(tileMap[ncounter] == 1)
                {
                        Tile(10 * lentally, 10 * htally, 10, 10, 1, false, null, 0, 0, 0, 0);
                }
                //Begins new row
                if((lentally % (WIDTH/10)) == 0 && lentally != 0)
                {
                        htally++;
                        lentally = 0;
                }
                else
                {
                        lentally++;
                }
        }

        /*
        Tile(0, HEIGHT - 11, WIDTH, 10, 1, false, null, 0, 0, 0, 0);
        Tile(125, HEIGHT - 60, 50, 10, 1, true, "y", 2, HEIGHT - 200, HEIGHT - 60, 1);
        Tile(325, HEIGHT - 60, 50, 10, 1, true, "y", 1, HEIGHT - 200, HEIGHT - 60, 2);
        Tile(125, HEIGHT - 250, 50, 10, 1, true, "x", 1, 125, 325, 3);
        Tile(0, HEIGHT - 250, 125, 10, 1, false, null, 0, 0, 0, 4);
        Tile(WIDTH - 125, HEIGHT - 250, 125, 10, 1, false, null, 0, 0, 0, 5);
        */
        //Initial Enemies 
        //(x, y, speedx, speedy, width, height, id, phaseCounter, phasePeriod)
        Enemy(WIDTH/5, HEIGHT - (ENTITYSTARTHEIGHT + 15), 2, 10, 10, 15, 0, 0, 500);
}         

//General functions to update and draw all objects
function update()
{ 
        updateScore();
        updateTiles();
        updatePlayer();
        updateEnemies();        
}

function draw()
{
        context.fillRect(0, 0, WIDTH, HEIGHT);
        context.save();
        context.fillStyle = "red";
 
        drawScore();
        drawTiles();
        drawPlayer();
        drawEnemies();  

        context.restore();
}

//Score/Highscore
function updateScore()
{
        //Detects if the enemy has player.caught the player
        if(player.caught == true)
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
        //Updates each frame
        player.vx = 0;
        player.vy = 0;
        //x-axis Key Presses
        if(keystate[LeftKey] && player.x > 0)
        {
              player.x -= player.speedx;   
        }
        if(keystate[RightKey] && player.x < WIDTH - player.width) 
        {
                player.x += player.speedx;
        }
        //Jumps on key press
        if(keystate[UpKey] && player.grounded) 
        {
                jump(player);
        }
        //Grounded
        player.grounded = groundCheck(player);
        //Gravity
        if(!player.grounded)
        { 
                player.y += player.speedy/2;
        }
        //Jumping
        if(player.jumping) 
        {
                player.y -= player.speedy;
        }
        //Ground allignment
        if(player.grounded == false)
        {
                player.speedx == 5;
                player.vy == 10;
        }
        if(player.grounded && typeof player.currentTileID != 'undefined')
        {
                //Keeps player level with platform
                tile = tileList[player.currentTileID];
                player.y = tile.y - player.height;

                //Accounts for friction with moving tiles
                if(tile.moving)
                {
                        if(tile.direction == "x")
                        {
                                if(tile.directTracker == true)
                                {
                                        player.vx -= (tile.speed - player.vx);
                                }
                                if(tile.directTracker == false)
                                {
                                        player.vx += (tile.speed + player.vx);
                                }
                        }
                }
        }
        //Adds Velocity
        player.x += player.vx;
        player.y += player.vy;
        
}

function drawPlayer()
{
        context.fillStyle = "blue";
        context.fillRect(player.x, player.y, player.width, player.height);
}

//Enemies
Enemy = function(x, y, speedx, speedy, width, height, id, phaseCounter, phasePeriod)
{
        var enemy = { 
                entity: "enemy", 
                x: x,
                y: y,
                vx: 0,
                vy: 0,
                speedx: speedx,
                speedy: speedy,
                width: width,
                height: height,
                id: id,
                bonusSpeed: 0,
                phaseCounter: phaseCounter,
                phasePeriod: phasePeriod,
                jumping: false,
                jumpDuration: 250,
                currentTileID: -1,
                grounded: false,
                wander: false,
                wanderDirection: true
        }
        enemyList.push(enemy);
}

function updateEnemies()
{
        for(var enemy of enemyList)
        {
                enemy.grounded = false;
                enemy.vx = 0;
                enemy.vy = 0;
                //Causes the enemy to wander if the player is not reachable
                if(enemy.currentTileID != player.currentTileID)
                {
                        enemy.wander = true;
                }
                else
                {
                        enemy.wander = false;
                }
                //Timer on increasing velocity
                enemy.phaseCounter++;
                //Periodically increase velocity of enemy
                if(enemy.phaseCounter > enemy.phasePeriod && enemy.bonusSpeed < 2)
                { 
                        enemy.bonusSpeed += 0.5, enemy.phaseCounter = 0; 
                }
                //Resets enemy/player/platforms if the player loses
                if(player.caught) 
                {
                        enemy.phaseCounter = 0, enemy.bonusSpeed = 0;
                        enemy.x = WIDTH/5;
                        enemy.y = HEIGHT - (ENTITYSTARTHEIGHT + player.height);
                        player.x = WIDTH - (WIDTH/5);
                        player.y = HEIGHT - (ENTITYSTARTHEIGHT + player.height);
                }
                //Checks all tiles to see if the enemy is grounded
                enemy.grounded = groundCheck(enemy);
                //Ground allignment
                if(enemy.grounded && typeof enemy.currentTileID != 'undefined')
                {
                        var tile = tileList[enemy.currentTileID];
                        enemy.y = tile.y - enemy.height;

                        //Accounts for friction with moving tiles
                        if(tile.moving)
                        {
                                if(tile.direction == "x")
                                {
                                        if(tile.directTracker == true)
                                        {
                                                enemy.vx -= (tile.speed - enemy.vx);
                                        }
                                        if(tile.directTracker == false)
                                        {
                                                enemy.vx += (tile.speed + enemy.vx);
                                        }
                                }
                        }
                }
                //Safeguard against no currentTileID
                try
                {
                        enemyTileX = tileList[enemy.currentTileID].x;
                        enemyTileW = tileList[enemy.currentTileID].width;
                }
                catch
                {
                        enemyTileX = enemy.x;
                        enemyTileW = 0;
                }
                //Follow the Player on x-axis
                if(enemy.wander == false)
                {
                        if(player.x > enemy.x && enemy.x < player.x + enemy.width) 
                        {
                                enemy.x += enemy.speedx + enemy.bonusSpeed; //Right
                                enemy.wanderDirection = false;
                        }
                        if(player.x < enemy.x && enemy.x > player.x - enemy.width) 
                        {
                                enemy.x -= enemy.speedx + enemy.bonusSpeed; //Left
                                enemy.wanderDirection = true;
                        }
                }
                //Wander when the player cannot be followed on the x-axis
                else
                {
                        if(enemy.x <= 0 || (player.y <= enemy.y && enemy.x < enemyTileX)) 
                        {
                                enemy.wanderDirection = false; //Left>Right
                        }
                        if(enemy.x >= WIDTH - enemy.width || 
                           (player.y <= enemy.y && enemy.x > enemyTileX + enemyTileW - enemy.width)) 
                        {
                                enemy.wanderDirection = true; //Right>Left
                        }
                        if(enemy.wanderDirection == true)
                        {
                                enemy.x -= enemy.speedx; //Left
                        }
                        else
                        {
                                enemy.x += enemy.speedx; //Right
                        }
                }
                //Jumping
                if(player.y < enemy.y)
                {
                        for(var tile of tileList)
                        {
                                if(tile.y < enemy.y - enemy.height && tile.y >= enemy.y - (3*enemy.height)
                                   && enemy.x + enemy.width >= tile.x - 4 && enemy.x < tile.x + tile.width + 4
                                   && enemy.grounded)
                                {
                                        jump(enemy);
                                }
                        }
                }
                if(player.y == enemy.y && enemy.currentTileID != player.currentTileID
                   && tileList[player.currentTileID].x <= enemyTileX + 2*enemyTileX
                   && tileList[player.currentTileID].x >= enemyTileX - enemyTileX
                   && enemy.grounded)
                {
                        jump(enemy);
                        enemy.currentTileID = player.currentTileID;
                }
                //Gravity
                if(!enemy.grounded)
                {
                        enemy.vy = enemy.speedy/2;
                }
                if(enemy.jumping) 
                {
                        enemy.vy -= enemy.speedy;
                }
                //Adds Velocity
                enemy.y += enemy.vy;
                enemy.x += enemy.vx;
        }

        //Removes extra enemies if player is player.caught
        if(player.caught)
        {
                while(enemyList.length > 1)
                {
                        enemyList.pop();
                }
                player.caught = false;
        }
}

function drawEnemies()
{
        context.fillStyle = "red";

        for(var enemy of enemyList)
        {
                //var enemy = enemyList[id];

                context.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        }
}

//Tiles
Tile = function(x, y, width, height, elevation, moving, direction, speed, upBound, downBound, id)
{
        tile = {
                x: x,
                y: y,
                yinit: y,
                width: width,
                height: height,
                elevation: elevation,
                moving: moving,
                direction: direction,
                directTracker: false,
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
                for(var tile of tileList)
                {
                        context.fillRect(tile.x, tile.y, 
                                tile.width, tile.height);
                }
        }
}

//game mechanic methods
function jump(entity) 
{       
        //Does nothing if a jump is already in progress            
        if (!entity.jumping) 
        {
                entity.jumping = true;
                //Calls method land after jumpDuration amount of time
                setTimeout(land, entity.jumpDuration, entity);
        }
}

//Called by method jump to allow a new jump
function land(entity) 
{                
        entity.jumping = false;
}

//Checks to see if entity1 is touching entity2
function checkContact(entity1, entity2)
{
        //Checks for x
        if (entity1.x >= entity2.x - entity2.width && entity1.x <= entity2.x + entity2.width) 
        {
                //Checks for y
                if (entity1.y >= entity2.y - entity2.height 
                    && entity1.y <= entity2.y + entity2.height) 
                {
                        var contact = true; 
                }
        }
        //If true, contact is made
        return contact;
}

//Checks to see if the player is on a tile
function groundCheck(entity)
{
        //Checks all tiles to see if the player is grounded
        for(var tile of tileList)
        {
                //Checks for x
                if (entity.x >= tile.x - entity.width + 1 && 
                        entity.x < tile.x + tile.width) 
                {
                        //Checks for y
                        if (entity.y >= tile.y - tile.height - 10 && 
                                        entity.y < tile.y + tile.height/4) 
                        {
                               var contact = true; 
                        }
                }
                //If true, contact is made
                if(entity.entity == "player")
                {
                        if(contact && !player.jumping)
                        {
                                //Also sets the specific tile's ID to a variable
                                entity.currentTileID = tile.id;
                                return true;
                        }
                }
                if(entity.entity == "enemy")
                {
                        if(contact && !entity.grounded)
                        {
                                //Also sets the specific tile's ID to a variable
                                entity.currentTileID = tile.id;
                                return true;
                        }
                }
                
        }
        return false;
}

//Moves a tile
//If called in loop, makes the tile a moving tile
function movingTile()
{
        //loops through all tiles
        for(var tile of tileList)
        {
                //checks if tile is supposed to be moving
                if(tile.moving == true)
                {
                        if(tile.direction == "y")
                        {
                                //Moves the tile up/down and keeps it in range
                                //for tile.direction true = up, false = down
                                if(tile.directTracker == true)
                                {
                                        tile.y -= tile.speed;

                                        if(tile.y <= tile.upBound)
                                        {
                                                tile.directTracker = false;
                                        }
                                }
                                else
                                {
                                        tile.y += tile.speed;

                                        if(tile.y >= tile.downBound)
                                        {
                                                tile.directTracker = true;
                                        }
                                }
                        }

                        if(tile.direction == "x")
                        {
                                //Moves the tile left/right and keeps it in range
                                //for tile.direction true = right, false = left
                                if(tile.directTracker == true)
                                {
                                        tile.x -= tile.speed;

                                        if(tile.x <= tile.upBound)
                                        {
                                                tile.directTracker = false;
                                        }
                                }
                                else
                                {
                                        tile.x += tile.speed;

                                        if(tile.x >= tile.downBound)
                                        {
                                                tile.directTracker = true;
                                        }
                                }
                        }
                }
        }
}

//Main method call
main(); 