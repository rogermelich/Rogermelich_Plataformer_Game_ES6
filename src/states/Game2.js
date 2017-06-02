/* globals */
import Phaser from 'phaser'

export default class extends Phaser.State {
  init () {
    this.hasKey = false
  }
  preload () {
    // Load Levels
    this.game.load.json('level:2', './assets/levels/level02.json')

    // Load Images
    this.game.load.image('background', './assets/images/background.png')
    this.game.load.image('ground', './assets/images/ground.png')
    this.game.load.image('grass:8x1', './assets/images/grass_8x1.png')
    this.game.load.image('grass:6x1', './assets/images/grass_6x1.png')
    this.game.load.image('grass:4x1', './assets/images/grass_4x1.png')
    this.game.load.image('grass:2x1', './assets/images/grass_2x1.png')
    this.game.load.image('grass:1x1', './assets/images/grass_1x1.png')
    this.game.load.image('heart', './assets/images/heart.png')
    this.game.load.image('bullet', './assets/images/bullet.png')


    // Load Particles
    this.game.load.image('muzzleflash2', './assets/images/particles/muzzleflash2.png')
    this.game.load.image('smoke-puff', './assets/images/particles/smoke-puff.png')
    this.game.load.spritesheet('snowflakes', './assets/images/particles/snowflakes.png', 17, 17)
    this.game.load.spritesheet('snowflakes_large', './assets/images/particles/snowflakes_large.png', 64, 64)


    // Load Spritesheets
    this.game.load.spritesheet('coin', './assets/images/coin_animated.png', 22, 22)
    this.game.load.spritesheet('spider', './assets/images/spider.png', 42, 32)
    this.game.load.spritesheet('player', './assets/images/player.png', 36, 42)
    this.game.load.spritesheet('door', './assets/images/door.png', 42, 66)
    this.game.load.spritesheet('keyIcon', './assets/images/key_icon.png', 34, 30)



    // audio
    this.game.load.audio('jumpSound', './assets/audio/jump.wav')
    this.game.load.audio('coinSound', './assets/audio/coin.wav')
    this.game.load.audio('keySound', './assets/audio/key.wav')
    this.game.load.audio('doorSound', './assets/audio/door.wav')
    this.game.load.audio('explosion', './assets/audio/explosion.mp3')
  }

  setParticles(x, y) {
      this.explosion = game.add.emitter(0, 0, 20);
      this.explosion.makeParticles(['muzzleflash2', 'smoke-puff']);
      this.explosion.setYSpeed(-450, 250);
      this.explosion.setXSpeed(-450, 250);
      this.explosion.gravity = 150;

      //Particles Snow
      var emitter = game.add.emitter(game.world.centerX, 0, 200);
      emitter.width = game.world.width;
      emitter.makeParticles(['snowflakes', 'snowflakes_large']);
      emitter.minParticleScale = 0.5;
      emitter.maxParticleScale = 1;
      emitter.setYSpeed(50, 200);
      emitter.setXSpeed(-30, 30);
      emitter.start(false, 3500, 30);
  }

