import * as p5 from 'p5';
import { Context } from '../../lib/process';
import { Point } from '../../lib/graphics2d';
import { ApplicationModel, CellModel } from './model';

export class CellWidget {
  public model: CellModel | undefined;

  constructor(
    public readonly context: p5,
  ) {
    // no-op
  }

  also(mutate: (widget: CellWidget) => void): CellWidget {
    mutate(this);
    return this;
  }

  draw() {
    const model = this.model;
    if (!model) {
      return;
    }
    Context.scope(this.context, $ => {
      $.fill(model.fillColor);
      $.stroke(model.strokeColor);
      $.ellipse(model.center.x, model.center.y, model.radius * 2);
    });
  }
}

export class ApplicationWidget {
  public model: ApplicationModel | undefined;

  private readonly _cell: CellWidget;

  constructor(
    public readonly context: p5,
  ) {
    this._cell = new CellWidget(context);
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

    model.cells.reversed().forEach(it => {
      this._cell.model = it;
      this._cell.draw();
    })
  }
}
