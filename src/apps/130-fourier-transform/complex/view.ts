import * as p5 from 'p5';
import { Widget } from '../../../lib/process';
import { Point } from '../../../lib/graphics2d';
import { ChainWidget, PathWidget } from '../shared/view';
import { ApplicationModel } from './model';

export class ApplicationWidget extends Widget<ApplicationModel> {
  public origin = Point.zero();

  public readonly chain: ChainWidget;
  public readonly path: PathWidget;

  constructor(context: p5) {
    super(context);
    this.chain = new ChainWidget(context);
    this.path = new PathWidget(context);
  }

  protected doDraw(model: ApplicationModel) {
    if (!model.path.length) {
      return;
    }

    this.chain.model = model.chain;
    this.path.model = model.path;

    this.scope($ => {
      $.translate(this.origin.x, this.origin.y);
      this.chain.draw();
      this.path.draw();
    });
  }
}
