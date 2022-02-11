import * as p5 from 'p5';
import { Point } from '../../../lib/graphics2d';
import { ChainWidget, PathWidget } from '../shared/view';
import { ComplexWorldState } from './model';

export class ComplexWorldWidget {
  public state: ComplexWorldState | undefined;
  public origin = Point.zero();

  public readonly chain: ChainWidget;
  public readonly path: PathWidget;

  constructor(
    public readonly context: p5,
  ) {
    this.chain = new ChainWidget(context);
    this.path = new PathWidget(context);
  }

  also(mutate: (widget: ComplexWorldWidget) => void): ComplexWorldWidget {
    mutate(this);
    return this;
  }

  draw() {
    const state = this.state;
    if (!state || !state.path.length) {
      return;
    }

    this.chain.state = state.chain;
    this.path.state = state.path;

    this.context.push();

    this.context.translate(this.origin.x, this.origin.y);
    this.chain.draw();
    this.path.draw();

    this.context.pop();
  }
}
