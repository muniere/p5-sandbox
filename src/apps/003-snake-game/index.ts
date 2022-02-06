// https://www.youtube.com/watch?v=AaGK-fj-BAM
import * as p5 from "p5";

class Snake {
  private body: p5.Vector[] = [];

  constructor(
    public head: p5.Vector,
    public velocity: p5.Vector,
    public scale: number,
  ) {
    // no-op
  }

  static create(params: { scale: number }): Snake {
    const pos = new p5.Vector();
    const vel = new p5.Vector();
    vel.x = 1;
    vel.y = 0;
    return new Snake(pos, vel, params.scale);
  }

  get left(): number {
    return this.head.x;
  }

  get right(): number {
    return this.head.x + this.scale;
  }

  get top(): number {
    return this.head.y;
  }

  get bottom(): number {
    return this.head.y + this.scale;
  }

  update() {
    // compute
    const delta = p5.Vector.mult(this.velocity, this.scale);

    const next = new p5.Vector();
    next.x = this.head.x + delta.x;
    next.y = this.head.y + delta.y;

    // update
    if (this.body.length > 0) {
      for (let i = this.body.length - 1; i > 0; i--) {
        this.body[i] = this.body[i - 1];
      }
      this.body[0] = this.head.copy();
    }

    this.head = next;
  }

  draw(p: p5) {
    p.fill(255);

    [this.head, ...this.body].forEach(
      it => p.rect(it.x, it.y, this.scale, this.scale)
    );
  }

  dir(x: number, y: number) {
    this.velocity.x = x;
    this.velocity.y = y;
  }

  eat(f: Food): boolean {
    if (!this.hitTest(f.position)) {
      return false;
    }

    this.body.push(this.head.copy());
    return this.hitTest(f.position);
  }

  testOvershoot(p: p5): boolean {
    return (this.head.x < 0 || p.width <= this.head.x) || (this.head.y < 0 || p.height <= this.head.y);
  }

  testUroboros(): boolean {
    return this.body.some(it => p5.Vector.dist(it, this.head) < 0.01);
  }

  private hitTest(v: p5.Vector): boolean {
    return (this.left <= v.x && v.x < this.right) && (this.top <= v.y && v.y < this.bottom);
  }
}

class Food {
  constructor(
    public position: p5.Vector,
    public scale: number,
  ) {
    // no-op
  }

  static create(params: { scale: number }): Food {
    const pos = new p5.Vector();
    return new Food(pos, params.scale);
  }

  atRandom(p: p5): Food {
    const pos = new p5.Vector();
    pos.x = Math.floor(Math.random() * p.width / this.scale) * this.scale;
    pos.y = Math.floor(Math.random() * p.height / this.scale) * this.scale;
    return new Food(pos, this.scale);
  }

  draw(p: p5) {
    p.fill(255, 0, 0);
    p.rect(this.position.x, this.position.y, this.scale, this.scale);
  }
}

function sketch(self: p5) {
  const SCALE = 20;

  let snake: Snake
  let food: Food

  self.setup = function () {
    self.frameRate(10);
    self.createCanvas(self.windowWidth, self.windowHeight);

    snake = Snake.create({scale: SCALE});
    food = Food.create({scale: SCALE}).atRandom(self);
  }

  self.draw = function () {
    self.background(51);

    snake.update();

    if (snake.testOvershoot(self) || snake.testUroboros()) {
      snake = Snake.create({scale: SCALE});
    }
    if (snake.eat(food)) {
      food = Food.create({scale: SCALE}).atRandom(self);
    }

    snake.draw(self);
    food.draw(self);
  }

  self.keyPressed = function () {
    switch (self.keyCode) {
      case self.UP_ARROW:
        if (snake.velocity.y == 0) {
          snake.dir(0, -1);
        }
        break;
      case self.DOWN_ARROW:
        if (snake.velocity.y == 0) {
          snake.dir(0, 1);
        }
        break;
      case self.LEFT_ARROW:
        if (snake.velocity.x == 0) {
          snake.dir(-1, 0);
        }
        break;
      case self.RIGHT_ARROW:
        if (snake.velocity.x == 0) {
          snake.dir(1, 0);
        }
        break;
    }
  }
}

export { sketch };
