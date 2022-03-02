import { Line, Point, PointRange, Rect } from '../../lib/graphics2d';
import { CircularMaterial } from '../../lib/physics2d';

export class VehicleModel extends CircularMaterial {
  // no-op
}

export class PathModel {
  private readonly _points: Point[];
  private readonly _auxiliaries: Line[];

  constructor(nargs: {
    points: Point[],
    lines: Line[],
  }) {
    this._points = nargs.points;
    this._auxiliaries = nargs.lines;
  }

  get points(): Point[] {
    return [...this._points];
  }

  get auxiliaries(): Line[] {
    return [...this._auxiliaries];
  }
}

export class CalculationModel {
  public start: Point;
  public stop: Point;
  public controls: Point[];
  public resolution: number;

  constructor(nargs: {
    start: Point,
    stop: Point,
    controls: Point[],
    resolution: number,
  }) {
    if (nargs.resolution < 0) {
      throw new Error();
    }
    this.start = nargs.start;
    this.stop = nargs.stop;
    this.controls = nargs.controls;
    this.resolution = nargs.resolution;
  }

  run(): PathModel {
    const points = [this.start, ...this.controls, this.stop];
    const step = 1.0 / (this.resolution + 1);

    const result = [this.start.copy()];
    const lines = [] as Line[];

    for (let amount = step; amount < 1.0; amount += step) {
      const point = CalculationModel.reduce({
        points: points,
        amount: amount,
        onCompute: (it) => lines.push(it)
      });

      result.push(point);
    }

    result.push(this.stop.copy());

    return new PathModel({
      points: result,
      lines: lines,
    });
  }

  private static reduce({points, amount, onCompute}: {
    points: Point[],
    amount: number,
    onCompute?: (line: Line) => void,
  }): Point {
    let result = [...points];

    while (result.length >= 2) {
      const buffer = [] as Point[];

      for (let i = 0; i < result.length - 1; i++) {
        const start = result[i];
        const stop = result[i + 1];
        const lerp = new PointRange({start, stop}).lerp(amount);

        buffer.push(lerp);

        if (onCompute) {
          onCompute(new Line({start, stop}));
        }
      }

      result = buffer;
    }

    return result[0];
  }
}

export class ApplicationModel {
  private readonly _frame: Rect;
  private readonly _vehicles: VehicleModel[];
  private readonly _calculator: CalculationModel;
  private _bezier: PathModel | undefined;

  constructor(nargs: {
    frame: Rect,
    vehicles: VehicleModel[],
    calculator: CalculationModel,
  }) {
    this._frame = nargs.frame;
    this._vehicles = nargs.vehicles;
    this._calculator = nargs.calculator;
  }

  public get bounds(): Rect {
    return this._frame.with({
      origin: Point.zero(),
    });
  }

  public get vehicles(): VehicleModel[] {
    return [...this._vehicles];
  }

  public get bezier(): PathModel | undefined {
    return this._bezier;
  }

  update() {
    this._vehicles.forEach(it => {
      it.update();
      it.bounceIn(this.bounds);
    });

    this._calculator.controls = this._vehicles.map(it => it.center);
    this._bezier = this._calculator.run();
  }
}
