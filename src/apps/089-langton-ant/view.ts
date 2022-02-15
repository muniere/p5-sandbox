import p5, { Vector } from 'p5';
import { Point, Rect, Size } from '../../lib/graphics2d';
import { AntState, CellState, Direction, GridState, WorldState } from './model';

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

export class AntWidget {
  public state: AntState | undefined;
  public frame = Rect.zero();
  public color = '#000000';

  constructor(
    public readonly context: p5,
  ) {
    // no-op
  }

  also(mutate: (widget: AntWidget) => void): AntWidget {
    mutate(this);
    return this;
  }

  draw() {
    const state = this.state;
    if (!state) {
      return;
    }

    const angle = Helper.angle(state.direction);
    const center = this.frame.center;

    const vectors = [
      new Vector().set(0, -this.frame.height / 2),
      new Vector().set(-this.frame.width / 4, this.frame.height / 2),
      new Vector().set(+this.frame.width / 4, this.frame.height / 2),
    ];
    const points = vectors.map(it => {
      return center.plus(it.rotate(angle));
    });

    this.context.push();

    this.context.noStroke();
    this.context.fill(this.color);

    this.context.beginShape();
    points.forEach(it => {
      this.context.vertex(it.x, it.y);
    });
    this.context.endShape(this.context.CLOSE);

    this.context.pop();
  }
}

export class GridWidget {
  public state: GridState | undefined;
  public frame = Rect.zero();
  public fillColor = '#000000';
  public lineColor = '#888888';

  constructor(
    public readonly context: p5,
  ) {
    // no-op
  }

  also(mutate: (widget: GridWidget) => void): GridWidget {
    mutate(this);
    return this;
  }

  draw() {
    const state = this.state;
    if (!state) {
      return;
    }

    const unit = Size.of({
      width: this.frame.width / state.dimen.width,
      height: this.frame.height / state.dimen.height,
    });

    this.context.push();

    // cell
    this.context.noStroke();
    this.context.fill(this.fillColor);

    state.forEach((cell, spot) => {
      if (cell == CellState.white) {
        return;
      }

      const w = unit.width;
      const h = unit.height;
      const x = spot.column * w;
      const y = spot.row * h;
      this.context.rect(x, y, w, h);
    });

    // border
    this.context.noFill();
    this.context.stroke(this.lineColor);
    this.context.strokeWeight(0.5);

    for (let x = 0; x <= this.frame.width; x += unit.width) {
      this.context.line(x, 0, x, this.frame.height);
    }
    for (let y = 0; y <= this.frame.height; y += unit.height) {
      this.context.line(0, y, this.frame.width, y);
    }

    this.context.pop();
  }
}

export class StepWidget {
  public step: number = 0;
  public frame = Rect.zero();
  public color: string = '000000';
  public format = new Intl.NumberFormat();
  public textSize: number = 18;
  public textAlign: any;

  constructor(
    public readonly context: p5
  ) {
    this.textAlign = context.RIGHT;
  }

  also(mutate: (widget: StepWidget) => void): StepWidget {
    mutate(this);
    return this;
  }

  draw() {
    this.context.push();

    this.context.stroke(this.color);
    this.context.textSize(this.textSize);
    this.context.textAlign(this.textAlign);

    this.context.text(
      this.text(),
      this.frame.left, this.frame.top,
      this.frame.right, this.frame.bottom,
    );

    this.context.pop();
  }

  private text(): string {
    return `${this.format.format(this.step)} steps`;
  }
}

export class WorldWidget {
  public state: WorldState | undefined;
  public frame = Rect.zero();

  public readonly grid: GridWidget;
  public readonly ant: AntWidget;
  public readonly step: StepWidget;

  constructor(
    public readonly context: p5,
  ) {
    this.grid = new GridWidget(context);
    this.ant = new AntWidget(context);
    this.step = new StepWidget(context);
  }

  also(mutate: (widget: WorldWidget) => void): WorldWidget {
    mutate(this);
    return this;
  }

  draw() {
    const state = this.state;
    if (!state) {
      return;
    }

    this.grid.state = state.grid;
    this.grid.frame = this.gridFrame();
    this.grid.draw();

    const grid = state.grid;

    state.ants.forEach(ant => {
      this.ant.state = ant;
      this.ant.frame = this.antFrame({ant, grid});
      this.ant.draw();
    })

    this.step.step = state.step;
    this.step.frame = this.stepFrame();
    this.step.draw();
  }

  private gridFrame(): Rect {
    return Rect.of({
      origin: this.frame.origin.copy(),
      size: Size.square(
        Math.min(this.frame.width, this.frame.height)
      )
    })
  }

  private antFrame({ant, grid}: { ant: AntState, grid: GridState }): Rect {
    const cellSize = Size.of({
      width: this.frame.width / grid.dimen.width,
      height: this.frame.height / grid.dimen.height,
    });

    const cellOrigin = Point.of({
      x: cellSize.width * ant.spot.column,
      y: cellSize.width * ant.spot.row,
    });

    const antSize = cellSize.times(0.8);

    const antOrigin = cellOrigin.plus({
      x: (cellSize.width - antSize.width) / 2,
      y: (cellSize.height - antSize.height) / 2,
    });

    return Rect.of({
      origin: antOrigin,
      size: antSize,
    });
  }

  private stepFrame(): Rect {
    return Rect.of({
      origin: Point.of({
        x: 0,
        y: Math.min(this.frame.width, this.frame.height),
      }),
      size: Size.of({
        width: this.frame.width,
        height: 50,
      })
    });
  }
}
