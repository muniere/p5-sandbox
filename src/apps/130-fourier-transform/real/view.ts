import * as p5 from 'p5';
import { Point } from '../../../lib/graphics2d';
import { ChainWidget, PathWidget } from '../shared/view';
import { RealWorldState } from './model';

export class LineWidget {
  public color: string = '#FFFFFF';
  public weight: number = 1
  public start = Point.zero();
  public end = Point.zero();

  constructor(
    public readonly context: p5,
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
    this.context.strokeWeight(this.weight);
    this.context.line(
      this.start.x, this.start.y,
      this.end.x, this.end.y,
    );
    this.context.pop();
  }
}

export class RealWorldWidget {
  public state: RealWorldState | undefined;
  public origin = Point.zero();

  public readonly xChain: ChainWidget;
  public readonly yChain: ChainWidget;
  public readonly xLine: LineWidget;
  public readonly yLine: LineWidget;
  public readonly path: PathWidget;

  constructor(
    public readonly context: p5,
  ) {
    this.xChain = new ChainWidget(context);
    this.yChain = new ChainWidget(context);
    this.xLine = new LineWidget(context);
    this.yLine = new LineWidget(context);
    this.path = new PathWidget(context);
  }

  also(mutate: (widget: RealWorldWidget) => void): RealWorldWidget {
    mutate(this);
    return this;
  }

  draw() {
    const state = this.state;
    if (!state || !state.path.length) {
      return;
    }

    this.xChain.state = state.xChain;
    this.yChain.state = state.yChain;
    this.path.state = state.path;
    this.xLine.start = state.xChain.last.epicycleCenter;
    this.xLine.end = state.path.last;
    this.yLine.start = state.yChain.last.epicycleCenter;
    this.yLine.end = state.path.last;

    this.context.push();

    this.context.translate(this.origin.x, this.origin.y);
    this.xChain.draw();
    this.yChain.draw();
    this.xLine.draw();
    this.yLine.draw();
    this.path.draw();

    this.context.pop();
  }
}
