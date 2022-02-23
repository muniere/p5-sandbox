import p5 from 'p5';
import { Point } from '../../lib/graphics2d';
import { Widget } from '../../lib/process';
import { ApplicationModel, ImageProcessModel } from './model';

export class ImageWidget extends Widget<ImageProcessModel> {
  public origin = Point.zero();

  protected doDraw(model: ImageProcessModel) {
    this.context.image(model.image, this.origin.x, this.origin.y);
  }
}

export class ApplicationWidget extends Widget<ApplicationModel> {
  private _source: ImageWidget;
  private _result: ImageWidget;

  constructor(context: p5) {
    super(context);
    this._source = new ImageWidget(context);
    this._result = new ImageWidget(context);
  }

  set model(model: ApplicationModel) {
    super.model = model;
    this._source.origin = Point.zero();
    this._result.origin = Point.of({
      x: model.result.image.width,
      y: 0,
    });
  }

  protected doDraw(model: ApplicationModel) {
    this._source.model = model.source;
    this._source.draw();

    this._result.model = model.result;
    this._result.draw();
  }
}
