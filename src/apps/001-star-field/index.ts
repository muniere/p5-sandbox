// https://www.youtube.com/watch?v=17WoOqgXsRM
import * as p5 from 'p5';
import { Size } from '../../lib/graphics2d';

const Params = Object.freeze({
  STAR_SIZE : 4,
  STAR_COUNT : 1000,
});

class Star {
  private origin: p5.Vector;

  constructor(
    private size: Size,
    private coord: p5.Vector = new p5.Vector(),
    public speed: number = 0,
  ) {
    this.origin = coord.copy();
  }

  static of(size: number): Star {
    return new Star(new Size(size, size));
  }

  atRandom(p: p5): Star {
    const coord = new p5.Vector();
    coord.x = Math.floor(p.width * (Math.random() - 0.5));
    coord.y = Math.floor(p.height * (Math.random() - 0.5));
    return new Star(this.size.copy(), coord);
  }

  atZ(value: number): Star {
    const coord = this.coord.copy();
    coord.z = value;
    return new Star(this.size.copy(), coord);
  }

  get width(): number {
    return this.size.width;
  }

  get height(): number {
    return this.size.height;
  }

  get x(): number {
    return this.coord.x;
  }

  get y(): number {
    return this.coord.y;
  }

  get z(): number {
    return this.coord.z;
  }

  update(): void {
    this.coord.z -= this.speed;

    if (this.z < 0.01) {
      this.coord.z = this.origin.z;
    }
  }

  draw(p: p5): void {
    const sx = p.map(
      /* value */ this.x / this.z,
      /* from  */ 0, 1,
      /* to    */ 0, p.width,
    );
    const sy = p.map(
      /* value */ this.y / this.z,
      /* from  */ 0, 1,
      /* to    */ 0, p.height,
    );
    const r = p.map(
      /* value */ this.z,
      /* from  */ p.width, 0,
      /* to    */ 0, this.width,
    );
    const px = p.map(
      /* value */ this.x / this.origin.z,
      /* from  */ 0, 1,
      /* to    */ 0, p.width,
    );
    const py = p.map(
      /* value */ this.y / this.origin.z,
      /* from  */ 0, 1,
      /* to    */ 0, p.height,
    );

    p.fill(255);
    p.noStroke();
    p.ellipse(sx, sy, r, r);
    p.stroke(255, 64);
    p.line(px, py, sx, sy);
  }
}

function sketch(self: p5) {
  let stars: Star[];

  self.setup = function () {
    self.createCanvas(self.windowWidth, self.windowHeight);

    stars = [...Array(Params.STAR_COUNT)].map(
      () => Star.of(Params.STAR_SIZE).atRandom(self).atZ(Math.random() * self.width)
    );
  }

  self.draw = function () {
    const distance = Math.sqrt(
      Math.pow(self.mouseX - self.width / 2, 2.0) +
      Math.pow(self.mouseY - self.height / 2, 2.0),
    );
    const speed = self.map(
      /* value */ distance,
      /* from  */ 0, self.width,
      /* to    */ 0, 20,
    );

    self.background(0);

    self.translate(
      self.width / 2,
      self.height / 2,
    );

    stars.forEach(it => {
      it.speed = speed;
      it.update();
      it.draw(self);
    });
  }
}

export { sketch };