  create () {
    //Music
    this.backgroundSound = this.game.add.audio('backgroundMusic')
    this.backgroundSound.loop = true

    if (window.enableSound || window.enableSound == null ) {
      this.backgroundSound.play()
    } else {
      this.backgroundSound.stop()
    }

    // Select Physics
    this.game.physics.startSystem(Phaser.Physics.ARCADE)
    this.game.physics.setBoundsToWorld()

    //Level
    this.LEVEL = this.game.cache.getJSON('level:2')

    //Initial states
    this.playerIsDead=false;

    // Load Level and Background
    // this.game.add.image(0, 0, 'background')
    this.game.add.tileSprite(0, 0, 1500, 600, 'background');
    this.game.world.setBounds(0, 0, 1500, 600)

    this.loadLevel(this.LEVEL)
    this.levelText = this.game.add.text(16, 80, 'Level 2' , { fontSize: '16px', fill: '#000' });
    this.levelText.fixedToCamera = true;

    //Collectibles
    this.putCoinsOnLevel(this.LEVEL)

    //Load Sounds
    this.addSounds()

    //Load Particles
    this.setParticles()

    //Bullets
    this.SHOT_DELAY = 100; // milliseconds (10 bullets/second)
    this.BULLET_SPEED = 500; // pixels/second
    this.NUMBER_OF_BULLETS = 1;

    this.Bullet()

    //Init Player
    this.MAX_SPEED = 300; // pixels/second
    this.ACCELERATION = 1000; // pixels/second/second
    this.DRAG = 300; // pixels/second
    this.GRAVITY = 1200; // pixels/second/second
    this.JUMP_SPEED = -420; // pixels/second (negative y is up)
    this.LIVES = 3;
    this.COINS = 0;
    this.spawnPlayer()
    this.configurePlayer()
    this.jumpin = false;

    // Set player minimum and maximum movement speed
    this.player.body.maxVelocity.setTo(this.MAX_SPEED, this.MAX_SPEED * 10) // x, y

    this.player.body.drag.setTo(this.DRAG, 0); // x, y
    // Player

    //Score Count
    this.score = 0;
    this.scoreText = this.game.add.text(16, 16, 'Score: 0', { fontSize: '19px', fill: '#000' });
    this.scoreText.fixedToCamera = true;

    //Lives
    this.playerLives()

    //Spiders
    this.loadEnemy(this.LEVEL)

    //Config Inputs
    this.cursor = game.input.keyboard.createCursorKeys()
    game.input.keyboard.addKeyCapture([Phaser.Keyboard.UP, Phaser.Keyboard.DOWN, Phaser.Keyboard.RIGHT, Phaser.Keyboard.LEFT])

    this.drawHeightMarkers();

    this.game.camera.follow(this.player)
  }

  // This function draws horizontal lines across the stage
  drawHeightMarkers (y) {
    // Create a bitmap the same size as the stage
    var bitmap = this.game.add.bitmapData(this.game.width, this.game.height);

    // These functions use the canvas context to draw lines using the canvas API
    for(y = this.game.height-32; y >= 64; y -= 32) {
        bitmap.context.beginPath();
        bitmap.context.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        bitmap.context.moveTo(0, y);
        bitmap.context.lineTo(this.game.width, y);
        bitmap.context.stroke();
    }

    this.game.add.image(0, 0, bitmap)
  }

  Bullet () {
    this.bulletPool = this.game.add.group();
    for(var i = 0; i < this.NUMBER_OF_BULLETS; i++) {
       // Create each bullet and add it to the group.
       var bullet = this.game.add.sprite(0, 0, 'bullet');
       this.bulletPool.add(bullet);

       // Set its pivot point to the center of the bullet
       bullet.anchor.setTo(0.5, 0.5);

       // Enable physics on the bullet
       this.game.physics.enable(bullet, Phaser.Physics.ARCADE);

       // Set its initial state to "dead".
       bullet.kill();
     }
  }

  shootBullet () {
    // Enforce a short delay between shots by recording
    // the time that each bullet is shot and testing if
    // the amount of time since the last shot is more than
    // the required delay.
    if (this.lastBulletShotAt === undefined) this.lastBulletShotAt = 0;
    if (this.game.time.now - this.lastBulletShotAt < this.SHOT_DELAY) return;
    this.lastBulletShotAt = this.game.time.now;

    // Get a dead bullet from the pool
    var bullet = this.bulletPool.getFirstDead();

    // If there aren't any bullets available then don't shoot
    if (bullet === null || bullet === undefined) return;

    // Revive the bullet
    // This makes the bullet "alive"
    bullet.revive();

    // Bullets should kill themselves when they leave the world.
    // Phaser takes care of this for me by setting this flag
    // but you can do it yourself by killing the bullet if
    // its x,y coordinates are outside of the world.
    bullet.checkWorldBounds = true;
    bullet.outOfBoundsKill = true;

    // Set the bullet position to the gun position.
    bullet.reset(this.player.x, this.player.y+20);

    // Shoot it
    bullet.body.velocity.x = this.BULLET_SPEED;
    bullet.body.velocity.y = 0;
  }

