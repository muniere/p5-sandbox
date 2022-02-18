import p5 from 'p5';
import { Context } from '../../lib/process';
import { NumberRange, NumberRangeMap } from '../../lib/stdlib';
import { BallState, BezierCurve, WorldState } from './model';

export enum PathMode {
  discrete,
  continuous,
}

export class BallWidget {
  public state: BallState | undefined;
  public color: string = '#FFFFF';

  constructor(
    public readonly context: p5,
  ) {
    // no-op
  }

  also(mutate: (widget: BallWidget) => void): BallWidget {
    mutate(this);
    return this;
  }

  draw() {
    const state = this.state;
    if (!state) {
      return;
    }

    Context.scope(this.context, $ => {
      $.fill(this.color);
      $.noStroke();

      $.circle(state.center.x, state.center.y, state.radius);
    });
  }
}

export class BezierWidget {
  public state: BezierCurve | undefined;
  public color: string = '#FFFFF';
  public mode: PathMode = PathMode.discrete;

  constructor(
    public readonly context: p5,
  ) {
    // no-op
  }

  also(mutate: (widget: BezierWidget) => void): BezierWidget {
    mutate(this);
    return this;
  }

  draw() {
    const state = this.state;
    if (!state) {
      return;
    }

    // intermediate
    const points = Context.scope(this.context, $ => {
      this.context.colorMode(this.context.HSB, 360, 100, 100, 100);
      this.context.noFill();

      const hueMap = NumberRangeMap.of({
        domain: new NumberRange(state.start.x, state.stop.x),
        target: new NumberRange(0, 360),
      });

      return state.compute({
        onCompute: (p1, p2) => {
          const hue = hueMap.apply((p1.x + p2.x) / 2);
          const color = this.context.color(hue, 100, 100);
          $.stroke(color);
          $.line(p1.x, p1.y, p2.x, p2.y);
        }
      });
    });

    // result
    Context.scope(this.context, $ => {
      $.stroke(this.color);
      $.noFill();

      switch (this.mode) {
        case PathMode.discrete:
          points.forEach(it => {
            $.point(it.x, it.y);
          });
          break;

        case PathMode.continuous:
          Context.shape($, 'open', $$ => {
            points.forEach(it => {
              $$.vertex(it.x, it.y);
            });
          });
          break;
      }
    });
  }
}

export class WorldWidget {
  public state: WorldState | undefined;

  private _ball: BallWidget;
  private _bezier: BezierWidget;

  constructor(
    public readonly context: p5,
  ) {
    this._ball = new BallWidget(this.context);
    this._bezier = new BezierWidget(this.context);
  }

  also(mutate: (widget: WorldWidget) => void): WorldWidget {
    mutate(this);
    return this;
  }

  get mode(): PathMode {
    return this._bezier.mode;
  }

  set mode(value: PathMode) {
    this._bezier.mode = value;
  }

  draw() {
    const state = this.state;
    if (!state) {
      return;
    }

    Context.scope(this.context, $ => {
      this._bezier.also(it => it.state = state.bezier).draw();

      state.balls.forEach(ball => {
        this._ball.also(it => it.state = ball).draw();
      });
    });
  }
}
