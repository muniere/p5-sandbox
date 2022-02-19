import { Arrays, NumberRange } from '../../lib/stdlib';
import { Colors } from '../../lib/drawing';
import { Point, Size } from '../../lib/graphics2d';
import { Acceleration, CircularMaterial, Force, Velocity } from '../../lib/physics2d';

export class FireworkModel {
  private _core: CircularMaterial | undefined;
  private _petals: CircularMaterial[];
  private _explosion: ExplosionModel;

  private _lifespan: number = 0;
  private _age: number = 0;

  constructor(
    explosion: ExplosionModel,
  ) {
    this._core = undefined;
    this._petals = [];
    this._explosion = explosion;
  }

  public static create({explosion}: {
    explosion: ExplosionModel,
  }): FireworkModel {
    return new FireworkModel(explosion);
  }

  get particles(): CircularMaterial[] {
    const arr = [] as CircularMaterial[];
    if (this._core) {
      arr.push(this._core);
    }
    arr.push(...this._petals);
    return arr;
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
      const force = Force.of({
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

  ensure({bounds}: { bounds: Size }) {
    if (this.particles.every(it => it.top > bounds.height)) {
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

  constructor(
    core: CircularMaterial,
    lifetime: number,
  ) {
    this._core = core;
    this._lifespan = lifetime;
  }

  static create({core, lifetime}: {
    core: CircularMaterial,
    lifetime: number,
  }): FireSeedModel {
    return new FireSeedModel(core, lifetime);
  }

  get core(): CircularMaterial {
    return this._core;
  }

  get lifespan(): number {
    return this._lifespan;
  }
}

export interface IgnitionModel {
  perform({bounds}: { bounds: Size }): FireSeedModel
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

  perform({bounds}: { bounds: Size }): FireSeedModel {
    return FireSeedModel.create({
      core: CircularMaterial.create({
        radius: this.radiusRange.sample(),
        center: Point.of({
          x: bounds.width * Math.random(),
          y: bounds.height,
        }),
        velocity: Velocity.of({
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
      return CircularMaterial.create({
        radius: core.radius * this.scale,
        center: core.center.copy(),
        velocity: Velocity.of({
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
  private readonly _bounds: Size;
  private readonly _gravity: Acceleration;
  private readonly _ignition: IgnitionModel;
  private readonly _fireworks: FireworkModel[];

  constructor(
    bounds: Size,
    gravity: Acceleration,
    ignition: IgnitionModel,
    fireworks: FireworkModel[],
  ) {
    this._bounds = bounds;
    this._gravity = gravity;
    this._ignition = ignition;
    this._fireworks = [...fireworks];
  }

  static create({bounds, gravity, ignition, fireworks}: {
    bounds: Size,
    gravity: Acceleration,
    ignition: IgnitionModel,
    fireworks: FireworkModel[],
  }) {
    return new ApplicationModel(bounds, gravity, ignition, fireworks);
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
        it.ensure({bounds: this._bounds});
      }
      if (!it.active) {
        const particle = this._ignition.perform({
          bounds: this._bounds,
        });
        it.ignite(particle);
      }
      if (it.active) {
        it.apply(this._gravity);
        it.update();
      }
    });
  }
}
