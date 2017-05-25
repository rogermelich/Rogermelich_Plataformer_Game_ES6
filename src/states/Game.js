/* globals */
import Phaser from 'phaser'

export default class extends Phaser.State {
  init () {}
  preload () {
    this.game.load.json('level:1', './assets/levels/level01.json');

    this.game.load.image('background', './assets/images/background.png')
    this.game.load.image('ground', './assets/images/ground.png')

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

    this.game.add.image(0, 0, 'background')
    //Load Sounds
    this.addSounds()
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

  loadLevel1 () {
    this.game.cache.getJSON('level:1')
  }

  spawnPlatform (plataform) {
    this.plataform = this.game.add.sprite(platform.x, platform.y, platform.image)
  }

  render () {
    // if (__DEV__) {
    //   this.game.debug.spriteInfo(this.mushroom, 32, 32)
    // }
  }
}
