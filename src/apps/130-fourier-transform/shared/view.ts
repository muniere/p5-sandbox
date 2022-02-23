import * as p5 from 'p5';
import { Widget } from '../../../lib/process';
import { ChainModel, CircleModel, PathModel } from './model';

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
  public trackWeight: number = 0;
  public handWeight: number = 0;
  public pointRadius: number = 0;

  private readonly _circle: CircleWidget;

  constructor(context: p5) {
    super(context);
    this._circle = new CircleWidget(context)
  }

  protected doDraw(model: ChainModel) {
    model.circles.forEach((circle) => {
      this._circle.model = circle;
      this._circle.trackWeight = this.trackWeight;
      this._circle.handWeight = this.handWeight;
      this._circle.pointRadius = this.pointRadius;
      this._circle.draw();
    });
  }
}

export class PathWidget extends Widget<PathModel> {

  protected doDraw(model: PathModel) {
    this.scope($ => {
      $.noFill();
      $.stroke(model.color);

      this.shape('open', $$ => {
        model.plots.forEach((value) => {
          $$.vertex(value.x, value.y);
        });
      });
    });
  }
}

