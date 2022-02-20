import p5 from 'p5';
import { Widget } from '../../lib/process';
import { ApplicationModel, DropModel } from './model';

export class DropWidget extends Widget {
  public model: DropModel | undefined;

  draw() {
    const model = this.model;
    if (!model) {
      return;
    }

    this.scope($ => {
      $.stroke(model.color);
      $.line(
        model.point.x, model.point.y,
        model.point.x, model.point.y + model.length,
      );
    });
  }
}

export class ApplicationWidget extends Widget {
  public model: ApplicationModel | undefined;

  private readonly _drop: DropWidget;

  constructor(context: p5) {
    super(context);
    this._drop = new DropWidget(context);
  }

  draw() {
    const model = this.model;
    if (!model) {
      return;
    }

    model.drops.forEach(it => {
      this._drop.model = it;
      this._drop.draw();
    })
  }
}
