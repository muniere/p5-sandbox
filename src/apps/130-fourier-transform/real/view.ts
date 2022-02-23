import * as p5 from 'p5';
import { BaseWidget, Widget } from '../../../lib/process';
import { Point } from '../../../lib/graphics2d';
import { ChainWidget, PathWidget } from '../shared/view';
import { ApplicationModel } from './model';

export class LineWidget extends BaseWidget {
  public color: string = '#FFFFFF';
  public weight: number = 1
  public start = Point.zero();
  public end = Point.zero();

  draw() {
    this.scope($ => {
      $.stroke(this.color);
      $.strokeWeight(this.weight);
      $.line(
        this.start.x, this.start.y,
        this.end.x, this.end.y,
      );
    });
  }
}

export class ApplicationWidget extends Widget<ApplicationModel> {
  public origin = Point.zero();

  public readonly xChain: ChainWidget;
  public readonly yChain: ChainWidget;
  public readonly xLine: LineWidget;
  public readonly yLine: LineWidget;
  public readonly path: PathWidget;

  constructor(context: p5) {
    super(context);
    this.xChain = new ChainWidget(context);
    this.yChain = new ChainWidget(context);
    this.xLine = new LineWidget(context);
    this.yLine = new LineWidget(context);
    this.path = new PathWidget(context);
  }

  protected doDraw(model: ApplicationModel) {
    if (!model.path.length) {
      return;
    }

    this.xChain.model = model.xChain;
    this.yChain.model = model.yChain;
    this.path.model = model.path;
    this.xLine.start = model.xChain.last().epicycleCenter;
    this.xLine.end = model.path.last();
    this.yLine.start = model.yChain.last().epicycleCenter;
    this.yLine.end = model.path.last();

    this.scope($ => {
      $.translate(this.origin.x, this.origin.y);
      this.xChain.draw();
      this.yChain.draw();
      this.xLine.draw();
      this.yLine.draw();
      this.path.draw();
    });
  }
}
