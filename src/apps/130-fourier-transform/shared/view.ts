import * as p5 from 'p5';
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

    this.context.push()

    const pointCenter = state.epicycleCenter;

    if (this.trackWeight > 0) {
      this.context.stroke(state.color);
      this.context.strokeWeight(this.trackWeight);
      this.context.noFill();

      this.context.circle(
        state.center.x,
        state.center.y,
        state.radius * 2
      );
    }

    if (this.handWeight > 0) {
      this.context.stroke(state.color);
      this.context.strokeWeight(this.handWeight)
      this.context.noFill();

      this.context.line(
        state.center.x, state.center.y,
        pointCenter.x, pointCenter.y
      );
    }

    if (this.pointRadius) {
      this.context.noStroke();
      this.context.fill(state.color);

      this.context.circle(pointCenter.x, pointCenter.y, this.pointRadius);
    }

    this.context.pop();
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

    this.context.push();

    this.context.noFill();
    this.context.stroke(state.color);

    this.context.beginShape();

    state.plots.forEach((value) => {
      this.context.vertex(value.x, value.y);
    });

    this.context.endShape();
    this.context.pop();
  }
}

