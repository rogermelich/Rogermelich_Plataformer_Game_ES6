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
  }

  update (){

  }

  addSounds() {
    this.jumpSound = this.game.add.audio('jumpSound')
    this.coinSound = this.game.add.audio('coinSound')
    this.stompSound = this.game.add.audio('stompSound')
    this.keySound = this.game.add.audio('keySound')
    this.doorSound = this.game.add.audio('doorSound')
  }

  loadLevel (data) {
    //Platforms
    data.platforms.forEach(this.spawnPlatform, this)
  }

  spawnPlatform (platform) {
    this.game.add.sprite(platform.x, platform.y, platform.image)
  }

  spawnPlayer (data) {
    // Spawn Player
    // if(this.playerIsDead) {
      //this.player.x= 380
      //this.player.y= 101
      // this.player.reset(380, 101);
      // this.playerIsDead=false;
    // } else {
      this.player = this.game.add.sprite(0.5,500,'player')
    // }
  }

  render () {
    // if (__DEV__) {
    //   this.game.debug.spriteInfo(this.mushroom, 32, 32)
    // }
  }
}
