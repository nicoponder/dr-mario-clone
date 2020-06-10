import seedrandom from "seedrandom";

import GameSettings from "./GameSettings";
import Piece, { IPiece } from "./Piece";
import Pill from "./Pill";
import Virus from "./Virus";

class Board {
  score: Number;
  rng: any;
  element: HTMLCanvasElement;
  settings: GameSettings;
  cells: (Piece | Virus | null)[][];
  virusCount: number;
  previewPills: Pill[];
  currentPill: Pill;
  stopLoop: any;

  constructor(seed: Number, settings: GameSettings, index: Number) {
    this.score = 0;
    this.rng = seedrandom(seed);
    this.element = document.createElement("canvas");
    this.element.id = `board-${index}`;
    this.settings = settings;
    this.virusCount = this.settings.initialViruses;
    this.cells = this.newBoard();
    this.currentPill = new Pill(
      this.rng,
      this.settings.boardWidth,
      this.settings.boardHeight
    );
    this.previewPills = [];
    for (let i = 0; i < this.settings.previewPills; i++) {
      this.previewPills[i] = new Pill(
        this.rng,
        this.settings.boardWidth,
        this.settings.boardHeight
      );
    }

    this.nextPill();
    const now = window.performance.now();
    this.tick(now, now, now);
  }

  tick(
    now: DOMHighResTimeStamp,
    lastTick: DOMHighResTimeStamp,
    lastGravityTick: DOMHighResTimeStamp
  ) {
    if (now - lastTick < 16) {
      this.stopLoop = window.requestAnimationFrame(newNow =>
        this.tick(newNow, lastTick, lastGravityTick)
      );
      return;
    }

    let curLastGravityTick = lastGravityTick;
    if (now - lastGravityTick > 1000) {
      this.gravityTick();
      curLastGravityTick = now;
    }

    this.draw();

    this.stopLoop = window.requestAnimationFrame(newNow =>
      this.tick(newNow, now, curLastGravityTick)
    );
  }

  nextPill() {
    this.currentPill = this.previewPills.shift()!;
    this.previewPills.push(
      new Pill(this.rng, this.settings.boardWidth, this.settings.boardHeight)
    );
    const [left, right] = this.currentPill.pieces;
    if (this.cells[left.y][left.x] || this.cells[right.y][right.x]) {
      this.lose();
      return;
    }
    this.cells[left.y][left.x] = left;
    this.cells[right.y][right.x] = right;
  }

  newBoard() {
    const cells: (Piece | Virus | null)[][] = [];
    for (let i = 0; i < this.settings.boardHeight; i++) {
      cells[i] = [];
    }

    this.virusCount = 0;

    while (this.virusCount < this.settings.initialViruses) {
      const y = Math.abs(this.rng.int32()) % (this.settings.boardHeight - 5);
      const x = Math.abs(this.rng.int32()) % this.settings.boardWidth;
      const cell = cells[y][x];
      if (!cell) {
        let color = Math.abs(this.rng.int32()) % 3;
        const [left, right] = this.getContiguousX({ x, y, color }, cells);
        const [lo, hi] = this.getContiguousY({ x, y, color }, cells);
        if (right - left < 2 && hi - lo < 2) {
          cells[y][x] = new Virus(this.rng, x, y, color);
        }
      }
      this.virusCount++;
    }

    return cells;
  }

  forEachCell(fn: any) {
    this.cells.forEach(row => {
      row.forEach(cell => {
        if (cell) {
          fn(cell);
        }
      });
    });
  }

  lose() {
    window.alert("lose!");
    window.cancelAnimationFrame(this.stopLoop);
  }

  win() {}

  draw() {
    const cellSize = 25;
    this.element.height = this.settings.boardHeight * cellSize;
    this.element.width = this.settings.boardWidth * cellSize;

    this.forEachCell((cell: Piece) => {
      cell.draw(this.element, cellSize);
    });
  }

  getContiguousX({ x, y, color }: IPiece, cells = this.cells) {
    let leftmostSame = x;
    for (let i = leftmostSame - 1; i >= 0; i--) {
      const cell = cells[y][i];
      if (!cell || color !== cell.color) {
        break;
      }
      leftmostSame--;
    }

    let rightmostSame = x;
    for (let i = rightmostSame + 1; i < this.settings.boardWidth; i++) {
      const cell = cells[y][i];
      if (!cell || color !== cell.color) {
        break;
      }
      rightmostSame++;
    }

    return [leftmostSame, rightmostSame];
  }

  getContiguousY({ x, y, color }: IPiece, cells = this.cells) {
    let lowestSame = y;
    for (let i = lowestSame - 1; i >= 0; i--) {
      const cell = cells[i][x];
      if (!cell || color !== cell.color) {
        break;
      }
      lowestSame--;
    }

    let highestSame = y;
    for (let i = highestSame + 1; i < this.settings.boardHeight; i++) {
      const cell = cells[i][x];
      if (!cell || color !== cell.color) {
        break;
      }
      highestSame++;
    }

    return [lowestSame, highestSame];
  }

  attemptClear(piece: Piece) {
    let [leftmostSame, rightmostSame] = this.getContiguousX(piece);
    let [lowestSame, highestSame] = this.getContiguousX(piece);

    if (highestSame - lowestSame > 3) {
      for (lowestSame; lowestSame <= highestSame; lowestSame++) {
        const cell = this.getCell(piece.x, lowestSame);
        if (cell) {
          cell.destroy();
          this.cells[piece.x][lowestSame] = null;
        }
      }
    }

    if (rightmostSame - leftmostSame > 3) {
      for (leftmostSame; leftmostSame <= rightmostSame; leftmostSame++) {
        const cell = this.getCell(leftmostSame, rightmostSame);
        if (cell) {
          cell.destroy();
          this.cells[piece.x][lowestSame] = null;
        }
      }
    }
  }

  getCell(x: number, y: number) {
    return this.cells[y][x];
  }

  gravityTick() {
    const newCollisions: [number, number][] = [];

    this.forEachCell((cell: Piece) => {
      if (cell.fall(this.cells)) {
        newCollisions.push([cell.x, cell.y]);
      }
    });

    newCollisions.forEach(([x, y]) => {
      this.attemptClear(this.cells[y][x]!);
    });

    if (newCollisions.length > 0) {
      this.nextPill();
    }
  }
}

export default Board;
