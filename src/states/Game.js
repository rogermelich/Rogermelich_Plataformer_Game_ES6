/* globals */
import Phaser from 'phaser'

export default class extends Phaser.State {
  init () {}
  preload () {
    // Load Levels
    this.game.load.json('level:0', './assets/levels/level00.json');
    this.game.load.json('level:1', './assets/levels/level01.json');

    // Load Images
    this.game.load.image('background', './assets/images/background.png')
    this.game.load.image('ground', './assets/images/ground.png')
    this.game.load.image('grass:8x1', './assets/images/grass_8x1.png')
    this.game.load.image('grass:6x1', './assets/images/grass_6x1.png')
    this.game.load.image('grass:4x1', './assets/images/grass_4x1.png')
    this.game.load.image('grass:2x1', './assets/images/grass_2x1.png')
    this.game.load.image('grass:1x1', './assets/images/grass_1x1.png')
    this.game.load.image('heart', './assets/images/heart.png')

    // Load Particles
    this.game.load.image('muzzleflash2', './assets/images/particles/muzzleflash2.png')
    this.game.load.image('smoke-puff', './assets/images/particles/smoke-puff.png')


    // Load Spritesheets
    this.game.load.spritesheet('coin', './assets/images/coin_animated.png', 22, 22)
    this.game.load.spritesheet('spider', './assets/images/spider.png', 42, 32)
    this.game.load.spritesheet('player', './assets/images/player.png', 36, 42)
    this.game.load.spritesheet('door', './assets/images/door.png', 42, 66)
    this.game.load.spritesheet('keyIcon', './assets/images/key_icon.png', 34, 30)


    // audio
    this.game.load.audio('jumpSound', './assets/audio/jump.wav')
    this.game.load.audio('coinSound', './assets/audio/coin.wav')
    this.game.load.audio('stompSound', './assets/audio/stomp.wav')
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
  }

  create () {
    // Select Physics
    this.game.physics.startSystem(Phaser.Physics.ARCADE)
    this.game.physics.setBoundsToWorld()

    //Level
    this.LEVEL = this.game.cache.getJSON('level:1')

    //Initial states
    this.playerIsDead=false;

    // Load Level and Background
    // this.game.add.image(0, 0, 'background')
    this.game.add.tileSprite(0, 0, 1500, 600, 'background');
    this.game.world.setBounds(0, 0, 1500, 600)

    this.loadLevel(this.LEVEL)
    this.levelText = this.game.add.text(16, 80, 'Level 1', { fontSize: '16px', fill: '#000' });
    this.levelText.fixedToCamera = true;

    //Collectibles
    this.putCoinsOnLevel(this.LEVEL)

    //Load Sounds
    this.addSounds()

    //Load Particles
    this.setParticles()

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

  update () {
    this.game.physics.arcade.collide(this.player, this.level)

    this.game.physics.arcade.overlap(this.player, this.spiders, this.dead, null, this)
    this.game.physics.arcade.overlap(this.player, this.coins, this.takeCoin, null, this)

    this.inputs()

    this.enemyMove()
  }
  addSounds() {
    this.jumpSound = this.game.add.audio('jumpSound')
    this.coinSound = this.game.add.audio('coinSound')
    this.stompSound = this.game.add.audio('stompSound')
    this.keySound = this.game.add.audio('keySound')
    this.doorSound = this.game.add.audio('doorSound')
    this.explosionSound = this.game.add.audio('explosion')
  }

  loadLevel (data) {
    this.level = this.game.add.group()
    this.level.enableBody = true

    //Platforms
    data.platforms.forEach(this.spawnPlatform, this, this.level)


    this.level.setAll('body.immovable', true)
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

    this.spider1 = this.spiders.create(121, 399, 'spider')
    this.spider2 = this.spiders.create(800, 362, 'spider')
    this.spider3 = this.spiders.create(500, 147, 'spider')

    this.spider1.body.velocity.x = 100
    this.spider2.body.velocity.x = 100
    this.spider3.body.velocity.x = 100

    this.spider1.animations.add('spider1',[0,1,2], 12, true)
    this.spider1.animations.play('spider1')

    this.spider2.animations.add('spider2',[0,1,2], 12, true)
    this.spider2.animations.play('spider2')

    this.spider3.animations.add('spider3',[0,1,2], 12, true)
    this.spider3.animations.play('spider3')

  }

  enemyMove () {
    if (parseInt(this.spider1.body.x) > 280 ) { this.spider1.body.velocity.x = -100 }
    if (parseInt(this.spider1.body.x) < 1 ) { this.spider1.body.velocity.x = 100 }
    if (parseInt(this.spider2.body.x) > 960 ) { this.spider2.body.velocity.x = -100 }
    if (parseInt(this.spider2.body.x) < 668 ) { this.spider2.body.velocity.x = 100 }
    if (parseInt(this.spider3.body.x) > 675) { this.spider3.body.velocity.x = -100 }
    if (parseInt(this.spider3.body.x) < 475 ) { this.spider3.body.velocity.x = 100 }
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
      this.state.start('GameOver')
    }
    this.glives.removeChildAt(this.LIVES)

    //Reset Player
    this.spawnPlayer()
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

  takeCoin(player,coin) {
    coin.body.enable = false
    game.add.tween(coin).to({width:0},100).start()
    this.coinSound.play()

    //Valor Of Score
    this.score += 5;
    this.scoreText.text = 'Score: ' + this.score;
  }


  render () {
    game.debug.spriteInfo(this.player, 32, 32);
    // if (__DEV__) {
    //   this.game.debug.spriteInfo(this.mushroom, 32, 32)
    // }
  }
}
