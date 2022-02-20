import * as p5 from 'p5';
import { Widget } from '../../lib/process';
import { ApplicationModel, CellModel } from './model';

export class CellWidget extends Widget {
  public model: CellModel | undefined;

  draw() {
    const model = this.model;
    if (!model) {
      return;
    }

    this.scope($ => {
      $.fill(model.fillColor);
      $.stroke(model.strokeColor);
      $.ellipse(model.center.x, model.center.y, model.radius * 2);
    });
  }
}

export class ApplicationWidget extends Widget {
  public model: ApplicationModel | undefined;

  private readonly _cell: CellWidget;

  constructor(context: p5) {
    super(context);
    this._cell = new CellWidget(context);
  }

  draw() {
    const model = this.model;
    if (!model) {
      return;
    }

    model.cells.reversed().forEach(it => {
      this._cell.model = it;
      this._cell.draw();
    })
  }
}
