import p5, { Image } from 'p5';
import { Widget } from '../../lib/process';
import { Rect } from '../../lib/graphics2d';
import { ApplicationModel, CircleCrowdModel, CircleModel } from './model';

export class CircleWidget extends Widget<CircleModel> {

  protected doDraw(model: CircleModel) {
    this.scope($ => {
      $.strokeWeight(model.strokeWeight);

      if (model.strokeColor) {
        $.stroke(model.strokeColor);
      } else {
        $.noStroke();
      }

      if (model.fillColor) {
        $.fill(model.fillColor);
      } else {
        $.noFill();
      }

      $.circle(model.center.x, model.center.y, model.radius * 2);
    });
  }
}

export class CircleCrowdWidget extends Widget<CircleCrowdModel> {
  private _circle: CircleWidget;

  constructor(context: p5) {
    super(context);
    this._circle = new CircleWidget(context);
  }

  protected doDraw(model: CircleCrowdModel) {
    model.circles.forEach(it => {
      this._circle.model = it;
      this._circle.draw();
    });
  }
}

export class ImageWidget extends Widget<Image> {
  public frame: Rect = Rect.zero();
  public alpha: number = 1.0

  protected doDraw(image: Image) {
    this.scope($ => {
      $.tint(255, 255 * this.alpha);
      $.image(image, this.frame.left, this.frame.top, this.frame.width, this.frame.height);
      $.noTint();
    });
  }
}

export class ApplicationWidget extends Widget<ApplicationModel> {
  private readonly _circleCrowd: CircleCrowdWidget;

  constructor(context: p5) {
    super(context);
    this._circleCrowd = new CircleCrowdWidget(context);
  }

  protected doDraw(model: ApplicationModel) {
    this._circleCrowd.model = model.circleCrowd;
    this._circleCrowd.draw();
  }
}
