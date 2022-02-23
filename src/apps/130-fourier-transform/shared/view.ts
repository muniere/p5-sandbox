import * as p5 from 'p5';
import { Context } from '../../../lib/process';
import { ChainState, CircleState, PathState } from './model';

export class CircleWidget {
  public state: CircleState | undefined;

  public trackWeight: number = 0;
  public handWeight: number = 0;
  public pointRadius: number = 0;

  constructor(
    public readonly context: p5,
  ) {
    // no-op
  }

  also(mutate: (widget: CircleWidget) => void): CircleWidget {
    mutate(this);
    return this;
  }

  draw() {
    const state = this.state;
    if (!state) {
      return;
    }

    const pointCenter = state.epicycleCenter;

    Context.scope(this.context, $ => {
      if (this.trackWeight > 0) {
        $.stroke(state.color);
        $.strokeWeight(this.trackWeight);
        $.noFill();

        $.circle(
          state.center.x,
          state.center.y,
          state.radius * 2
        );
      }

      if (this.handWeight > 0) {
        $.stroke(state.color);
        $.strokeWeight(this.handWeight)
        $.noFill();

        $.line(
          state.center.x, state.center.y,
          pointCenter.x, pointCenter.y
        );
      }

      if (this.pointRadius) {
        $.noStroke();
        $.fill(state.color);

        $.circle(pointCenter.x, pointCenter.y, this.pointRadius);
      }
    });
  }
}

export class ChainWidget {
  public state: ChainState | undefined;

  public trackWeight: number = 0;
  public handWeight: number = 0;
  public pointRadius: number = 0;

  constructor(
    public readonly context: p5,
  ) {
    // no-op
  }

  also(mutate: (widget: ChainWidget) => void): ChainWidget {
    mutate(this);
    return this;
  }

  draw() {
    const state = this.state;
    if (!state) {
      return;
    }

    state.circles.forEach((circle) => {
      const widget = new CircleWidget(this.context).also(it => {
        it.state = circle;
        it.trackWeight = this.trackWeight;
        it.handWeight = this.handWeight;
        it.pointRadius = this.pointRadius;
      });

      widget.draw();
    });
  }
}

export class PathWidget {
  public state: PathState | undefined;

  constructor(
    public readonly context: p5,
  ) {
    // no-op
  }

  also(mutate: (widget: PathWidget) => void): PathWidget {
    mutate(this);
    return this;
  }

  draw() {
    const state = this.state;
    if (!state) {
      return;
    }

    Context.scope(this.context, $ => {
      this.context.noFill();
      this.context.stroke(state.color);

      Context.shape($, 'open', $$ => {
        state.plots.forEach((value) => {
          $$.vertex(value.x, value.y);
        });
      });
    });
  }
}

