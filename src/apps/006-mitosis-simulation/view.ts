import * as p5 from 'p5';
import { Widget } from '../../lib/process';
import { ApplicationModel, CellModel } from './model';

export class CellWidget extends Widget<CellModel> {

  protected doDraw(model: CellModel) {
    this.scope($ => {
      $.fill(model.fillColor);
      $.stroke(model.strokeColor);
      $.ellipse(model.center.x, model.center.y, model.radius * 2);
    });
  }
}

export class ApplicationWidget extends Widget<ApplicationModel> {
  private readonly _cell: CellWidget;

  constructor(context: p5) {
    super(context);
    this._cell = new CellWidget(context);
  }

  protected doDraw(model: ApplicationModel) {
    model.cells.reversed().forEach(it => {
      this._cell.model = it;
      this._cell.draw();
    })
  }
}
