import * as p5 from 'p5';
import { Context } from '../../lib/process';
import { Point } from '../../lib/graphics2d';
import { ChainState, CircleState, PathState, WorldState } from './model';

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

  also(mutate: (circle: CircleWidget) => void): CircleWidget {
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
  public origin = Point.zero();
  public trackWeight: number = 0;
  public handWeight: number = 0;
  public pointRadius: number = 0;

  public constructor(
    public readonly context: p5,
  ) {
    // no-op
  }

  also(mutate: (circle: ChainWidget) => void): ChainWidget {
    mutate(this);
    return this;
  }

  get epicycleCenter(): Point | undefined {
    return this.state?.last()?.epicycleCenter;
  }

  draw() {
    const state = this.state;
    if (!state) {
      return;
    }

    Context.scope(this.context, $ => {
      $.translate(this.origin.x, this.origin.y);

      state.circles.forEach((circle, i) => {
        const widget = new CircleWidget($).also(it => {
          it.state = circle;
          it.trackWeight = i == 0 ? 1 : 0;
          it.handWeight = 1;
          it.pointRadius = 1;
        });

        widget.draw();
      });
    });
  }
}

export class PathWidget {
  public state: PathState | undefined;
  public origin = Point.zero();
  public scaleX: number = 1;
  public scaleY: number = 1;

  constructor(
    public readonly context: p5,
  ) {
    // no-op
  }

  also(mutate: (wave: PathWidget) => void): PathWidget {
    mutate(this);
    return this;
  }

  first(): Point | undefined {
    if (!this.state) {
      return undefined;
    }

    return this.origin.with({
      y: this.state.first() * this.scaleY,
    });
  }

  last(): Point | undefined {
    if (!this.state) {
      return undefined;
    }

    return this.origin.with({
      y: this.state.last() * this.scaleY,
    });
  }

  draw() {
    const state = this.state;
    if (!state) {
      return;
    }

    Context.scope(this.context, $ => {
      $.noFill();
      $.stroke(state.color);

      $.beginShape();

      state.values.forEach((value, i) => {
        const x = this.origin.x + i * this.scaleX;
        const y = this.origin.y + value * this.scaleY;

        $.vertex(x, y);
      });

      $.endShape();
    });
  }
}

export class LineWidget {
  public color: string = '#FFFFFF';
  public start = Point.zero();
  public end = Point.zero();

  constructor(
    public context: p5,
  ) {
    // no-op
  }

  also(mutate: (line: LineWidget) => void): LineWidget {
    mutate(this);
    return this;
  }

  draw() {
    Context.scope(this.context, $ => {
      $.stroke(this.color);
      $.line(this.start.x, this.start.y, this.end.x, this.end.y);
    });
  }
}

export class WorldWidget {
  public state: WorldState | undefined;
  public origin = Point.zero();

  public readonly chain: ChainWidget;
  public readonly path: PathWidget;
  public readonly line: LineWidget;

  constructor(
    public readonly context: p5,
  ) {
    this.chain = new ChainWidget(context);
    this.path = new PathWidget(context);
    this.line = new LineWidget(context);
  }

  also(mutate: (line: WorldWidget) => void): WorldWidget {
    mutate(this);
    return this;
  }

  draw() {
    const state = this.state;
    if (!state) {
      return;
    }

    this.chain.state = state.chain;
    this.path.state = state.path;

    const start = this.chain.epicycleCenter;
    if (start) {
      this.line.start = start;
    }

    const end = this.path.last();
    if (end) {
      this.line.end = end.with({y: start?.y});
    }

    Context.scope(this.context, $ => {
      $.translate(this.origin.x, this.origin.y);

      this.chain.draw();
      this.path.draw()
      this.line.draw();
    });
  }
}
