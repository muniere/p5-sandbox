import { Context, Widget } from '../../lib/process';
import { TreeModel } from './model';

export class TreeWidget extends Widget {
  public model: TreeModel | undefined;
  public angle: number = Math.PI / 4;

  draw() {
    const model = this.model;
    if (!model) {
      return;
    }
    this._draw(model)
  }

  private _draw(model: TreeModel) {
    Context.scope(this.context, $ => {
      $.line(0, 0, 0, -model.length);
    });

    this.context.translate(0, -model.length);

    const next = model.branch();
    if (!next) {
      return;
    }

    Context.scope(this.context, $ => {
      $.rotate(this.angle);
      this._draw(next);
    });

    Context.scope(this.context, $ => {
      $.rotate(-this.angle);
      this._draw(next);
    });
  }
}
