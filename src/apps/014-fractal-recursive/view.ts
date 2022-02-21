import p5 from 'p5';
import { Widget } from '../../lib/process';
import { ApplicationModel, TreeModel } from './model';

export class TreeWidget extends Widget<TreeModel> {
  public angle: number = Math.PI / 4;

  protected doDraw(model: TreeModel) {
    this._doDraw(model)
  }

  private _doDraw(model: TreeModel) {
    this.scope($ => {
      $.line(0, 0, 0, -model.length);
    });

    this.context.translate(0, -model.length);

    const next = model.branch();
    if (!next) {
      return;
    }

    this.scope($ => {
      $.rotate(this.angle);
      this._doDraw(next);
    });

    this.scope($ => {
      $.rotate(-this.angle);
      this._doDraw(next);
    });
  }
}

export class ApplicationWidget extends Widget<ApplicationModel> {
  private readonly _tree: TreeWidget;

  constructor(context: p5) {
    super(context);
    this._tree = new TreeWidget(context);
  }

  set angle(value: number) {
    this._tree.angle = value;
  }

  protected doDraw(model: ApplicationModel) {
    this._tree.model = model.tree;
    this._tree.draw();
  }
}
