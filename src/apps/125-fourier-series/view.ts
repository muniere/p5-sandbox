import * as p5 from 'p5';
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

    this.context.push();

    this.context.translate(this.origin.x, this.origin.y);

    state.circles.forEach((circle, i) => {
      const widget = new CircleWidget(this.context).also(it => {
        it.state = circle;
        it.trackWeight = i == 0 ? 1 : 0;
        it.handWeight = 1;
        it.pointRadius = 1;
      });

      widget.draw();
    });

    this.context.pop();
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

    this.context.push();

    this.context.noFill();
    this.context.stroke(state.color);

    this.context.beginShape();

    state.values.forEach((value, i) => {
      const x = this.origin.x + i * this.scaleX;
      const y = this.origin.y + value * this.scaleY;

      this.context.vertex(x, y);
    });

    this.context.endShape();
    this.context.pop();
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
    this.context.push();
    this.context.stroke(this.color);
    this.context.line(this.start.x, this.start.y, this.end.x, this.end.y);
    this.context.pop();
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

    this.context.push();

    this.context.translate(this.origin.x, this.origin.y);

    this.chain.draw();
    this.path.draw()
    this.line.draw();

    this.context.pop();
  }
}
