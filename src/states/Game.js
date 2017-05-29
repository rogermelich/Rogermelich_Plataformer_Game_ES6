/* globals */
import Phaser from 'phaser'

export default class extends Phaser.State {
  init () {}
  preload () {
    this.game.load.json('level:0', './assets/levels/level00.json');
    this.game.load.json('level:1', './assets/levels/level01.json');


    this.game.load.image('background', './assets/images/background.png')
    this.game.load.image('ground', './assets/images/ground.png')
    this.game.load.image('grass:8x1', './assets/images/grass_8x1.png');
    this.game.load.image('grass:6x1', './assets/images/grass_6x1.png');
    this.game.load.image('grass:4x1', './assets/images/grass_4x1.png');
    this.game.load.image('grass:2x1', './assets/images/grass_2x1.png');
    this.game.load.image('grass:1x1', './assets/images/grass_1x1.png');

    // Load Spritesheets
    this.game.load.spritesheet('coin', './assets/images/coin_animated.png', 22, 22);
    this.game.load.spritesheet('spider', './assets/images/spider.png', 42, 32);
    this.game.load.spritesheet('player', './assets/images/player.png', 36, 42);
    this.game.load.spritesheet('door', './assets/images/door.png', 42, 66);
    this.game.load.spritesheet('keyIcon', './assets/images/key_icon.png', 34, 30);


    // audio
    this.game.load.audio('jumpSound', './assets/audio/jump.wav');
    this.game.load.audio('coinSound', './assets/audio/coin.wav');
    this.game.load.audio('stompSound', './assets/audio/stomp.wav');
    this.game.load.audio('keySound', './assets/audio/key.wav');
    this.game.load.audio('doorSound', './assets/audio/door.wav');
  }

  create () {
    // Select Physics
    this.game.physics.startSystem(Phaser.Physics.ARCADE)
    this.game.physics.setBoundsToWorld()

    // Load Level and Background
    this.game.add.image(0, 0, 'background')
    this.loadLevel(this.game.cache.getJSON('level:1'))

    //Collectibles
    this.putCoinsOnLevel(this.game.cache.getJSON('level:1'))

    //Load Sounds
    this.addSounds()

    //Init Player
    this.MAX_SPEED = 300; // pixels/second
    this.ACCELERATION = 1000; // pixels/second/second
    this.DRAG = 300; // pixels/second
    this.GRAVITY = 1200; // pixels/second/second
    this.JUMP_SPEED = -420; // pixels/second (negative y is up)
    this.spawnPlayer()
    this.configurePlayer()
    this.jumpin = false;

    // Set player minimum and maximum movement speed
    this.player.body.maxVelocity.setTo(this.MAX_SPEED, this.MAX_SPEED * 10) // x, y

    this.player.body.drag.setTo(this.DRAG, 0); // x, y
    // Player

    //Config Inputs
    this.cursor = game.input.keyboard.createCursorKeys()
    game.input.keyboard.addKeyCapture([Phaser.Keyboard.UP, Phaser.Keyboard.DOWN, Phaser.Keyboard.RIGHT, Phaser.Keyboard.LEFT])

    this.drawHeightMarkers();
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

      this.game.physics.arcade.overlap(this.player, this.coins, this.takeCoin, null, this)

    this.inputs()
  }
  addSounds() {
    this.jumpSound = this.game.add.audio('jumpSound')
    this.coinSound = this.game.add.audio('coinSound')
    this.stompSound = this.game.add.audio('stompSound')
    this.keySound = this.game.add.audio('keySound')
    this.doorSound = this.game.add.audio('doorSound')
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
    // physics for platform sprites
    // this.game.physics.enable(this.game)
    //this.sprite.body.allowGravity = false
    //this.sprite.body.immovable = true
  }

  configurePlayer() {
    this.player.body.gravity.y= 1200;
    this.player.body.setSize(40,40,0,0)

    this.player.animations.add('idle',[3,4,5,4],5,true)

    this.player.animations.play('idle')
  }

  spawnPlayer () {

    this.player = this.game.add.sprite(0.5, 450, 'player')
    this.game.physics.arcade.enable(this.player)


    // Spawn Player
    // if(this.playerIsDead) {
      //this.player.x= 380
      //this.player.y= 101
      // this.player.reset(380, 101);
      // this.playerIsDead=false;
    // } else {
      //this.player = this.game.add.sprite(0.5,450,'player')
    // }

    this.player.body.collideWorldBounds=true;
  }

  spawnCoins (coin) {
    this.money = game.add.sprite(coin.x, coin.y, 'coin', 0, this.coins)

    this.money.animations.add('coinanim',[0,1,2,3], 3, true)
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
  }


  render () {
    // if (__DEV__) {
    //   this.game.debug.spriteInfo(this.mushroom, 32, 32)
    // }
  }
}
