  import 'pixi'
import 'p2'
import Phaser from 'phaser'

import SplashState from './states/Splash'
import GameState from './states/Game'
import GameState2 from './states/Game2'
import GameOverState from './states/GameOver'
import MainMenuState from './states/MainMenu'
import WinState  from './states/Win'

import config from './config'

class Game extends Phaser.Game {
  constructor () {
    const docElement = document.documentElement
    const width = docElement.clientWidth > config.gameWidth ? config.gameWidth : docElement.clientWidth
    const height = docElement.clientHeight > config.gameHeight ? config.gameHeight : docElement.clientHeight

    super(width, height, Phaser.CANVAS, 'content', null)

    this.state.add('Splash', SplashState, false)
    this.state.add('GameOver', GameOverState, false)
    this.state.add('Win', WinState, false)
    this.state.add('MainMenu', MainMenuState, false)
    this.state.add('Game2', GameState2, false)
    this.state.add('Game', GameState, false)

    this.state.start('MainMenu')
  }
}

window.game = new Game()
