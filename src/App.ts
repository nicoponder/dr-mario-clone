import Board from "./Board";
import seedrandom from "seedrandom";
import GameSettings from "./GameSettings";

const defaultSettings: GameSettings = {
  players: 1,
  boardWidth: 8,
  boardHeight: 16,
  initialViruses: 60,
  previewPills: 1
};

class App {
  element: HTMLElement;
  rng: any;
  settings: GameSettings;

  constructor(element: HTMLElement) {
    this.element = element;
    this.settings = defaultSettings;
    element.className = "app";
    this.rng = seedrandom();
  }

  reset() {}

  init() {
    const seed = this.rng();

    for (let i = 0; i < this.settings.players; i++) {
      const board = new Board(seed, this.settings, i);
      this.element.appendChild(board.element);
    }
  }
}

export default App;
