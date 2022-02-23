import * as p5 from 'p5';
import { BaseWidget, Widget } from '../../lib/process';
import { Point } from '../../lib/graphics2d';
import { ApplicationModel, ChainModel, CircleModel, PathModel } from './model';

export class CircleWidget extends Widget<CircleModel> {
  public trackWeight: number = 0;
  public handWeight: number = 0;
  public pointRadius: number = 0;

  protected doDraw(model: CircleModel) {
    const pointCenter = model.epicycleCenter;

    this.scope($ => {
      if (this.trackWeight > 0) {
        $.stroke(model.color);
        $.strokeWeight(this.trackWeight);
        $.noFill();

        $.circle(
          model.center.x,
          model.center.y,
          model.radius * 2
        );
      }

      if (this.handWeight > 0) {
        $.stroke(model.color);
        $.strokeWeight(this.handWeight)
        $.noFill();

        $.line(
          model.center.x, model.center.y,
          pointCenter.x, pointCenter.y
        );
      }

      if (this.pointRadius) {
        $.noStroke();
        $.fill(model.color);

        $.circle(pointCenter.x, pointCenter.y, this.pointRadius);
      }
    });
  }
}

export class ChainWidget extends Widget<ChainModel> {
  public origin = Point.zero();
  public trackWeight: number = 0;
  public handWeight: number = 0;
  public pointRadius: number = 0;

  private _circle: CircleWidget;

  constructor(context: p5) {
    super(context);
    this._circle = new CircleWidget(context);
  }

  get epicycleCenter(): Point | undefined {
    return this.model?.last()?.epicycleCenter;
  }

  protected doDraw(model: ChainModel) {
    this.scope($ => {
      $.translate(this.origin.x, this.origin.y);

      model.circles.forEach((circle, i) => {
        this._circle.model = circle;
        this._circle.trackWeight = i == 0 ? 1 : 0;
        this._circle.handWeight = 1;
        this._circle.pointRadius = 1;
        this._circle.draw();
      });
    });
  }
}

export class PathWidget extends Widget<PathModel> {
  public origin = Point.zero();
  public scaleX: number = 1;
  public scaleY: number = 1;

  first(): Point | undefined {
    if (!this.model) {
      return undefined;
    }

    return this.origin.with({
      y: this.model.first() * this.scaleY,
    });
  }

  last(): Point | undefined {
    if (!this.model) {
      return undefined;
    }

    return this.origin.with({
      y: this.model.last() * this.scaleY,
    });
  }

  protected doDraw(model: PathModel) {
    this.scope($ => {
      $.noFill();
      $.stroke(model.color);

      this.shape('open', $$ => {
        model.values.forEach((value, i) => {
          const x = this.origin.x + i * this.scaleX;
          const y = this.origin.y + value * this.scaleY;

          $$.vertex(x, y);
        });
      });
    });
  }
}

export class LineWidget extends BaseWidget {
  public color: string = '#FFFFFF';
  public start = Point.zero();
  public end = Point.zero();

  draw() {
    this.scope($ => {
      $.stroke(this.color);
      $.line(this.start.x, this.start.y, this.end.x, this.end.y);
    });
  }
}

export class ApplicationWidget extends Widget<ApplicationModel> {
  public origin = Point.zero();

  public readonly chain: ChainWidget;
  public readonly path: PathWidget;
  public readonly line: LineWidget;

  constructor(context: p5) {
    super(context);
    this.chain = new ChainWidget(context);
    this.path = new PathWidget(context);
    this.line = new LineWidget(context);
  }

  protected doDraw(model: ApplicationModel) {
    this.chain.model = model.chain;
    this.path.model = model.path;

    const start = this.chain.epicycleCenter;
    if (start) {
      this.line.start = start;
    }

    const end = this.path.last();
    if (end) {
      this.line.end = end.with({y: start?.y});
    }

    this.scope($ => {
      $.translate(this.origin.x, this.origin.y);

      this.chain.draw();
      this.path.draw()
      this.line.draw();
    });
  }
}
