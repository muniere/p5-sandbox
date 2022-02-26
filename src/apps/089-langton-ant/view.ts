import p5, { Vector } from 'p5';
import { BaseWidget, Widget } from '../../lib/process';
import { Point, Rect, Size } from '../../lib/graphics2d';
import { AntModel, ApplicationModel, CellModel, Direction, GridModel } from './model';

module Helper {

  export function angle(direction: Direction): number {
    switch (direction) {
      case Direction.north:
        return 0;
      case Direction.south:
        return Math.PI;
      case Direction.east:
        return Math.PI / 2;
      case Direction.west:
        return -Math.PI / 2;
    }
  }
}

export class AntWidget extends Widget<AntModel> {
  public frame = Rect.zero();
  public color = '#000000';

  protected doDraw(model: AntModel) {
    super.doDraw(model);

    const angle = Helper.angle(model.direction);
    const center = this.frame.center;

    const vectors = [
      new Vector().set(0, -this.frame.height / 2),
      new Vector().set(-this.frame.width / 4, this.frame.height / 2),
      new Vector().set(+this.frame.width / 4, this.frame.height / 2),
    ];
    const points = vectors.map(it => {
      return center.plus(it.rotate(angle));
    });

    this.scope($ => {
      $.noStroke();
      $.fill(this.color);

      this.shape('closed', $$ => {
        points.forEach(it => {
          $$.vertex(it.x, it.y);
        });
      });
    });
  }
}

export class GridWidget extends Widget<GridModel> {
  public frame = Rect.zero();
  public fillColor = '#000000';
  public lineColor = '#888888';

  protected doDraw(model: GridModel) {
    const unit = new Size({
      width: this.frame.width / model.dimen.width,
      height: this.frame.height / model.dimen.height,
    });

    // cell
    this.scope($ => {
      $.noStroke();
      $.fill(this.fillColor);

      model.forEach((cell, spot) => {
        if (cell == CellModel.white) {
          return;
        }

        const w = unit.width;
        const h = unit.height;
        const x = spot.column * w;
        const y = spot.row * h;
        $.rect(x, y, w, h);
      });
    });

    // border
    this.scope($ => {
      $.noFill();
      $.stroke(this.lineColor);
      $.strokeWeight(0.5);

      for (let x = 0; x <= this.frame.width; x += unit.width) {
        $.line(x, 0, x, this.frame.height);
      }
      for (let y = 0; y <= this.frame.height; y += unit.height) {
        $.line(0, y, this.frame.width, y);
      }
    });
  }
}

export class StepWidget extends BaseWidget {
  public step: number = 0;
  public frame = Rect.zero();
  public color: string = '000000';
  public format = new Intl.NumberFormat();
  public textSize: number = 14;
  public textAlign: any;

  constructor(context: p5) {
    super(context);
    this.textAlign = context.RIGHT;
  }

  draw() {
    this.scope($ => {
      $.stroke(this.color);
      $.textSize(this.textSize);
      $.textAlign(this.textAlign);

      $.text(
        `${this.format.format(this.step)} steps`,
        this.frame.left, this.frame.top,
        this.frame.right, this.frame.bottom,
      );
    });
  }
}

export class ApplicationWidget extends Widget<ApplicationModel> {
  public frame = Rect.zero();

  public readonly grid: GridWidget;
  public readonly ant: AntWidget;
  public readonly step: StepWidget;

  constructor(context: p5) {
    super(context);
    this.grid = new GridWidget(context);
    this.ant = new AntWidget(context);
    this.step = new StepWidget(context);
  }

  protected doDraw(model: ApplicationModel) {
    this.grid.model = model.grid;
    this.grid.frame = this.gridFrame();
    this.grid.draw();

    const grid = model.grid;

    model.ants.forEach(ant => {
      this.ant.model = ant;
      this.ant.frame = this.antFrame({ant, grid});
      this.ant.draw();
    })

    this.step.step = model.step;
    this.step.frame = this.stepFrame();
    this.step.draw();
  }

  private gridFrame(): Rect {
    return new Rect({
      origin: this.frame.origin.copy(),
      size: Size.square(
        Math.min(this.frame.width, this.frame.height)
      )
    })
  }

  private antFrame({ant, grid}: { ant: AntModel, grid: GridModel }): Rect {
    const cellSize = new Size({
      width: this.frame.width / grid.dimen.width,
      height: this.frame.height / grid.dimen.height,
    });

    const cellOrigin = new Point({
      x: cellSize.width * ant.spot.column,
      y: cellSize.width * ant.spot.row,
    });

    const antSize = cellSize.times(0.8);

    const antOrigin = cellOrigin.plus({
      x: (cellSize.width - antSize.width) / 2,
      y: (cellSize.height - antSize.height) / 2,
    });

    return new Rect({
      origin: antOrigin,
      size: antSize,
    });
  }

  private stepFrame(): Rect {
    return new Rect({
      origin: new Point({
        x: 0,
        y: Math.min(this.frame.width, this.frame.height),
      }),
      size: new Size({
        width: this.frame.width,
        height: 50,
      })
    });
  }
}
