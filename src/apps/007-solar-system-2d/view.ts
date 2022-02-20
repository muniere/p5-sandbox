import p5 from 'p5';
import { Context } from '../../lib/process';
import { Point } from '../../lib/graphics2d';
import { ApplicationModel, PlanetModel, SolarSystemModel } from './model';

export class PlanetWidget {
  public model: PlanetModel | undefined;
  public anchor: Point = Point.zero();

  constructor(
    public readonly context: p5,
  ) {
    // no-op
  }

  center(): Point {
    const model = this.model;
    if (!model) {
      return this.anchor;
    }

    return this.anchor.plus({
      x: model.distance * Math.cos(model.angle),
      y: model.distance * Math.sin(model.angle),
    });
  }

  draw() {
    const model = this.model;
    if (!model) {
      return;
    }

    const center = this.center();

    Context.scope(this.context, $ => {
      $.fill(model.color);
      $.circle(center.x, center.y, model.radius * 2);
    });
  }
}

export class SolarSystemWidget {
  public model: SolarSystemModel | undefined;

  private readonly _planet: PlanetWidget;

  constructor(
    public readonly context: p5,
  ) {
    this._planet = new PlanetWidget(context);
  }

  also(mutate: (widget: SolarSystemWidget) => void): SolarSystemWidget {
    mutate(this);
    return this;
  }

  draw() {
    const model = this.model;
    if (!model) {
      return;
    }

    const anchors = new Map<string, Point>();

    model.walk((planet) => {
      const parent = planet.parent;

      const anchor = parent ? anchors.get(parent.name)! : Point.zero();

      this._planet.model = planet;
      this._planet.anchor = anchor;
      this._planet.draw();

      const center = this._planet.center();

      anchors.set(planet.name, center);
    });
  }
}

export class ApplicationWidget {
  public model: ApplicationModel | undefined;

  private _solarSystem: SolarSystemWidget;

  constructor(
    public readonly context: p5,
  ) {
    this._solarSystem = new SolarSystemWidget(context);
  }

  also(mutate: (widget: ApplicationWidget) => void): ApplicationWidget {
    mutate(this);
    return this;
  }

  draw() {
    const model = this.model;
    if (!model) {
      return;
    }

    this._solarSystem.model = model.solarSystem;
    this._solarSystem.draw();
  }
}
