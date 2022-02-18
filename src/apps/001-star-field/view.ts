import * as p5 from 'p5';
import { Context } from '../../lib/process';
import { Numeric } from '../../lib/stdlib';
import { Point as Point3D } from '../../lib/graphics3d';
import { StarFieldState, StarState } from './model';

class StarWidget {
  public state: StarState | undefined;

  constructor(
    public readonly context: p5,
  ) {
    // no-op
  }

  also(mutate: (widget: StarWidget) => void): StarWidget {
    mutate(this);
    return this;
  }

  draw(): void {
    const state = this.state;
    if (!state) {
      return;
    }

    const currentX = Numeric.map({
      value: state.center.x / state.center.z,
      domain: Numeric.range(0, 1),
      target: Numeric.range(0, this.context.width)
    });

    const currentY = Numeric.map({
      value: state.center.y / state.center.z,
      domain: Numeric.range(0, 1),
      target: Numeric.range(0, this.context.height)
    });

    const currentRadius = Numeric.map({
      value: state.center.z,
      domain: Numeric.range(this.context.width, 0),
      target: Numeric.range(0, state.radius)
    });

    const originX = Numeric.map({
      value: state.center.x / state.origin.z,
      domain: Numeric.range(0, 1),
      target: Numeric.range(0, this.context.width),
    });

    const originY = Numeric.map({
      value: state.center.y / state.origin.z,
      domain: Numeric.range(0, 1),
      target: Numeric.range(0, this.context.height)
    });

    Context.scope(this.context, $ => {
      $.fill(255);
      $.noStroke();
      $.ellipse(currentX, currentY, currentRadius, currentRadius);

      $.stroke(255, 64);
      $.line(originX, originY, currentX, currentY);
    })
  }
}

export class StarFieldWidget {
  public state: StarFieldState | undefined;

  private _star: StarWidget;

  constructor(
    public readonly context: p5,
  ) {
    this._star = new StarWidget(context);
  }

  also(mutate: (widget: StarFieldWidget) => void): StarFieldWidget {
    mutate(this);
    return this;
  }

  draw() {
    const state = this.state;
    if (!state) {
      return;
    }

    this.context.translate(
      this.context.width / 2,
      this.context.height / 2,
    );

    state.stars.forEach(it => {
      this._star.state = it;
      this._star.draw();
    });
  }
}
