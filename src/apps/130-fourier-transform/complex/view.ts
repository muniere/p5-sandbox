import * as p5 from 'p5';
import { Context } from '../../../lib/process';
import { Point } from '../../../lib/graphics2d';
import { ChainWidget, PathWidget } from '../shared/view';
import { ApplicationModel } from './model';

export class ComplexWorldWidget {
  public state: ApplicationModel | undefined;
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

    Context.scope(this.context, $ => {
      $.translate(this.origin.x, this.origin.y);
      this.chain.draw();
      this.path.draw();
    });
  }
}
