import * as p5 from 'p5';
import { Context } from '../../lib/process';
import { Point } from '../../lib/graphics2d';
import { PlanetModel, SolarSystemModel } from './model';

export class PlanetWidget {
  public readonly center: Point;

  constructor(
    public readonly context: p5,
    public readonly anchor: Point,
    public readonly state: PlanetModel,
  ) {
    this.center = this.anchor.plus({
      x: state.distance * Math.cos(state.angle),
      y: state.distance * Math.sin(state.angle),
    });
  }

  static create({context, anchor, state}: {
    context: p5,
    anchor: Point,
    state: PlanetModel,
  }): PlanetWidget {
    return new PlanetWidget(context, anchor, state);
  }

  draw() {
    Context.scope(this.context, $ => {
      $.fill(this.state.color);
      $.circle(this.center.x, this.center.y, this.state.radius * 2);
    });
  }
}

export class SolarSystemWidget {
  constructor(
    public readonly context: p5,
    public state: SolarSystemModel,
  ) {
    // no-op
  }

  draw() {
    const anchors = new Map<string, Point>();

    this.state.walk((planet) => {
      const parent = planet.parent;

      const anchor = parent ? anchors.get(parent.name)! : Point.zero();

      const widget = PlanetWidget.create({
        context: this.context,
        anchor: anchor,
        state: planet,
      });

      widget.draw();

      anchors.set(planet.name, widget.center);
    });
  }
}

export class ApplicationWidget {

}
