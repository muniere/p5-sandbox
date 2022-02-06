// https://www.youtube.com/watch?v=LG8ZK-rRkXo
import * as p5 from 'p5';

class Box {
  constructor(
    public pos: p5.Vector,
    public r: number,
  ) {
    // no-op
  }

  next(): Box[] {
    let boxes = [];

    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          const ones = [x, y, z].filter(it => Math.abs(it) > 0);
          if (ones.length < 2) {
            continue;
          }

          const newR = this.r / 3;
          const vec = new p5.Vector();
          vec.x = this.pos.x + x * newR;
          vec.y = this.pos.y + y * newR;
          vec.z = this.pos.z + z * newR;
          const box = new Box(vec, newR);
          boxes.push(box);
        }
      }
    }

    return boxes;
  }

  draw(p: p5) {
    p.push();
    p.translate(this.pos);
    p.fill(255);
    p.box(this.r);
    p.pop();
  }
}

function sketch(self: p5) {
  let sponge: Box[] = [];
  let rotation = 0

  self.setup = function () {
    self.createCanvas(self.windowWidth, self.windowHeight, self.WEBGL);

    sponge.push(new Box(self.createVector(0, 0, 0), 200));
  }

  self.draw = function () {
    self.background(51);
    self.stroke(255);
    self.noFill();
    self.lights();

    self.rotateX(rotation);
    self.rotateY(rotation * 0.5)
    self.rotateZ(rotation * 0.2)

    sponge.forEach((box) => {
      box.draw(self);
    });

    rotation += 0.01;
  }

  self.mousePressed = function () {
    sponge = sponge.reduce(
      (acc, box) => [...acc, ...box.next()], [] as Box[]
    );
  }
}

export { sketch };
