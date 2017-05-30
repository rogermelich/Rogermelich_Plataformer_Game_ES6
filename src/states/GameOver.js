export default class extends Phaser.State {
  preload() {
    this.stateText = game.add.text(400,200,' ', { fontSize: '24px', fill: '#FFFFFF' });
    this.stateText.text = "    Game Over \n Click to restart";
    this.game.load.audio('game_over', './assets/audio/game_over.mp3')
  }

  create() {
    this.game.stage.backgroundColor = "#000"
    this.stateText.visible = true
    game.input.onTap.addOnce(this.startGame, this)
    this.game_overSound = this.game.add.audio('game_over')
    this.game_overSound.play()
  }

  startGame() {
    // Change the state back to Game.
    this.state.start('Game')
  }
}
