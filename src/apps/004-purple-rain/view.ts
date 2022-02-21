import p5 from 'p5';
import { Widget } from '../../lib/process';
import { ApplicationModel, DropModel } from './model';

export class DropWidget extends Widget<DropModel> {

  protected doDraw(model: DropModel) {
    this.scope($ => {
      $.stroke(model.color);
      $.line(
        model.point.x, model.point.y,
        model.point.x, model.point.y + model.length,
      );
    });
  }
}

export class ApplicationWidget extends Widget<ApplicationModel> {
  private readonly _drop: DropWidget;

  constructor(context: p5) {
    super(context);
    this._drop = new DropWidget(context);
  }

  protected doDraw(model: ApplicationModel) {
    model.drops.forEach(it => {
      this._drop.model = it;
      this._drop.draw();
    })
  }
}
