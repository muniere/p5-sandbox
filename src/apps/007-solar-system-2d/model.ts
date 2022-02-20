import { Numeric } from '../../lib/stdlib';

export class PlanetModel {
  public color: string = '#FFFFFF';

  private readonly _name: string;
  private readonly _radius: number;
  private readonly _distance: number;
  private readonly _velocity: number;
  private _angle: number;

  private _parent: PlanetModel | undefined;
  private _children: PlanetModel[] = [];

  constructor(nargs: {
    name: string,
    radius: number,
    distance: number,
    velocity: number,
    angle?: number;
  }) {
    this._name = nargs.name;
    this._radius = nargs.radius;
    this._distance = nargs.distance;
    this._velocity = nargs.velocity;
    this._angle = nargs.angle ?? 0;
  }

  get name(): string {
    return this._name;
  }

  get radius(): number {
    return this._radius;
  }

  get distance(): number {
    return this._distance;
  }

  get angle(): number {
    return this._angle;
  }

  get parent(): PlanetModel | undefined {
    return this._parent;
  }

  get children(): PlanetModel[] {
    return [...this._children];
  }

  update() {
    this._angle += this._velocity;
  }

  also(mutate: (planet: PlanetModel) => void): PlanetModel {
    mutate(this);
    return this;
  }

  spawn(nargs: {
    name: string,
    radius: number,
    distance: number,
    velocity: number,
    angle?: number,
  }): PlanetModel {
    const child = new PlanetModel(nargs).also(it => it._parent = this);
    this._children.push(child);
    return child;
  }
}

export class SolarSystemModel {
  private readonly _sun: PlanetModel;

  constructor(nargs: {
    sun: PlanetModel,
  }) {
    this._sun = nargs.sun;
  }

  static assemble(): SolarSystemModel {
    const angles = Numeric.rangeOf({
      start: 0,
      stop: Math.PI * 2,
    });

    const sun = new PlanetModel({
      name: 'sun',
      radius: 25,
      distance: 0,
      velocity: 0,
    }).also(it => {
      it.color = '#FF3300';
    });

    sun.spawn({
      name: 'mercury',
      radius: sun.radius / 4,
      distance: sun.radius * 3,
      velocity: Math.PI / 256,
      angle: angles.sample(),
    }).also(it => {
      it.color = '#22FFFF';
    });

    sun.spawn({
      name: 'venus',
      radius: sun.radius / 3,
      distance: sun.radius * 5,
      velocity: Math.PI / 512,
      angle: angles.sample(),
    }).also(it => {
      it.color = '#FFFF22';
    });

    const earth = sun.spawn({
      name: 'earth',
      radius: sun.radius / 2,
      distance: sun.radius * 8,
      velocity: Math.PI / 768,
      angle: angles.sample(),
    }).also(it => {
      it.color = '#44AAFF';
    });

    earth.spawn({
      name: 'moon',
      radius: earth.radius / 4,
      distance: 25,
      velocity: Math.PI / 64,
      angle: angles.sample(),
    }).also(it => {
      it.color = '#FF8800';
    });

    const mars = sun.spawn({
      name: 'mars',
      radius: sun.radius / 2,
      distance: sun.radius * 12,
      velocity: Math.PI / 768,
      angle: angles.sample(),
    }).also(it => {
      it.color = '#FF6633';
    });

    mars.spawn({
      name: 'phobos',
      radius: mars.radius / 3,
      distance: 25,
      velocity: Math.PI / 128,
      angle: angles.sample(),
    }).also(it => {
      it.color = '#AAAAAA';
    });

    mars.spawn({
      name: 'deimos',
      radius: mars.radius / 2,
      distance: 40,
      velocity: Math.PI / 128,
      angle: angles.sample(),
    }).also(it => {
      it.color = '#FFFFFF';
    });

    return new SolarSystemModel({sun});
  }

  walk(callback: (planet: PlanetModel) => void) {
    const stack = [this._sun];

    while (stack.length > 0) {
      const planet = stack.pop()!;

      callback(planet);

      const children = planet.children.sortedDesc((it) => it.distance);

      stack.push(...children);
    }
  }

  update() {
    this.walk(it => it.update());
  }
}
