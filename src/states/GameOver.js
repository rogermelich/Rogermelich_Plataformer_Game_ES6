export default class extends Phaser.State {
  preload() {
    this.stateText = game.add.text(400,200,' ', { fontSize: '24px', fill: '#FFFFFF' });
    this.stateText.text = "    Game Over \n Click to restart";
  }

  create() {
    this.game.stage.backgroundColor = "#000"
    this.stateText.visible = true
    game.input.onTap.addOnce(this.startGame, this)
  }

  startGame() {
    // Change the state back to Game.
    this.state.start('Game')
  }
}
