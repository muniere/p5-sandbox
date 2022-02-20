import p5 from 'p5';
import { Widget } from '../../lib/process';
import { Point } from '../../lib/graphics2d';
import { ApplicationModel, PlanetModel, SolarSystemModel } from './model';

export class PlanetWidget extends Widget {
  public model: PlanetModel | undefined;
  public anchor: Point = Point.zero();

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

    this.scope($ => {
      $.fill(model.color);
      $.circle(center.x, center.y, model.radius * 2);
    });
  }
}

export class SolarSystemWidget extends Widget {
  public model: SolarSystemModel | undefined;

  private readonly _planet: PlanetWidget;

  constructor(context: p5) {
    super(context);
    this._planet = new PlanetWidget(context);
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
