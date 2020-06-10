import Piece from "./Piece";
import Color from "./Color";

class Virus extends Piece {
  constructor(rng: Function, x: number, y: number, color: Color) {
    super(rng, x, y);
    this.color = color;
  }

  fall() {
    // since viruses do not fall, no cell modification
    // did not collide, so return false
    return false;
  }

  draw(canvas: HTMLCanvasElement, cellSize: number) {
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = Color[this.color];
    ctx.fillRect(
      this.x * cellSize,
      canvas.height - (this.y+1) * cellSize,
      cellSize - 1,
      cellSize - 1
    );
  }
}

export default Virus;
