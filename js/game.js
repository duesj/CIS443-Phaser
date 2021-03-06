var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update, render: render });

function preload() {

    game.load.image('bullet', 'assets/invaders/bullet.png');
    game.load.image('enemyBullet', 'assets/invaders/enemy-bullet.png');
    game.load.spritesheet('invader', 'assets/invaders/invader32x32x4.png', 32, 32);
    game.load.image('ship', 'assets/invaders/player.png');
    game.load.spritesheet('kaboom', 'assets/invaders/explode.png', 128, 128);
    game.load.image('starfield', 'assets/invaders/starfield.png');
    game.load.image('background', 'assets/background2.png');

    game.load.spritesheet('boss', 'assets/invaders/boss60x60x4.png', 60, 60);
	
    game.load.audio('laser', 'assets/sounds/laser.ogg');
    game.load.audio('boom', 'assets/sounds/explosion.ogg');
    game.load.audio('winSound', 'assets/sounds/winSound.ogg');
    game.load.audio('gameOver', 'assets/sounds/gameOver.ogg');
    game.load.audio('theMusic', 'assets/sounds/theMusic.ogg');


}

var player;
var aliens;
var bullets;
var bulletTime = 0;
var bulletTimeBoost = 0;
var cursors;
var fireButton;
var explosions;
var starfield;

var score = 0;

var scoreString = '';
var scoreText;
var lives;
var enemyBullet;
var firingTimer = 0;
var stateText;
var livingEnemies = [];

var bossHealth = 0;

var difficulty = 0;
var bossDifficulty = 0;
var level = 1;
var levelString = '';
var levelText;

var scoreGoal = 5000;
var scoreGoalString = '';
var scoreGoalText;
	
//Audio
var laser;
var boom;
var winSound;
var gameOver;
var theMusic;

var alienXNum = 8;
var alienYNum = 2;

function create() {

    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  The scrolling starfield background
    starfield = game.add.tileSprite(0, 0, 800, 600, 'starfield');

    //  Our bullet group
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(30, 'bullet');
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 1);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);

    // The enemy's bullets
    enemyBullets = game.add.group();
    enemyBullets.enableBody = true;
    enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
    enemyBullets.createMultiple(30, 'enemyBullet');
    enemyBullets.setAll('anchor.x', 0.5);
    enemyBullets.setAll('anchor.y', 1);
    enemyBullets.setAll('outOfBoundsKill', true);
    enemyBullets.setAll('checkWorldBounds', true);

    //  The hero!
    player = game.add.sprite(400, 500, 'ship');
    player.anchor.setTo(0.5, 0.5);
    game.physics.enable(player, Phaser.Physics.ARCADE);

    //  The baddies!
    aliens = game.add.group();
    aliens.enableBody = true;
    aliens.physicsBodyType = Phaser.Physics.ARCADE;


    createAliens();

    //  The score
    scoreString = 'Score : ';
    scoreText = game.add.text(10, 10, scoreString + score, { font: '34px Arial', fill: '#fff' });

    // Score Goal
    scoreGoalString = 'Goal :   ';
    scoreGoalText = game.add.text(10, 60, scoreGoalString + scoreGoal, {font: '34px Arial', fill: '#fff' });

    // The level
    levelString = 'Level : ';
    levelText = game.add.text(10,110, levelString + level, {font: '34px Arial', fill: '#fff' })

    //  Lives
    lives = game.add.group();
    game.add.text(game.world.width - 100, 10, 'Lives : ', { font: '34px Arial', fill: '#fff' });

    //  Text
    stateText = game.add.text(game.world.centerX,game.world.centerY,' ', { font: '84px Arial', fill: '#fff' });
    stateText.anchor.setTo(0.5, 0.5);
    stateText.visible = false;

    //Audio
    laser = game.add.audio('laser');
    boom = game.add.audio('boom');
    winSound = game.add.audio('winSound');
    gameOver = game.add.audio('gameOver');
    theMusic = game.add.audio('theMusic');

    for (var i = 0; i < 3; i++) 
    {
        var ship = lives.create(game.world.width - 100 + (30 * i), 60, 'ship');
        ship.anchor.setTo(0.5, 0.5);
        ship.angle = 90;
        ship.alpha = 0.8;
    }

    //  An explosion pool
    explosions = game.add.group();
    explosions.createMultiple(30, 'kaboom');
    explosions.forEach(setupInvader, this);

    //  And some controls to play the game with
    
    fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    upButton = game.input.keyboard.addKey(Phaser.Keyboard.W);
    downButton = game.input.keyboard.addKey(Phaser.Keyboard.S);
    leftButton = game.input.keyboard.addKey(Phaser.Keyboard.A);
    rightButton = game.input.keyboard.addKey(Phaser.Keyboard.D);
	    
}

