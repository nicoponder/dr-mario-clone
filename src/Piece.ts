import Direction from "./Direction";
import Color from "./Color";

export interface IPiece {
  color: Color;
  direction?: Direction;
  x: number;
  y: number;
  isFalling?: boolean;
}

class Piece implements IPiece {
  color: Color;
  direction?: Direction;
  x: number;
  y: number;
  isFalling: boolean;

  constructor(rng: any, x: number, y: number, direction?: Direction) {
    const numColors = Object.keys(Color).length / 2;
    this.color = Math.abs(rng.int32()) % numColors;
    // this.color = 1;
    this.direction = direction;
    this.x = x;
    this.y = y;
  }

  draw(canvas: HTMLCanvasElement, cellSize: number) {
    const r = cellSize / 2;
    const ctx = canvas.getContext("2d")!;
    ctx.beginPath();
    ctx.arc(
      cellSize * this.x + r,
      canvas.height - (this.y+1) * cellSize + r,
      r,
      0,
      2 * Math.PI
    );
    ctx.fillStyle = Color[this.color];
    ctx.fill();
    if (this.direction === Direction.Left) {
      ctx.fillRect(
        this.x * cellSize + r,
        canvas.height - (this.y+1) * cellSize,
        r,
        cellSize
      );
    }
    if (this.direction === Direction.Right) {
      ctx.fillRect(
        this.x * cellSize,
        canvas.height - (this.y+1) * cellSize,
        r,
        cellSize
      );
    }
  }

  destroy() {}

  fall(cells: (Piece | null)[][], newCells: (Piece | null)[][]) {
    const hasCellBelow = Boolean(cells[this.y - 1][this.x]) || this.y - 1 < 0;
    const hasStuckSibling =
      (this.direction === Direction.Left && Boolean(cells[this.y-1][this.x+1])) ||
      (this.direction === Direction.Right && Boolean(cells[this.y-1][this.x-1]));

    // stop falling, report collision
    if (this.isFalling && (hasStuckSibling || hasCellBelow)) {
      this.isFalling = false;
      newCells[this.y][this.x] = cells[this.y][this.x];
      return true;
    }

    // start/continue falling, report no new collisions
    if (!this.isFalling && !hasCellBelow && !hasStuckSibling) {
      this.isFalling = true;
    }
    if (this.isFalling) {
      newCells[this.y - 1][this.x] = cells[this.y][this.x];
      newCells[this.y][this.x] = null;
      this.y = this.y - 1;
    }
    return false;
  }

  equals(piece: (Piece|null)) {
    if (
      piece &&
      this.isFalling === piece.isFalling &&
      this.direction === piece.direction &&
      this.y === piece.y && 
      this.x === piece.x &&
      this.color === piece.color
    ) {
      return true;
    }
    return false;
  }
}

export default Piece;
