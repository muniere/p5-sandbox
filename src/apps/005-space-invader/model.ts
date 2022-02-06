import { Point, Size } from '../../lib/graphics2d';

export class ShipState {
  public color: string = '#FFFFFF';

  constructor(
    public center: Point,
    public radius: number,
    public speed: number,
  ) {
    // no-op
  }

  static create({center, radius, speed}: {
    center: Point,
    radius: number,
    speed: number,
  }): ShipState {
    return new ShipState(center, radius, speed);
  }

  get left(): number {
    return this.center.x - this.radius;
  }

  get right(): number {
    return this.center.x - this.radius;
  }

  moveLeft() {
    this.center = this.center.minus({x: this.speed});
  }

  moveRight() {
    this.center = this.center.plus({x: this.speed});
  }

  constraint(bounds: Size) {
    this.center = this.center.with({
      x: Math.max(this.radius, Math.min(bounds.width - this.radius, this.center.x)),
    })
  }
}

export class EnemyState {
  public color: string = '#FF00C0';
  public active: boolean = true;

  constructor(
    public center: Point,
    public radius: number,
    public speed: number,
  ) {
    // no-op
  }

  static create({center, radius, speed}: {
    center: Point,
    radius: number,
    speed: number,
  }): EnemyState {
    return new EnemyState(center, radius, speed);
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

  moveLeft() {
    this.center = this.center.minus({x: this.speed});
  }

  moveRight() {
    this.center = this.center.plus({x: this.speed});
  }

  moveDown(distance: number) {
    this.center = this.center.plus({y: distance});
  }

  die() {
    this.active = false;
  }
}

export class MissileState {
  public color: string = '#00FFC0';
  public active: boolean = true;

  constructor(
    public center: Point,
    public radius: number,
    public speed: number,
  ) {
    // no-op
  }

  static create({center, radius, speed}: {
    center: Point,
    radius: number,
    speed: number,
  }): MissileState {
    return new MissileState(center, radius, speed);
  }

  get top(): number {
    return this.center.y - this.radius;
  }

  get bottom(): number {
    return this.center.y + this.radius;
  }

  update() {
    this.center = this.center.minus({y: this.speed});
  }

  die() {
    this.active = false;
  }

  hitTest(enemy: EnemyState): boolean {
    return this.active && Point.dist(this.center, enemy.center) < (this.radius + enemy.radius) / 2;
  }
}

export class GameBuilder {

  public bounds: Size = Size.zero();

  public shipColor: string = '#FFFFFF';
  public shipRadius: number = 0;
  public shipSpeed: number = 0;

  public enemyColor: string = '#FFFFFF';
  public enemyOrigin: Point = Point.zero();
  public enemyMargin: Size = Size.zero();
  public enemyGrid: Size = Size.zero();
  public enemyRadius: number = 0;
  public enemySpeed: number = 0;
  public enemyTick: number = 0;
  public enemyStep: number = 0;

  public missileColor: string = '#FFFFFF';
  public missileRadius: number = 0;
  public missileSpeed: number = 0;
  public missileLimit: number = 0;

  also(mutate: (builder: GameBuilder) => void): GameBuilder {
    mutate(this);
    return this;
  }

  public build(): GameState {
    const rule = GameRule.create({
      enemyTick : this.enemyTick,
      enemyStep: this.enemyStep,
      missileLimit: this.missileLimit
    });

    const ship = ShipState.create({
      center: Point.of({
        x: this.bounds.width / 2,
        y: this.bounds.height - this.shipRadius,
      }),
      radius: this.shipRadius,
      speed: this.shipSpeed,
    });
    ship.color = this.shipColor;

    const enemies = [] as EnemyState[];

    for (let row = 0; row < this.enemyGrid.height; row++) {
      const y = this.enemyOrigin.y + this.enemyRadius + (this.enemyRadius * 2 + this.enemyMargin.height) * row;

      for (let column = 0; column < this.enemyGrid.width; column++) {
        const x = this.enemyOrigin.x + this.enemyRadius + (this.enemyRadius * 2 + this.enemyMargin.width) * column;

        const enemy = EnemyState.create({
          center: Point.of({x, y}),
          radius: this.enemyRadius,
          speed: this.enemySpeed,
        });
        enemy.color = this.enemyColor;
        enemies.push(enemy);
      }
    }

    const missile = MissileState.create({
      center: Point.zero(),
      radius: this.missileRadius,
      speed: this.missileSpeed,
    });
    missile.color = this.missileColor;

    return new GameState(rule, ship, enemies, missile);
  }
}

export class GameContext {

  public constructor(
    public readonly frameCount: number,
    public readonly canvasSize: Size,
    public readonly direction?: number,
  ) {
    // no-op
  }

  static create({frameCount, canvasSize, direction}: {
    frameCount: number,
    canvasSize: Size,
    direction?: number,
  }) : GameContext {
    return new GameContext(frameCount, canvasSize, direction);
  }
}

export class GameRule {

  constructor(
    public readonly enemyTick: number,
    public readonly enemyStep: number,
    public readonly missileLimit: number,
  ) {
    // no-op
  }

  static create({enemyTick, enemyStep, missileLimit}: {
    enemyTick: number,
    enemyStep: number,
    missileLimit: number,
  }) : GameRule {
    return new GameRule(enemyTick, enemyStep, missileLimit);
  }
}

export class GameState {
  private enemyDirection: number = 1;
  public missiles: MissileState[] = [];

  constructor(
    public rule: GameRule,
    public ship: ShipState,
    public enemies: EnemyState[],
    public missile: MissileState,
  ) {
    // no-op
  }

  static create(build: (builder: GameBuilder) => void): GameState {
    return new GameBuilder().also(build).build();
  }

  fire() {
    if (this.missiles.length >= this.rule.missileLimit) {
      return;
    }

    this.missiles.push(
      MissileState.create({
        center: this.ship.center.copy(),
        radius: this.missile.radius,
        speed: this.missile.speed,
      })
    );
  }

  update(context: GameContext) {
    // ship
    switch (context.direction) {
      case -1:
        this.ship.moveLeft();
        break;
      case 1:
        this.ship.moveRight();
        break;
      default:
        break;
    }

    this.ship.constraint(context.canvasSize);

    // enemies
    if (context.frameCount % this.rule.enemyTick == 0) {
      switch (this.enemyDirection) {
        case 1:
          this.enemies.forEach(it => it.moveRight());
          break;
        case -1:
          this.enemies.forEach(it => it.moveLeft());
          break;
        default:
          this.enemies.forEach(it => it.moveDown(this.rule.enemyStep));
          break;
      }

      this.enemyDirection = (() => {
        const left = Math.min(...this.enemies.map((it) => it.left));
        const right = Math.max(...this.enemies.map((it) => it.right));
        switch (this.enemyDirection) {
          case 1:
            return right >= context.canvasSize.width ? 0 : 1;
          case -1:
            return left <= 0 ? 0 : -1;
          default:
            return left <= 0 ? 1 : -1;
        }
      })();
    }

    // missile
    this.missiles.forEach((missile) => {
      missile.update();

      this.enemies.filter(it => missile.hitTest(it)).forEach((enemy) => {
        enemy.die();
        missile.die();
      });
    })

    this.enemies = this.enemies.filter(it => it.active);
    this.missiles = this.missiles.filter(it => it.active && it.bottom >= 0);
  }
}
