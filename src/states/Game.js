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

    // Load Level and
    this.game.add.image(0, 0, 'background')
    this.loadLevel(this.game.cache.getJSON('level:1'));

    //Load Sounds
    this.addSounds()

    //Init Player
    this.spawnPlayer()
    game.physics.arcade.enable(this.player)
    this.configurePlayer()
    this.player.checkWorldBounds = true;

    //Config Inputs
    this.cursor = game.input.keyboard.createCursorKeys()
    game.input.keyboard.addKeyCapture([Phaser.Keyboard.UP, Phaser.Keyboard.DOWN, Phaser.Keyboard.RIGHT, Phaser.Keyboard.LEFT]);

  }

  update (){
    this.game.physics.arcade.collide(this.player, this.level)

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

  inputs() {
    if (this.player.body) {
      if (this.cursor.left.isDown) {
        this.player.body.velocity.x = -200
        this.player.frame = 2
      } else if (this.cursor.right.isDown) {
        this.player.body.velocity.x = +200
        this.player.frame = 1
      } else {
        this.player.body.velocity.x = 0
      }
    }

    if (this.cursor.up.isDown) {
      this.jumpPlayer();
    }
  }

  spawnPlatform (platform) {
    this.plataforms = game.add.sprite(platform.x, platform.y, platform.image, 0, this.level)
    // physics for platform sprites
    // this.game.physics.enable(this.game)
    //this.sprite.body.allowGravity = false
    //this.sprite.body.immovable = true
  }

  configurePlayer() {
    this.player.body.gravity.y= 1200
    this.player.body.setSize(20,20,20,20);

    // this.player.animations.add('idle',[3,4,5,4],5,true)

    // this.player.animations.play('idle')
  }

  spawnPlayer (data) {
    // Spawn Player
    // if(this.playerIsDead) {
      //this.player.x= 380
      //this.player.y= 101
      // this.player.reset(380, 101);
      // this.playerIsDead=false;
    // } else {
      this.player = this.game.add.sprite(0.5,450,'player')
    // }
  }

  jumpPlayer() {
      this.player.body.velocity.y = -220

      if (!this.hasJumped) {
          this.jumpSound.play()
          this.hasJumped = true
      }
  }

  render () {
    // if (__DEV__) {
    //   this.game.debug.spriteInfo(this.mushroom, 32, 32)
    // }
  }
}