  update () {
    this.game.physics.arcade.collide(this.player, this.level)

    this.game.physics.arcade.overlap(this.player, this.spiders, this.dead, null, this)
    this.game.physics.arcade.overlap(this.player, this.coins, this.takeCoin, null, this)
    this.game.physics.arcade.overlap(this.player, this.key, this.takeKey,null, this)
    this.game.physics.arcade.overlap(this.player, this.door, this.openDoor,
    // ignore if there is no key or the player is on air
    function (player, door) {
        return this.hasKey && this.player.body.touching.down;
    }, this);
    this.game.physics.arcade.overlap(this.bulletPool, this.spiders, this.deadSpider, null, this);

    this.inputs()

    this.enemyMove()

    this.musicOptions()

    this.inputBullet()
  }

  inputBullet () {
    var shoot = game.input.keyboard.addKey(Phaser.Keyboard.A)

    if (shoot.justPressed()) {
        this.shootBullet();
    }
  }

  musicOptions () {
    var pauseKey = game.input.keyboard.addKey(Phaser.Keyboard.P)
    var resumeKey = game.input.keyboard.addKey(Phaser.Keyboard.R)
    if (pauseKey.justPressed()) {
        this.backgroundSound.pause()
    } if (resumeKey.justPressed()) {
      this.backgroundSound.resume()
    }
  }

  addSounds() {
    this.jumpSound = this.game.add.audio('jumpSound')
    this.coinSound = this.game.add.audio('coinSound')
    this.keySound = this.game.add.audio('keySound')
    this.doorSound = this.game.add.audio('doorSound')
    this.explosionSound = this.game.add.audio('explosion')
  }

  loadLevel (data) {
    this.bgDecoration = this.game.add.group()
    this.level = this.game.add.group()
    this.level.enableBody = true

    //Platforms
    data.platforms.forEach(this.spawnPlatform, this, this.level)


    this.level.setAll('body.immovable', true)

    this.spawnDoor(data.door.x, data.door.y);
    this.spawnKey(data.key.x, data.key.y);
  }

  spawnDoor (x, y) {
    this.door = this.bgDecoration.create(x, y, 'door');
    this.door.anchor.setTo(0.5, 1);
    this.game.physics.enable(this.door);
    this.door.body.allowGravity = false;
  }

  spawnKey (x, y) {
    this.key = this.bgDecoration.create(x, y, 'keyIcon');
    this.key.anchor.set(0.5, 0.5);
    // enable physics to detect collisions, so the hero can pick the key up
    this.game.physics.enable(this.key);
    this.key.body.allowGravity = false;
    // add a small 'up & down' animation via a tween
    this.key.y -= 3;
    this.game.add.tween(this.key)
        .to({y: this.key.y + 6}, 800, Phaser.Easing.Sinusoidal.InOut)
        .yoyo(true)
        .loop()
        .start()
  }

  // Individual Keys inputs

  // This function should return true when the player activates the "go left" control
  // In this case, either holding the right arrow or tapping or clicking on the left
  // side of the screen.
  leftInputIsActive () {
      var isActive = false;

      isActive = this.input.keyboard.isDown(Phaser.Keyboard.LEFT);
      isActive |= (this.game.input.activePointer.isDown &&
          this.game.input.activePointer.x < this.game.width/4);

      return isActive;
  }

  // This function should return true when the player activates the "go right" control
  // In this case, either holding the right arrow or tapping or clicking on the right
  // side of the screen.
  rightInputIsActive () {
      var isActive = false;

      isActive = this.input.keyboard.isDown(Phaser.Keyboard.RIGHT);
      isActive |= (this.game.input.activePointer.isDown &&
          this.game.input.activePointer.x > this.game.width/2 + this.game.width/4);

      return isActive;
  }

