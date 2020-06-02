
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
        vx: null,
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
                        Enemy(WIDTH/5, HEIGHT/3, 
                                2, null, 10, 15, enemyList.length + 1, 0, 500);
                }

                //Checks to see if the player has lost
                for(var id in enemyList)
                {
                        caught = checkContact(player, enemyList[id]);
                }

                //Important method calls
                grounded = groundCheck();
                update();
                draw();

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

        //Not yet used
        player.vel = {
                x: player.vx,
                y: player.vy
        }

        //First Ground Tile (x, y, width, height, elevation, id)
        Tile(0, HEIGHT - 11, 500, 10, 1, 0);

        //First Enemy (x, y, vx, vy, width, height, id, phaseCounter, phasePeriod)
        Enemy(WIDTH/5, HEIGHT - (ENTITYSTARTHEIGHT + 15), 
                2, null, 10, 15, 0, 0, 500);
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
        if (caught == true)
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
        if (score.scoreKeeper < 999999) 
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
        if (keystate[LeftKey] && player.x > 0)
        {
              player.x -= 5;   
        }
        if (keystate[RightKey] && player.x < WIDTH - player.width) 
        {
                player.x += 5;
        }
        //Jumps on key press
        if (keystate[UpKey] && grounded) 
        {
                jump();
        }
        //Ground allignment
        if(grounded && typeof currentTileID != 'undefined')
        {
                player.y = HEIGHT - (tileList[currentTileID].height + player.height + 1);
        }
        //Gravity
        if (!grounded)
        { 
                player.y += fallSpeed;
        }
        //Jumping
        if (jumping) 
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
                jumping: false
        }
        enemyList[id] = enemy;

        //enemy = {  
                //x: null,
                //y: null,
                //vx: 2,
                //vy: null,
                //width: 10,
                //height: 15,
                //id: Math.random(),
                //phaseCounter: 0,
                //phasePeriod: 500
        //}
}

function updateEnemies ()
{
        for(var id in enemyList)
        {
                var enemy = enemyList[id];
                
                //Timer on increasing velocity
                enemy.phaseCounter++;
                //Follow the Player on x-axis
                if (player.x > enemy.x && enemy.x < player.x - enemy.width) 
                {
                        enemy.x += enemy.vx;
                }
                if (player.x < enemy.x && enemy.x > player.x + enemy.width) 
                {
                        enemy.x -= enemy.vx;
                }
                //Follows the Player on y-axis
                if(player.y > enemy.y)
                {
                        
                }
                //Periodically increase velocity of enemy
                if (enemy.phaseCounter > enemy.phasePeriod && enemy.vx < 4)
                { 
                        enemy.vx += 0.5, enemy.phaseCounter = 0; 
                }
                //Resets enemy/player if the player loses
                if (caught) 
                {
                        enemy.phaseCounter = 0, enemy.vx = 2;
                        enemy.x = WIDTH/5;
                        enemy.y = HEIGHT - (ENTITYSTARTHEIGHT + player.height);
                        player.x = WIDTH - (WIDTH/5);
                        player.y = HEIGHT - (ENTITYSTARTHEIGHT + player.height);
                }
                //Gravity
                if (enemy.y < HEIGHT - (ENTITYSTARTHEIGHT + enemy.height))
                { 
                        enemy.y += 2.5;
                }
                //Re-allignment with tile upon landing
                if (enemy.y > HEIGHT - (ENTITYSTARTHEIGHT + enemy.height))
                {
                        enemy.y = HEIGHT - (ENTITYSTARTHEIGHT + enemy.height);
                }
        }

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
Tile = function(x, y, width, height, elevation, id)
{
        tile = {
                x: x,
                y: y,
                width: width,
                height: height,
                elevation: elevation,
                id: id
        }
        tileList[id] = tile;

        /*
        tile = {
                x: null,
                y: null,
                width: 500,
                height: 10,
                elevation: 1
        }
        */

}

function updateTiles()
{
        //Nothing really needs to be updated here yet
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

function land() 
{                
        jumping = false;
}

function checkContact(entity1, entity2)
{
        //Checks to see if entity1 is touching entity2
        if (entity1.x >= entity2.x - entity2.width && entity1.x <= entity2.x + entity2.width) //Checks for x
        {
                if (entity1.y >= entity2.y - entity2.height) 
                {
                        var contact = true; //Checks for y
                }
        }
        //If true, contact is made
        return contact;
}

function groundCheck()
{
        //Checks all tiles to see if the player is grounded
        for(var tile = 0; tile < tileList.length; tile++)
        {

                //Checks to see if player is touching tile
                if (player.x >= tileList[tile].x - tileList[tile].width && 
                        player.x <= tileList[tile].x + tileList[tile].width) //Checks for x
                {
                        if (player.y >= tileList[tile].y - tileList[tile].height - 10) 
                        {
                               var contact = true; //Checks for y
                        }
                }
                //If true, contact is made
                if(contact)
                {
                        currentTileID = tileList[tile].id;
                        return true;
                }
        }
        return false;
}

main(); 