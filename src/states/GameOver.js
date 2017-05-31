import Phaser from 'phaser'

export default class extends Phaser.State {
  preload() {
    this.stateText = game.add.text(400,200,' ', { fontSize: '24px', fill: '#FFFFFF' })
    this.game.load.image('background', './assets/images/menu-bg.png')
    this.game.load.audio('game_over', './assets/audio/game_over.mp3')
  }

  create() {
    this.game.add.image(0, 0, 'background')
    this.stateTitleText = game.add.text(200, 50, ' ', { fontSize: '110px', fill: 'red' })
    this.stateTitleText.text = "Game Over"

    this.stateText = game.add.text(320, 260, ' ', { fontSize: '50px', fill: 'orange' })
    this.stateText.text = "Click to Restart"
    game.input.onTap.addOnce(this.startGame, this)
    this.game_overSound = this.game.add.audio('game_over')
    this.game_overSound.play()
  }

  startGame() {
    // Change the state back to Game.
    this.state.start('Game')
  }
}