  // This function should return true when the player activates the "jump" control
  // In this case, either holding the up arrow or tapping or clicking on the center
  // part of the screen.
  upInputIsActive (duration) {
      var isActive = false;

      isActive = this.input.keyboard.downDuration(Phaser.Keyboard.UP, duration);
      isActive |= (this.game.input.activePointer.justPressed(duration + 1000/60) &&
          this.game.input.activePointer.x > this.game.width/4 &&
          this.game.input.activePointer.x < this.game.width/2 + this.game.width/4);

      return isActive;
  }

  // This function returns true when the player releases the "jump" control
  upInputReleased () {
      var released = false;

      released = this.input.keyboard.upDuration(Phaser.Keyboard.UP);
      released |= this.game.input.activePointer.justReleased();

      return released;
  }
  // Individual Keys inputs

  inputs() {
    if (this.leftInputIsActive()) {
        // If the LEFT key is down, set the player velocity to move left
        this.player.body.acceleration.x = -this.ACCELERATION;
    } else if (this.rightInputIsActive()) {
        // If the RIGHT key is down, set the player velocity to move right
        this.player.body.acceleration.x = this.ACCELERATION;
    } else {
        this.player.body.acceleration.x = 0;
    }

    // Set a variable that is true when the player is touching the ground
    var onTheGround = this.player.body.touching.down;

    // If the player is touching the ground, let him have 2 jumps
    if (onTheGround) {
        this.jumps = 2;
        this.jumping = false;
    }

    // Jump!
    if (this.jumps > 0 && this.upInputIsActive(5)) {
        this.player.body.velocity.y = this.JUMP_SPEED;
        this.jumpSound.play()
        this.jumping = true;
    }

    // Reduce the number of available jumps if the jump input is released
    if (this.jumping && this.upInputReleased()) {
        this.jumps--;
        this.jumping = false;
    }

  }

  spawnPlatform (platform) {
    this.platforms = game.add.sprite(platform.x, platform.y, platform.image, 0, this.level)
  }

  configurePlayer() {
    this.player.body.gravity.y= 1200;
    this.player.body.setSize(40,40,0,0)

    this.player.animations.add('idle',[3,4,5,4],5,true)

    this.player.animations.play('idle')
  }

  spawnPlayer () {
    if(this.playerIsDead) {
        //this.player.x= 380
        //this.player.y= 101
        this.player.reset(0.5, 450)
        this.playerIsDead=false
      } else {
        this.player = this.game.add.sprite(0.5, 450, 'player')
      }
    this.game.physics.arcade.enable(this.player)
    this.player.body.collideWorldBounds=true;
  }

  loadEnemy () {
    this.spiders = this.game.add.group()
    this.spiders.enableBody = true

    this.spider1 = this.spiders.create(1, 399, 'spider')
    this.spider2 = this.spiders.create(640, 362, 'spider')
    this.spider3 = this.spiders.create(450, 147, 'spider')
    this.spider4 = this.spiders.create(150, 230, 'spider')
    this.spider5 = this.spiders.create(1440, 410, 'spider')
    this.spider6 = this.spiders.create(1460, 210, 'spider')

    this.spider1.body.velocity.x = 100
    this.spider2.body.velocity.x = 100
    this.spider3.body.velocity.x = 100
    this.spider4.body.velocity.x = 100
    this.spider5.body.velocity.x = 100

    this.spider1.animations.add('spider1',[0,1,2], 12, true)
    this.spider1.animations.play('spider1')

    this.spider2.animations.add('spider2',[0,1,2], 12, true)
    this.spider2.animations.play('spider2')

    this.spider3.animations.add('spider3',[0,1,2], 12, true)
    this.spider3.animations.play('spider3')

    this.spider4.animations.add('spider4',[0,1,2], 12, true)
    this.spider4.animations.play('spider4')

    this.spider5.animations.add('spider5',[0,1,2], 12, true)
    this.spider5.animations.play('spider5')

    this.spider6.animations.add('spider6',[0,1,2], 12, true)
    this.spider6.animations.play('spider6')

  }

