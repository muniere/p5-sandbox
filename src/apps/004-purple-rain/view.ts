import p5 from 'p5';
import { Context } from '../../lib/process';
import { ApplicationModel, DropModel } from './model';

export class DropWidget {
  public model: DropModel | undefined;

  constructor(
    public readonly context: p5,
  ) {
    // no-op
  }

  draw() {
    const model = this.model;
    if (!model) {
      return;
    }

    Context.scope(this.context, $ => {
      $.stroke(model.color);
      $.line(
        model.point.x, model.point.y,
        model.point.x, model.point.y + model.length,
      );
    });
  }
}

export class ApplicationWidget {
  public model: ApplicationModel | undefined;

  private readonly _drop: DropWidget;

  constructor(
    public readonly context: p5,
  ) {
    this._drop = new DropWidget(context);
  }

  also(mutate: (widget: ApplicationWidget) => void): ApplicationWidget {
    mutate(this);
    return this;
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