function createAliens () {

    if(level % 6 == 0){
        bossHealth = 10 + ((level * level) / 2);
        bossDifficulty = 500
        //main boss enemy
        var alien = aliens.create(250, 50, 'boss');
        alien.scale.setTo(1.75, 1.75);
        alien.anchor.setTo(0.5, 0.5);
        alien.animations.add('jets', [ 0, 1, 2, 3 ], 20, true);
        alien.play('jets');
        alien.body.moves = false;
        //two side enemies to shoot at you
        var shooterLeft = aliens.create(100, 70, 'invader');
        shooterLeft.anchor.setTo(0.5, 0.5);
        shooterLeft.animations.add('fly', [ 0, 1, 2, 3 ], 20, true);
        shooterLeft.play('fly');
        shooterLeft.tint = 0xff0000;
        shooterLeft.body.moves = false;
        var shooterRight = aliens.create(400, 70, 'invader');
        shooterRight.anchor.setTo(0.5, 0.5);
        shooterRight.animations.add('fly', [ 0, 1, 2, 3 ], 20, true);
        shooterRight.play('fly');
        shooterRight.tint = 0xff0000;
        shooterRight.body.moves = false;


    }else{
    for (var y = 0; y < alienYNum; y++)
    {
        for (var x = 0; x < alienXNum; x++)
        {
            var alien = aliens.create(x * 48, y * 50, 'invader');
            alien.anchor.setTo(0.5, 0.5);
            alien.animations.add('fly', [ 0, 1, 2, 3 ], 20, true);
            alien.play('fly');
            alien.body.moves = false;
        }
    }
    }

    aliens.x = 100;
    aliens.y = 50;

    //  All this does is basically start the invaders moving. Notice we're moving the Group they belong to, rather than the invaders directly.
    var tween = game.add.tween(aliens).to( { x: 200 }, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);

    //  When the tween loops it calls descend
    tween.onLoop.add(descend, this);
}


function setupInvader (invader) {

    invader.anchor.x = 0.5;
    invader.anchor.y = 0.5;
    invader.animations.add('kaboom');

}

function descend() {

    //prevents the aliens from going too low or off screen.
    if (aliens.y <= 300)
    {
        aliens.y += 10;
    }
}

function update() {

    //  Scroll the background
    starfield.tilePosition.y += 2;

    if (player.alive)
    {
        //  Reset the player, then check for movement keys
        player.body.velocity.setTo(0, 0);

        if (leftButton.isDown && player.x > 15)
        {
            player.body.velocity.x = -200;
        }
        else if (rightButton.isDown && player.x < 785)
        {
            player.body.velocity.x = 200;
        }
        else if (upButton.isDown && player.y > 450) 
        {
            player.body.velocity.y = -200;
        }
        else if (downButton.isDown && player.y < 550)
        {
            player.body.velocity.y = 200;
        }


        
        

        //  Firing?
        if (fireButton.isDown)
        {
            fireBullet();
            
        }

        if (game.time.now > firingTimer)
        {
            enemyFires();
        }

        //  Run collision
        game.physics.arcade.overlap(bullets, aliens, collisionHandler, null, this);
        game.physics.arcade.overlap(enemyBullets, player, enemyHitsPlayer, null, this);
    }

}

function render() {

    // for (var i = 0; i < aliens.length; i++)
    // {
    //     game.debug.body(aliens.children[i]);
    // }

}