  enemyMove () {
    if (parseInt(this.spider1.body.x) > 120 ) { this.spider1.body.velocity.x = -100 }
    if (parseInt(this.spider1.body.x) < 1 ) { this.spider1.body.velocity.x = 100 }
    if (parseInt(this.spider2.body.x) > 790 ) { this.spider2.body.velocity.x = -100 }
    if (parseInt(this.spider2.body.x) < 668 ) { this.spider2.body.velocity.x = 100 }
    if (parseInt(this.spider3.body.x) > 535) { this.spider3.body.velocity.x = -100 }
    if (parseInt(this.spider3.body.x) < 460 ) { this.spider3.body.velocity.x = 100 }
    if (parseInt(this.spider4.body.x) > 250) { this.spider4.body.velocity.x = -100 }
    if (parseInt(this.spider4.body.x) < 127 ) { this.spider4.body.velocity.x = 100 }
    if (parseInt(this.spider5.body.x) > 1460) { this.spider5.body.velocity.x = -100 }
    if (parseInt(this.spider5.body.x) < 1420 ) { this.spider5.body.velocity.x = 100 }
  }

  dead() {
    this.playerIsDead = true
    this.explosionSound.play()
    game.camera.shake(0.05, 200)

    if (this.playerIsDead) {
      this.explosion.x = this.player.x
      this.explosion.y = this.player.y+10
      this.explosion.start(true,300,null,20)
    }
    //-1 Live
    this.LIVES--
    if (this.LIVES === 0){
      let that = this
      setTimeout(function() {
        that.backgroundSound.stop()
        that.state.start('GameOver')
      }, 300)
    }
    this.glives.removeChildAt(this.LIVES)

    //Reset Player
    this.spawnPlayer()
  }

  deadSpider (bulletPool, spider) {
    bulletPool.kill()
    spider.kill()

    this.explosionSound.play()
    this.explosion.x = spider.x
    this.explosion.y = spider.y+10
    this.explosion.start(true,150,null,20)
  }

  playerLives() {
    this.playerIsDead = false
    this.glives = game.add.group()
    this.livesText = this.game.add.text(16, 45, 'Lives: ', { fontSize: '19px ', fill: '#000' })
    for (var i = 0; i < 3; i++) {
            this.forlives = this.glives.create(90 + (30 * i), 55, 'heart')
            this.forlives.anchor.setTo(0.5, 0.5)
    }

    this.livesText.fixedToCamera = true
    this.glives.fixedToCamera = true

  }

  playerKey () {
    this.gkey = game.add.group()
    if (this.hasKey === true) {
      this.keyImage = this.glives.create(16, 102, 'keyIcon')

      this.gkey.fixedToCamera = true
    }
  }

  spawnCoins (coin) {
    this.money = game.add.sprite(coin.x, coin.y, 'coin', 0, this.coins)

    this.money.animations.add('coinanim',[0,1,2,3], 6, true)
    this.money.animations.play('coinanim')
  }

  putCoinsOnLevel(data) {
    this.coins = this.game.add.group()
    this.coins.enableBody = true

    //coins
    data.coins.forEach(this.spawnCoins, this, this.coins)

    game.physics.arcade.enable(this.coins)

  }

  takeCoin(player, coin) {
    coin.body.enable = false
    game.add.tween(coin).to({width:0},100).start()
    this.coinSound.play()

    //Valor Of Score
    this.score += 5;
    this.scoreText.text = 'Score: ' + this.score;
  }

  takeKey (player, key) {
    this.key.body.enable = false
    this.game.add.tween(key).to({width:0},100).start()
    this.keySound.play()
    this.hasKey = true

    this.playerKey()
  }

  openDoor (player, door) {
    if (this.hasKey === true) {
      this.doorSound.play()
      this.backgroundSound.stop()
      game.state.start('Win')
    }
  }


  render () {
    // if (__DEV__) {
    //   this.game.debug.spriteInfo(this.mushroom, 32, 32)
    // }
  }
}
