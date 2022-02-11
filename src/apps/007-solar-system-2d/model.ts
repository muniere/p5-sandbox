import { Numeric } from '../../lib/stdlib';

export class PlanetState {
  public color: string = '#FFFFFF';
  public angle: number = 0;
  private _children: PlanetState[] = [];

  constructor(
    public readonly name: string,
    public readonly radius: number,
    public readonly distance: number,
    public readonly velocity: number,
    public readonly parent?: PlanetState,
  ) {
    // no-op
  }

  static create({name, radius, distance, velocity}: {
    name: string,
    radius: number,
    distance: number,
    velocity: number,
  }): PlanetState {
    return new PlanetState(name, radius, distance, velocity);
  }

  children(): PlanetState[] {
    return [...this._children];
  }

  forward(duration?: number) {
    this.angle += this.velocity * (duration ?? 1);
  }

  also(mutate: (planet: PlanetState) => void): PlanetState {
    mutate(this);
    return this;
  }

  spawn({name, radius, distance, velocity}: {
    name: string,
    radius: number,
    distance: number,
    velocity: number,
  }): PlanetState {
    const child = new PlanetState(name, radius, distance, velocity, this);
    this._children.push(child);
    return child;
  }
}

export class SolarSystemState {
  constructor(
    public readonly sun: PlanetState,
  ) {
    // no-op
  }

  static assemble(): SolarSystemState {
    const angles = Numeric.rangeOf({
      start: 0,
      stop: Math.PI * 2,
    });

    const sun = PlanetState.create({
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
    }).also(it => {
      it.angle = angles.sample();
      it.color = '#22FFFF';
    });

    sun.spawn({
      name: 'venus',
      radius: sun.radius / 3,
      distance: sun.radius * 5,
      velocity: Math.PI / 512,
    }).also(it => {
      it.angle = angles.sample();
      it.color = '#FFFF22';
    });

    const earth = sun.spawn({
      name: 'earth',
      radius: sun.radius / 2,
      distance: sun.radius * 8,
      velocity: Math.PI / 768,
    }).also(it => {
      it.angle = angles.sample();
      it.color = '#44AAFF';
    });

    earth.spawn({
      name: 'moon',
      radius: earth.radius / 4,
      distance: 25,
      velocity: Math.PI / 64,
    }).also(it => {
      it.angle = angles.sample();
      it.color = '#FF8800';
    });

    const mars = sun.spawn({
      name: 'mars',
      radius: sun.radius / 2,
      distance: sun.radius * 12,
      velocity: Math.PI / 768,
    }).also(it => {
      it.angle = angles.sample();
      it.color = '#FF6633';
    });

    mars.spawn({
      name: 'phobos',
      radius: mars.radius / 3,
      distance: 25,
      velocity: Math.PI / 128,
    }).also(it => {
      it.angle = angles.sample();
      it.color = '#AAAAAA';
    });

    mars.spawn({
      name: 'deimos',
      radius: mars.radius / 2,
      distance: 40,
      velocity: Math.PI / 128,
    }).also(it => {
      it.angle = angles.sample();
    });

    return new SolarSystemState(sun);
  }

  walk(callback: (planet: PlanetState) => void) {
    const stack = [this.sun];

    while (stack.length > 0) {
      const planet = stack.pop()!;

      callback(planet);

      const children = planet.children().sort(
        (a, b) => b.distance - a.distance,
      );
      stack.push(...children);
    }
  }

  forward(duration?: number) {
    this.walk(it => it.forward(duration));
  }
}
