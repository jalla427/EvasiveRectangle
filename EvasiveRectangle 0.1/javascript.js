
//Constants
var WIDTH = 500, HEIGHT = 500;
var UpArrow = 38, DownArrow = 40, LeftArrow = 37, RightArrow = 39, SpaceBar = 32;
var pi=Math.PI;
var canvas, context, keystate;
var player, enemy, ground, score, highscore;
var jumping; 
var contact = false;

player = {
        x: null,
        y: null,
        vx: null,
        vy: null,
        width: 10,
        height: 15,
        jumpHeight: 30,
        update: function() {
                if (keystate[LeftArrow] && this.x > 0) this.x -= 5;
                if (keystate[RightArrow] && this.x < WIDTH - player.width) this.x += 5;
                if (keystate[UpArrow] && 
                        this.y >= HEIGHT - (ground.height + player.height + 1)) jump();
                if (this.y < HEIGHT - (ground.height + player.height + 1)) 
                                                        this.y += 2.5;
                if (jumping) this.y -= 5;
                if (this.y > HEIGHT - (ground.height + player.height + 1)) 
                        player.y = HEIGHT - (ground.height + player.height + 1);
                this.x += this.vel.x;
                this.y += this.vel.y;
                //if (this.y < HEIGHT - (ground.height + player.height + 1)) this.y += 6;

        },
        draw: function() {
                context.fillStyle = "blue";
                context.fillRect(this.x, this.y, this.width, this.height);
        }
}

enemy = {
        x: null,
        y: null,
        vx: 2,
        vy: null,
        width: 10,
        height: 15,
        phaseCounter: 0,
        update: function() {
                this.phaseCounter++;
                if (player.x > this.x && this.x < player.x - this.width) this.x += this.vx;
                if (player.x < this.x && this.x > player.x + this.width) this.x -= this.vx;
                if (this.phaseCounter > 10) 
                        this.vx++, this.phaseCounter = 0; 
                if (contact = true) this.phaseCounter = 0, this.vx = 2, contact = false;
        },
        draw: function() {
                context.fillStyle = "red";
                context.fillRect(this.x, this.y, this.width, this.height);
        }
}

ground = {
        x: null,
        y: null,
        width: 500,
        height: 10,
        elevation: 1,
        update: function() {

        },
        draw: function() {
                context.fillStyle = "white";
                context.fillRect(this.x, this.y, this.width, this.height);
        }
}

score = {
        x: WIDTH - 100,
        y: 10,
        width: 10,
        height: 10,
        scoreKeeper: -1,
        text: null,
        update: function() {
                        //if (player.x >= enemy.x - enemy.width && player.x <= enemy.x + enemy.width)
                                //if (player.y >= enemy.y - enemy.height/2) 
                                if (contact == true)
                                {
                                        if(score.scoreKeeper > highscore.scoreKeeper)
                                        {
                                              highscore.scoreKeeper = score.scoreKeeper;  
                                        };
                                        score.scoreKeeper = -1;
                                }
                        if (score.scoreKeeper < 999999) score.scoreKeeper++;
                        score.text = "Score: " + score.scoreKeeper;
        },
        draw: function() {
                context.fillStyle = "white";
                context.fillText(this.text, this.x, this.y);
        }
}

highscore = {
        x: WIDTH - 100,
        y: 20,
        width: 10,
        height: 10,
        scoreKeeper: 0,
        text: null,
        update: function() {
             this.text = "Highscore: " + this.scoreKeeper;        
        },
        draw: function() {
                context.fillStyle = "white";
                context.fillText(this.text, this.x, this.y);
        }
}

function main() 
{
        canvas = document.createElement("canvas");
        canvas.width = WIDTH;
        canvas.height = HEIGHT;
        context = canvas.getContext("2d");
        document.body.appendChild(canvas);

        keystate = {};
        document.addEventListener("keydown", function(evt) {
                keystate[evt.keyCode] = true;
        });
        document.addEventListener("keyup", function(evt) {
                delete keystate[evt.keyCode];
        });

        init();

        var loop = function()
        {
                checkContact();
                update();
                draw();

                window.requestAnimationFrame(loop, canvas);
        }
        window.requestAnimationFrame(loop, canvas);
}

//game loop methods
function init()
{
        player.x = WIDTH - (WIDTH/5);
        player.y = HEIGHT - (ground.height + player.height);

        player.vel = {
                x: player.vx,
                y: player.vy
        }

        ground.x = 0;
        ground.y = HEIGHT - ground.height - ground.elevation;

        enemy.x = WIDTH/5;
        enemy.y = HEIGHT - (ground.height + enemy.height + ground.elevation);
}         

function update()
{ 
        score.update();
        highscore.update();
        player.update();
        enemy.update();
        ground.update();   
}

function draw()
{
        context.fillRect(0, 0, WIDTH, HEIGHT);
        context.save();
        context.fillStyle = "red";
 
        score.draw();
        highscore.draw();
        player.draw();
        enemy.draw();
        ground.draw();

        context.restore();
}

//game mechanic methods
function jump() 
{                        
        if (!jumping) 
        {
                jumping = true;
                setTimeout(land, 250);

        }


}

function land() 
{                
        jumping = false;
}

function checkContact()
{
        if (player.x >= enemy.x - enemy.width && player.x <= enemy.x + enemy.width)
                if (player.y >= enemy.y - enemy.height/2) contact = true;
}

main(); 