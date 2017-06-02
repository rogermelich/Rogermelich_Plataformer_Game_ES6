import Phaser from 'phaser'

export default class extends Phaser.State {
  preload() {
    this.stateText = game.add.text(400,200,' ', { fontSize: '24px', fill: '#FFFFFF' })
    this.game.load.image('background', './assets/images/menu-bg.png')
    this.game.load.audio('Win', './assets/audio/Win.mp3')
  }

  create() {
    this.game.add.image(0, 0, 'background')
    this.stateTitleText = game.add.text(260, 50, ' ', { fontSize: '110px', fill: '#0000FF' })
    this.stateTitleText.text = "You Win"

    this.stateText = game.add.text(200, 260, ' ', { fontSize: '50px', fill: '#58D3F7' })
    this.stateText.text = "Click to Return to Menu"
    game.input.onTap.addOnce(this.startGame, this)
    this.game_WinSound = this.game.add.audio('Win')
    this.game_WinSound.play()
  }

  startGame() {
    // Change the state back to Game.
    this.state.start('MainMenu')
    this.game_WinSound.stop()
  }
}
