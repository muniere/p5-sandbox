import { Arrays, NumberRange } from '../../lib/stdlib';
import { Colors } from '../../lib/drawing';
import { Point, Rect } from '../../lib/graphics2d';
import { Acceleration, CircularMaterial, Force, Velocity } from '../../lib/physics2d';

export class FireworkModel {
  private _core: CircularMaterial | undefined;
  private _petals: CircularMaterial[];
  private _explosion: ExplosionModel;

  private _lifespan: number = 0;
  private _age: number = 0;

  constructor(nargs: {
    explosion: ExplosionModel,
  }) {
    this._core = undefined;
    this._petals = [];
    this._explosion = nargs.explosion;
  }

  get particles(): CircularMaterial[] {
    return [this._core, ...this._petals].compactMap(it => it);
  }

  get remaining(): number {
    return (this._lifespan - this._age) / this._lifespan;
  }

  get active(): boolean {
    return this._core != null || this._petals.length > 0;
  }

  ignite(seed: FireSeedModel) {
    this._core = seed.core;
    this._lifespan = seed.lifespan;
    this._age = 0;
  }

  also(mutate: (model: FireworkModel) => void): FireworkModel {
    mutate(this);
    return this;
  }

  apply(gravity: Acceleration) {
    this.particles.forEach(it => {
      const force = new Force({
        x: gravity.x * it.mass,
        y: gravity.y * it.mass,
      });
      it.apply(force)
    });
  }

  update() {
    const core = this._core;

    if (core) {
      core.update();

      if (core.velocity.y >= 0) {
        this._core = undefined;
        this._petals = this._explosion.perform(core);
      } else {
        // keep going
      }
    }

    this._petals.forEach(it => {
      it.update();
    });

    this._age += 1;

    if (this._age > this._lifespan) {
      this._die();
    }
  }

  ensureIn(rect: Rect) {
    if (this.particles.every(it => it.top > rect.bottom)) {
      this._die();
    }
  }

  private _die() {
    this._core = undefined;
    this._petals = [];
  }
}

export class FireSeedModel {
  private readonly _core: CircularMaterial;
  private readonly _lifespan: number;

  constructor(nargs: {
    core: CircularMaterial,
    lifetime: number,
  }) {
    this._core = nargs.core;
    this._lifespan = nargs.lifetime;
  }

  get core(): CircularMaterial {
    return this._core;
  }

  get lifespan(): number {
    return this._lifespan;
  }
}

export interface IgnitionModel {
  performIn(rect: Rect): FireSeedModel
}

export class RandomIgnitionModel implements IgnitionModel {
  public radiusRange = new NumberRange(0, 0);
  public speedRange = new NumberRange(0, 0);
  public lifespanRange = new NumberRange(0, 0);

  static create(): RandomIgnitionModel {
    return new RandomIgnitionModel();
  }

  also(mutate: (builder: RandomIgnitionModel) => void): RandomIgnitionModel {
    mutate(this);
    return this;
  }

  performIn(rect: Rect): FireSeedModel {
    const xs = new NumberRange(rect.left, rect.right);

    return new FireSeedModel({
      core: new CircularMaterial({
        radius: this.radiusRange.sample(),
        center: new Point({
          x: xs.sample(),
          y: rect.bottom,
        }),
        velocity: new Velocity({
          x: 0,
          y: this.speedRange.sample(),
        }),
      }).also(it => {
        it.fillColor = Colors.sample({alpha: 255});
      }),
      lifetime: this.lifespanRange.sample(),
    });
  }
}

export interface ExplosionModel {
  perform(core: CircularMaterial): CircularMaterial[]
}

export class RandomExplosionModel implements ExplosionModel {
  public count: number = 1;
  public scale: number = 1;
  public range = new NumberRange(-1, 1);

  static create(): RandomExplosionModel {
    return new RandomExplosionModel();
  }

  also(mutate: (model: RandomExplosionModel) => void): RandomExplosionModel {
    mutate(this);
    return this;
  }

  perform(core: CircularMaterial): CircularMaterial[] {
    return Arrays.generate(this.count, () => {
      return new CircularMaterial({
        radius: core.radius * this.scale,
        center: core.center.copy(),
        velocity: new Velocity({
          x: this.range.sample(),
          y: this.range.sample(),
        }),
      }).also(it => {
        it.fillColor = core.fillColor;
      });
    });
  }
}

export class ApplicationModel {
  private readonly _frame: Rect;
  private readonly _gravity: Acceleration;
  private readonly _ignition: IgnitionModel;
  private readonly _fireworks: FireworkModel[];

  constructor(nargs: {
    frame: Rect,
    gravity: Acceleration,
    ignition: IgnitionModel,
    fireworks: FireworkModel[],
  }) {
    this._frame = nargs.frame;
    this._gravity = nargs.gravity;
    this._ignition = nargs.ignition;
    this._fireworks = [...nargs.fireworks];
  }

  get bounds(): Rect {
    return this._frame.with({
      origin: Point.zero(),
    });
  }

  get fireworks(): FireworkModel[] {
    return [...this._fireworks];
  }

  push(...fireworks: FireworkModel[]) {
    this._fireworks.push(...fireworks);
  }

  update() {
    this._fireworks.forEach(it => {
      if (it.active) {
        it.ensureIn(this.bounds);
      }
      if (!it.active) {
        const particle = this._ignition.performIn(this.bounds);
        it.ignite(particle);
      }
      if (it.active) {
        it.apply(this._gravity);
        it.update();
      }
    });
  }
}
