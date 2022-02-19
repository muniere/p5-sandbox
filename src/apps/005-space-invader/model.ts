import { NumberRange } from '../../lib/stdlib';
import { Point, Size } from '../../lib/graphics2d';

export abstract class ObjectModel {
  public color: string = '#FFFFFF';

  protected readonly _radius: number;
  protected readonly _center: Point;
  protected readonly _speed: number;

  protected _active: boolean = true;

  protected constructor(
    radius: number,
    center: Point,
    speed: number,
  ) {
    this._radius = radius;
    this._center = center;
    this._speed = speed;
  }

  get radius(): number {
    return this._radius;
  }

  get top(): number {
    return this._center.y - this._radius;
  }

  get bottom(): number {
    return this._center.y + this._radius;
  }

  get left(): number {
    return this._center.x - this._radius;
  }

  get right(): number {
    return this._center.x + this._radius;
  }

  get center(): Point {
    return this._center.copy();
  }

  get speed(): number {
    return this._speed;
  }

  get active(): boolean {
    return this._active;
  }

  constraint(bounds: Size) {
    const range = new NumberRange(this._radius, bounds.width - this._radius);
    this._center.assign({x: range.coerce(this._center.x)});
  }

  hitTest(other: ObjectModel): boolean {
    return this._active && other._active && Point.dist(this._center, other._center) < (this._radius + other._radius);
  }
}

export class ShipModel extends ObjectModel {
  static create({radius, center, speed}: {
    radius: number,
    center: Point,
    speed: number,
  }): ShipModel {
    return new ShipModel(radius, center, speed);
  }

  moveLeft() {
    this._center.minusAssign({x: this._speed});
  }

  moveRight() {
    this._center.plusAssign({x: this._speed});
  }
}

export class EnemyModel extends ObjectModel {
  static create({radius, center, speed}: {
    radius: number,
    center: Point,
    speed: number,
  }): EnemyModel {
    return new EnemyModel(radius, center, speed);
  }

  moveLeft() {
    this._center.minusAssign({x: this._speed});
  }

  moveRight() {
    this._center.plusAssign({x: this._speed});
  }

  moveDown(distance: number) {
    this._center.plusAssign({y: distance});
  }

  die() {
    this._active = false;
  }
}

export class MissileBlueprint extends ObjectModel {
  static create({radius, center, speed}: {
    radius: number,
    center: Point,
    speed: number,
  }): MissileBlueprint {
    return new MissileBlueprint(radius, center, speed);
  }
}

export class MissileModel extends ObjectModel {
  static create({radius, center, speed}: {
    radius: number,
    center: Point,
    speed: number,
  }): MissileModel {
    return new MissileModel(radius, center, speed);
  }

  update() {
    this._center.minusAssign({y: this.speed});
  }

  die() {
    this._active = false;
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

  public build(): GameModel {
    const rule = GameRule.create({
      enemyTick: this.enemyTick,
      enemyStep: this.enemyStep,
      missileLimit: this.missileLimit
    });

    const ship = ShipModel.create({
      center: Point.of({
        x: this.bounds.width / 2,
        y: this.bounds.height - this.shipRadius,
      }),
      radius: this.shipRadius,
      speed: this.shipSpeed,
    });
    ship.color = this.shipColor;

    const enemies = [] as EnemyModel[];

    for (let row = 0; row < this.enemyGrid.height; row++) {
      const y = this.enemyOrigin.y + this.enemyRadius + (this.enemyRadius * 2 + this.enemyMargin.height) * row;

      for (let column = 0; column < this.enemyGrid.width; column++) {
        const x = this.enemyOrigin.x + this.enemyRadius + (this.enemyRadius * 2 + this.enemyMargin.width) * column;

        const enemy = EnemyModel.create({
          center: Point.of({x, y}),
          radius: this.enemyRadius,
          speed: this.enemySpeed,
        });
        enemy.color = this.enemyColor;
        enemies.push(enemy);
      }
    }

    const missile = MissileModel.create({
      center: Point.zero(),
      radius: this.missileRadius,
      speed: this.missileSpeed,
    });
    missile.color = this.missileColor;

    return new GameModel(rule, ship, enemies, missile);
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
  }): GameContext {
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
  }): GameRule {
    return new GameRule(enemyTick, enemyStep, missileLimit);
  }
}

export class GameModel {
  private enemyDirection: number = 1;

  private readonly _rule: GameRule;
  private readonly _ship: ShipModel;
  private readonly _enemies: EnemyModel[];
  private readonly _missile: MissileBlueprint;
  private readonly _missiles: MissileModel[] = [];

  constructor(
    rule: GameRule,
    ship: ShipModel,
    enemies: EnemyModel[],
    missile: MissileBlueprint,
  ) {
    this._rule = rule;
    this._ship = ship;
    this._enemies = [...enemies];
    this._missile = missile;
  }

  static create(build: (builder: GameBuilder) => void): GameModel {
    return new GameBuilder().also(build).build();
  }

  get ship(): ShipModel {
    return this._ship;
  }

  get enemies(): EnemyModel[] {
    return [...this._enemies];
  }

  get missiles(): MissileModel[] {
    return [...this._missiles];
  }

  fire() {
    if (this._missiles.length >= this._rule.missileLimit) {
      return;
    }

    const newMissile = MissileModel.create({
      center: this._ship.center.copy(),
      radius: this._missile.radius,
      speed: this._missile.speed,
    });

    this._missiles.push(newMissile);
  }

  update(context: GameContext) {
    // ship
    switch (context.direction) {
      case -1:
        this._ship.moveLeft();
        break;
      case 1:
        this._ship.moveRight();
        break;
      default:
        break;
    }

    this._ship.constraint(context.canvasSize);

    // enemies
    if (context.frameCount % this._rule.enemyTick == 0) {
      switch (this.enemyDirection) {
        case 1:
          this._enemies.forEach(it => it.moveRight());
          break;
        case -1:
          this._enemies.forEach(it => it.moveLeft());
          break;
        default:
          this._enemies.forEach(it => it.moveDown(this._rule.enemyStep));
          break;
      }

      this.enemyDirection = (() => {
        const left = Math.min(...this._enemies.map((it) => it.left));
        const right = Math.max(...this._enemies.map((it) => it.right));
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
    this._missiles.forEach((missile) => {
      missile.update();

      this._enemies.filter(it => missile.hitTest(it)).forEach((enemy) => {
        enemy.die();
        missile.die();
      });
    })

    this._enemies.removeWhere(it => !it.active);
    this._missiles.removeWhere(it => !it.active || it.bottom < 0);
  }
}
