// https://www.youtube.com/watch?v=jxGS3fKPKJA
import * as p5 from "p5";

const Params = Object.freeze({
  CANVAS_COLOR: '#333333',
  CELL_RADIUS: 50,
  CELL_GROWTH: 1.01,
  CELL_COUNT: 5,
});


class Cell {
  constructor(
    public center: p5.Vector,
    public radius: number,
    public limit: number,
    public growth: number,
    public color: p5.Color,
  ) {
    // no-op
  }

  static create({center, radius, color}: {
    center: p5.Vector,
    radius: number,
    color: p5.Color
  }): Cell {
    return new Cell(center, radius, Params.CELL_RADIUS, Params.CELL_GROWTH, color);
  }

  draw(p: p5) {
    p.fill(this.color);
    p.ellipse(this.center.x, this.center.y, this.radius * 2);
  }

  update() {
    const vector = p5.Vector.random2D();
    this.center = p5.Vector.add(this.center, vector);
    this.radius = Math.min(this.radius * this.growth, this.limit);
  }

  split(): Cell[] {
    return [
      Cell.create({
        center: this.center.copy().sub(this.radius / 4),
        radius: this.radius / 2,
        color: this.color,
      }),
      Cell.create({
        center: this.center.copy().add(this.radius / 4),
        radius: this.radius / 2,
        color: this.color,
      }),
    ];
  }

  hitTest(point: p5.Vector): boolean {
    return p5.Vector.dist(this.center, point) < this.radius;
  }
}

function sketch(self: p5) {
  let cells: Cell[];

  self.setup = function () {
    self.createCanvas(self.windowWidth, self.windowHeight);

    cells = [...Array(Params.CELL_COUNT)].map(_ => Cell.create({
      center: new p5.Vector().add(
        self.windowWidth * Math.random(),
        self.windowHeight * Math.random()
      ),
      radius: Params.CELL_RADIUS,
      color: self.color(
        255 * Math.random(),
        255 * Math.random(),
        255 * Math.random(),
        128,
      ),
    }));
  }

  self.draw = function () {
    self.background(Params.CANVAS_COLOR);

    [...cells].reverse().forEach((cell) => {
      cell.draw(self);
      cell.update();
    });
  }

  self.mouseClicked = function () {
    const point = new p5.Vector().add(self.mouseX, self.mouseY);
    const index = cells.findIndex(it => it.hitTest(point));
    if (index < 0) {
      return;
    }

    const cell = cells[index];
    cells.splice(index, 1);
    cells = [...cells, ...cell.split()];
  }
}

export { sketch };
