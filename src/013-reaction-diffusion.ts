// https://www.youtube.com/watch?v=BV9ny785UNc
// see http://www.karlsims.com/rd.html for details
import * as p5 from "p5";

const Params = Object.freeze({
  CANVAS_COLOR: '#333333',
  DIFFUSION_A: 1.0,
  DIFFUSION_B: 0.5,
  FEED_RATE: 0.055,
  KILL_RATE: 0.062,
  SEED_RADIUS: 4,
  GENERATION_INTERVAL: 1,
});

class Cell {

  constructor(
    public a: number,
    public b: number,
  ) {
    // no-op
  }

  static create({a, b}: {
    a: number,
    b: number,
  }): Cell {
    return new Cell(a, b);
  }

  static random(): Cell {
    return Cell.create({
      a: Math.random(),
      b: Math.random(),
    });
  }

  static zero(): Cell {
    return new Cell(0, 0);
  }

  static fold(cells: Cell[]): Cell {
    return cells.reduce((acc, cell) => acc.plus(cell), Cell.zero());
  }

  plus(other: Cell): Cell {
    return Cell.create({
      a: this.a + other.a,
      b: this.b + other.b,
    });
  }

  minus(other: Cell): Cell {
    return Cell.create({
      a: this.a - other.a,
      b: this.b - other.b,
    });
  }

  times(r: number): Cell {
    return Cell.create({
      a: this.a * r,
      b: this.b * r,
    });
  }

  copy(): Cell {
    return new Cell(this.a, this.b);
  }
}

class Grid {

  constructor(
    private cells: Cell[][]
  ) {
    // no-op
  }

  static random({width, height}: {
    width: number,
    height: number,
  }): Grid {
    return this.generate({
      width: width,
      height: height,
      create: () => Cell.random(),
    });
  }

  static generate({width, height, create}: {
    width: number,
    height: number,
    create: (x: number, y: number) => Cell,
  }): Grid {
    return new Grid(
      [...Array(height)].map(
        (_, y) => [...Array(width)].map(
          (_, x) => create(x, y)
        )
      )
    );
  }

  map(transform: (cell: Cell, x: number, y: number) => Cell) {
    return new Grid(
      [...Array(this.height)].map(
        (_, y) => [...Array(this.width)].map(
          (_, x) => transform(this.cell(x, y).copy(), x, y),
        )
      )
    );
  }

  copy(): Grid {
    return this.map(it => it);
  }

  replace(x: number, y: number, transform: (cell: Cell) => Cell) {
    this.cells[y][x] = transform(this.cells[y][x]);
  }

  cell(x: number, y: number): Cell {
    return this.cells[y][x];
  }

  cellOrDefault(x: number, y: number, defValue: Cell = Cell.zero()): Cell {
    if (x < 0 || this.width <= x) {
      return defValue;
    }
    if (y < 0 || this.height <= y) {
      return defValue;
    }
    return this.cells[y][x];
  }

  laplace(x: number, y: number): Cell {
    const cells = [
      this.cell(x, y).times(-1),
      this.cellOrDefault(x + 1, y).times(0.2),
      this.cellOrDefault(x - 1, y).times(0.2),
      this.cellOrDefault(x, y + 1).times(0.2),
      this.cellOrDefault(x, y - 1).times(0.2),
      this.cellOrDefault(x - 1, y - 1).times(0.05),
      this.cellOrDefault(x - 1, y + 1).times(0.05),
      this.cellOrDefault(x + 1, y - 1).times(0.05),
      this.cellOrDefault(x + 1, y + 1).times(0.05),
    ];

    return Cell.fold(cells);
  }

  get width(): number {
    return this.cells.length > 0 ? this.cells[0].length : 0;
  }

  get height(): number {
    return this.cells.length;
  }
}

class Diffusion {

  static next(grid: Grid): Grid {
    return grid.map(
      (cell, x, y) => {
        if (x <= 0 || grid.width - 1 <= x) {
          return cell;
        }
        if (y <= 0 || grid.height - 1 <= y) {
          return cell;
        }
        const lap = grid.laplace(x, y);

        const a = cell.a
          + (Params.DIFFUSION_A * lap.a)
          - (cell.a * cell.b * cell.b)
          + (Params.FEED_RATE * (1.0 - cell.a));

        const b = cell.b
          + (Params.DIFFUSION_B * lap.b)
          + (cell.a * cell.b * cell.b)
          - (Params.KILL_RATE + Params.FEED_RATE) * cell.b

        return Cell.create({a, b});
      }
    );
  }

  static forward(grid: Grid, n: number): Grid {
    if (n <= 0) {
      return grid.copy();
    }

    return [...Array(n)].reduce((acc, _) => this.next(acc), grid);
  }
}

function sketch(self: p5) {
  let grid: Grid;

  self.setup = function () {
    self.createCanvas(400, 400);
    self.pixelDensity(1);

    const dropLeft = Math.floor(self.width / 2) - Params.SEED_RADIUS;
    const dropRight = Math.floor(self.width / 2) + Params.SEED_RADIUS;
    const dropTop = Math.floor(self.height / 2) - Params.SEED_RADIUS;
    const dropBottom = Math.floor(self.height / 2) + Params.SEED_RADIUS;

    grid = Grid.generate({
      width: self.width,
      height: self.height,
      create: (x, y) => {
        if (dropLeft <= x && x <= dropRight && dropTop <= y && y <= dropBottom) {
          return Cell.create({a: 0, b: 1});
        } else {
          return Cell.create({a: 1, b: 0});
        }
      }
    });
  };

  self.draw = function () {
    // draw
    self.loadPixels();

    for (let x = 0; x < self.width; x++) {
      for (let y = 0; y < self.height; y++) {
        const idx = (x + y * self.width) * 4;
        const cell = grid.cell(x, y);
        const value = Math.floor((cell.a - cell.b) * 255);
        const color = Math.min(Math.max(value, 0), 255);
        self.pixels[idx + 0] = color;
        self.pixels[idx + 1] = color;
        self.pixels[idx + 2] = color;
        self.pixels[idx + 3] = 255;
      }
    }

    self.updatePixels();

    // update
    grid = Diffusion.forward(grid, Params.GENERATION_INTERVAL);
  };
}

export { sketch };