function collisionHandler (bullet, alien) {

    //  When a bullet hits an alien we kill them both
    bullet.kill();
    if(level % 6 == 0){
        bossHealth -= 1;
        boom.play();
        if(bossHealth <= 0){
            alien.kill();
            bossDifficulty = 0;
        }
    }else{
        alien.kill();
    }
	//play explosion audio
    boom.play();


    //  Increase the score
    score += 20;
    scoreText.text = scoreString + score;

    //Give the player more lives if the score goal is met
    if (score >= scoreGoal)
    {
        lives.callAll('revive');
        scoreGoal += 5000;
        scoreGoalText.text = scoreGoalString + scoreGoal;
    }

    //  And create an explosion :)
    var explosion = explosions.getFirstExists(false);
    explosion.reset(alien.body.x, alien.body.y);
    explosion.play('kaboom', 30, false, true);

    if (aliens.countLiving() == 0)
    {
        score += 1000;
        scoreText.text = scoreString + score;
        if (score >= scoreGoal)
        {
        lives.callAll('revive');
        scoreGoal += 5000;
        scoreGoalText.text = scoreGoalString + scoreGoal;
        }

        enemyBullets.callAll('kill',this);
        stateText.text = " You Won! \n Click to Continue";
        stateText.visible = true;
	winSound.play();

        

        //the "click to restart" handler
        game.input.onTap.addOnce(winRestart,this);

    }

}

function enemyHitsPlayer (player,bullet) {
    
    bullet.kill();

    live = lives.getFirstAlive();

    if (live)
    {
        live.kill();
    }

    //  And create an explosion :)
    var explosion = explosions.getFirstExists(false);
    explosion.reset(player.body.x, player.body.y);
    explosion.play('kaboom', 30, false, true);

    // When the player dies
    if (lives.countLiving() < 1)
    {
        player.kill();
        enemyBullets.callAll('kill');
	gameOver.play();

        stateText.text=" GAME OVER \n Click to restart";
        stateText.visible = true;

        //the "click to restart" handler
        game.input.onTap.addOnce(failRestart,this);
    }

}

function enemyFires () {

    //  Grab the first bullet we can from the pool
    enemyBullet = enemyBullets.getFirstExists(false);

    livingEnemies.length=0;

    aliens.forEachAlive(function(alien){

        // put every living enemy in an array
        livingEnemies.push(alien);
    });


    if (enemyBullet && livingEnemies.length > 0)
    {
        
        var random=game.rnd.integerInRange(0,livingEnemies.length-1);

        // randomly select one of them
        var shooter=livingEnemies[random];
        // And fire the bullet from this enemy
        enemyBullet.reset(shooter.body.x, shooter.body.y);

        game.physics.arcade.moveToObject(enemyBullet,player,120);

        //As difficulty increases, firing rate increases until difficulty = 2000
        firingTimer = game.time.now + 2000 - difficulty - bossDifficulty;
    }

}

function fireBullet () {

    //  To avoid them being allowed to fire too fast we set a time limit
    if (game.time.now > bulletTime)
    {
        //  Grab the first bullet we can from the pool
        bullet = bullets.getFirstExists(false);

        if (bullet)
        {
            laser.play();
            //  And fire it

            bullet.reset(player.x, player.y + 8);
            bullet.body.velocity.y = -400;

            bulletTime = game.time.now + 220 - bulletTimeBoost;
        }
    }

}

function resetBullet (bullet) {

    //  Called if the bullet goes out of the screen
    bullet.kill();

}

//Restart function for losing all lives
function failRestart () {

    highScore = score;
    //  A new level starts
    resetStats();
    //resets the life count
    lives.callAll('revive');
    //  And brings the aliens back from the dead :)
    aliens.removeAll();
    createAliens();

    //revives the player
    player.revive();
    //hides the text
    stateText.visible = false;

}

//Restart function for winning a level
function winRestart() {
    //  A new level starts
    level += 1;
    //prevents needless action.
    if(difficulty <= 1750)
    {
        difficulty += 250; 
    }
    bulletTimeBoost += 7;
    if(bulletTimeBoost >= 200){
        bulletTimeBoost = 180;
    }
    levelText.text = levelString + level;
    //  And brings the aliens back from the dead :)
    aliens.removeAll();
    //Makes the game more difficult by adding more enemies
    moreAliens();
    createAliens();

    //revives the player
    player.revive();
    //hides the text
    stateText.visible = false;
}

//increases the number of aliens as you win
function moreAliens() {
    if (alienXNum <= 11)
    {
        alienXNum += 1;
    }

    if (alienYNum <= 4 && level > 2)
    {
        alienYNum += 1;
    }
}


//resets values to default
function resetStats (){
    level = 1;
    score = 0;
    difficulty = 0;
    scoreGoal = 5000;
    alienXNum = 8;
    alienYNum = 2;
    bulletTimeBoost = 0;
    scoreText.text = scoreString + score;
    levelText.text = levelString + level;
    scoreGoalText.text = scoreGoalString + scoreGoal;

}