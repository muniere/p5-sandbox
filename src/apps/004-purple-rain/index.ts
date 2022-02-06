// https://www.youtube.com/watch?v=KkyIDI6rQJI
import * as p5 from "p5";

const Params = Object.freeze({
  CANVAS_COLOR: '#E6E6FA',
  DROP_COLOR : '#8A2BE2',
  DROP_COUNT : 500,
});

class Drop {
  constructor(
    public position: p5.Vector,
    public velocity: p5.Vector,
    public length: number,
  ) {
    // no-op
  }

  static create(): Drop {
    const pos = new p5.Vector();
    const vel = new p5.Vector();
    return new Drop(pos, vel, 10);
  }

  atRandom(p: p5): Drop {
    const pos = this.position.copy();
    pos.x = p.width * Math.random();
    pos.y = -500 * Math.random();
    pos.z = 20 * Math.random()
    const vel = this.velocity.copy();
    const len = p.map(pos.z, 0, 20, 10, 20);
    return new Drop(pos, vel, len);
  }

  fall(p: p5) {
    const grav = p.map(this.position.z, 0, 20, 0, 0.1);
    this.position.y += this.velocity.y;
    this.velocity.y += grav;
  }

  draw(p: p5) {
    p.stroke(Params.DROP_COLOR);
    p.line(this.position.x, this.position.y, this.position.x, this.position.y + this.length);
  }

  reset(p: p5) {
    this.position.y = -Math.random() * 100;
    this.velocity.y = 0;
  }

  testOvershoot(p: p5): boolean {
    return this.position.y >= p.height;
  }
}

function sketch(self: p5) {
  let drops: Drop[];

  self.setup = function () {
    self.createCanvas(self.windowWidth, self.windowHeight);
    drops = [...Array(Params.DROP_COUNT)].map(_ => Drop.create().atRandom(self));
  };

  self.draw = function () {
    self.background(Params.CANVAS_COLOR);

    drops.forEach((it) => {
      it.fall(self);
      it.draw(self);
    });

    drops.filter(it => it.testOvershoot(self)).forEach(it => it.reset(self));
  }
}

export { sketch };
