import Direction from "./Direction";
import Piece from "./Piece";

class Pill {
  pieces: [Piece, Piece];

  constructor(rng: Function, boardWidth: number, boardHeight: number) {
    const topRow = boardHeight - 1;
    const middleRight = boardWidth / 2;

    this.pieces = [
      new Piece(rng, middleRight - 1, topRow, Direction.Left),
      new Piece(rng, middleRight, topRow, Direction.Right)
    ];
  }
}

export default Pill;
