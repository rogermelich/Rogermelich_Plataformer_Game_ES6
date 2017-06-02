import Phaser from 'phaser'

export default class extends Phaser.State {
  init () {
    this.loadingBar = game.load.spritesheet(game.world.centerX-(387/2), 400, './assets/image/loading.png');
    this.status = game.make.text(game.world.centerX, 380, 'Loading...', {fill: 'white'});
  }

  preload () {
    this.game.load.image('background', './assets/images/menu-bg.png')
    this.game.load.audio('backgroundMusic', './assets/audio/BackgroundMusic.mp3')
  }

  create () {
    this.backgroundSound = this.game.add.audio('backgroundMusic')
    this.backgroundSound.loop = true
    this.game.add.image(0, 0, 'background')
    this.stateTitleText = game.add.text(50, 50, ' ', { fontSize: '70px', fill: '#fff' })
    this.stateTitleText.text = "Created By Roger Melich"

    this.stateText = game.add.text(320, 250, ' ', { fontSize: '50px', fill: '#fff' })
    this.stateText.text = "Click to start"

    this.stateText = game.add.text(16, 450, ' ', { fontSize: '15px', fill: '#fff' })
    this.stateText.text = "Press 'P' To Pause Music"

    this.stateText = game.add.text(16, 470, ' ', { fontSize: '15px', fill: '#fff' })
    this.stateText.text = "Press 'R' To Resume Music"

    this.stateText = game.add.text(16, 490, ' ', { fontSize: '15px', fill: '#fff' })
    this.stateText.text = "Press 'A' To Shoot Bullets"

    this.backgroundSound.play()

    game.input.onTap.addOnce(this.startGame, this)
  }

  update(){
    this.musicOptions()
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

  startGame () {
    this.state.start('Game')
    this.backgroundSound.stop()
  }
}
