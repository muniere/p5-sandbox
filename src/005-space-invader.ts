// https://www.youtube.com/watch?v=biN3v3ef-Y0
import * as p5 from "p5";

const Params = Object.freeze({
  CANVAS_COLOR: '#333333',

  // ship
  SHIP_RADIUS: 20,
  SHIP_SPEED: 5,

  // enemy
  ENEMY_ORIGIN: new p5.Vector().add(50, 50, 0),
  ENEMY_COLUMNS: 12,
  ENEMY_ROWS: 3,
  ENEMY_SPACE: 30,
  ENEMY_RADIUS: 30,
  ENEMY_SPEED: 10,
  ENEMY_TICK: 60,

  // missile
  MISSILE_SIZE: 20,
  MISSILE_SPEED: 5,
  MISSILE_LIMIT: 1,
});

class Ship {
  constructor(
    public center: p5.Vector,
    public radius: number = Params.SHIP_RADIUS,
    public speed: number = Params.SHIP_SPEED,
  ) {
    // no-op
  }

  get left(): number {
    return this.center.x - this.radius;
  }

  get right(): number {
    return this.center.x - this.radius;
  }

  draw(p: p5) {
    p.fill('#FFFFFF');
    p.rectMode(p.CENTER);
    p.rect(this.center.x, this.center.y, this.radius, this.radius);
  }

  moveLeft() {
    this.center.x -= this.speed;
  }

  moveRight() {
    this.center.x += this.speed;
  }

  constraint(p: p5) {
    this.center.x = Math.max(this.radius, Math.min(p.width - this.radius, this.center.x));
  }
}

class Enemy {
  public active: boolean = true;

  constructor(
    public center: p5.Vector,
    public radius: number = Params.ENEMY_RADIUS,
    public speed: number = Params.ENEMY_SPEED
  ) {
    // no-op
  }

  get top(): number {
    return this.center.y - this.radius;
  }

  get bottom(): number {
    return this.center.y + this.radius;
  }

  get left(): number {
    return this.center.x - this.radius;
  }

  get right(): number {
    return this.center.x + this.radius;
  }

  draw(p: p5) {
    if (!this.active) {
      return;
    }
    p.fill('#FF00C0');
    p.ellipse(this.center.x, this.center.y, this.radius, this.radius);
  }

  moveLeft() {
    this.center.x -= this.speed;
  }

  moveRight() {
    this.center.x += this.speed;
  }

  moveDown(distance: number) {
    this.center.y += distance;
  }

  die() {
    this.active = false;
  }
}

class Missile {
  public active: boolean = true;

  constructor(
    public center: p5.Vector,
    public radius: number = Params.MISSILE_SIZE,
    public speed: number = Params.MISSILE_SPEED,
  ) {
  }

  get top(): number {
    return this.center.y - this.radius;
  }

  get bottom(): number {
    return this.center.y + this.radius;
  }

  draw(p: p5) {
    if (!this.active) {
      return;
    }

    p.noStroke();
    p.fill('#00FFC0');
    p.ellipse(this.center.x, this.center.y, this.radius, this.radius);
  }

  update() {
    this.center.y -= this.speed
  }

  die() {
    this.active = false;
  }

  hitTest(flower: Enemy): boolean {
    return this.active && p5.Vector.dist(this.center, flower.center) < (this.radius + flower.radius) / 2;
  }
}

function sketch(self: p5) {
  let ship: Ship
  let shipDirection: number = 1;
  let enemies: Enemy[]
  let missiles: Missile[]
  let enemyDirection: number = 1;

  self.setup = function () {
    self.createCanvas(self.windowWidth, self.windowHeight);
    ship = new Ship(self.createVector(self.width / 2, self.height - Params.SHIP_RADIUS));

    enemies = [];

    for (let row = 0; row < Params.ENEMY_ROWS; row++) {
      const y = Params.ENEMY_ORIGIN.y + Params.ENEMY_RADIUS + (Params.ENEMY_RADIUS * 2 + Params.ENEMY_SPACE) * row;
      for (let column = 0; column < Params.ENEMY_COLUMNS; column++) {
        const x = Params.ENEMY_ORIGIN.x + Params.ENEMY_RADIUS + (Params.ENEMY_RADIUS * 2 + Params.ENEMY_SPACE) * column;
        enemies.push(new Enemy(self.createVector(x, y)));
      }
    }

    missiles = [];
  };

  self.draw = function () {
    // draw
    self.background(Params.CANVAS_COLOR);
    ship.draw(self);
    missiles.forEach(it => it.draw(self))
    enemies.forEach(it => it.draw(self));

    // update
    if (self.keyIsPressed) {
      switch (self.keyCode) {
        case self.LEFT_ARROW:
          ship.moveLeft();
          break;
        case self.RIGHT_ARROW:
          ship.moveRight();
          break;
        default:
          break;
      }

      ship.constraint(self);
    }

    if (self.frameCount % Params.ENEMY_TICK == 0) {
      switch (enemyDirection) {
        case 1:
          enemies.forEach(it => it.moveRight());
          break;
        case -1:
          enemies.forEach(it => it.moveLeft());
          break;
        default:
          enemies.forEach(it => it.moveDown(it.radius * 2 + Params.ENEMY_SPACE));
          break;
      }
    }

    missiles.forEach((missile) => {
      missile.update();

      enemies.filter(it => missile.hitTest(it)).forEach((enemy) => {
        enemy.die();
        missile.die();
      });
    })

    enemies = enemies.filter(it => it.active);
    missiles = missiles.filter(it => it.active && it.bottom >= 0);

    enemyDirection = (() => {
      const left = self.min(enemies.map((it) => it.left));
      const right = self.max(enemies.map((it) => it.right));
      switch (enemyDirection) {
        case 1:
          return right >= self.width ? 0 : 1;
        case -1:
          return left <= 0 ? 0 : -1;
        default:
          return left <= 0 ? 1 : -1;
      }
    })();
  }

  self.keyPressed = function () {
    if (self.key == ' ' && missiles.length < Params.MISSILE_LIMIT) {
      missiles.push(new Missile(ship.center.copy()))
    }
  }

  self.keyReleased = function () {
    shipDirection = 0;
  }
}

export { sketch };
