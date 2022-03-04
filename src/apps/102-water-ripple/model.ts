import { DimenCompat, Matrix, SpotCompat } from '../../lib/dmath';

export class WaterModel {
  private _state: Matrix<number>;
  private _buffer: Matrix<number>;
  private readonly _dumping: number;

  constructor(nargs: {
    dimen: DimenCompat,
    dumping: number,
  }) {
    this._state = Matrix.fill(nargs.dimen, 0);
    this._buffer = Matrix.fill(nargs.dimen, 0);
    this._dumping = nargs.dumping;
  }

  get state(): Matrix<number> {
    return this._state;
  }

  update() {
    for (let x = 1; x < this._buffer.width - 1; x++) {
      for (let y = 1; y < this._buffer.height - 1; y++) {
        const base = Math.sum(
          this._state.get({column: x - 1, row: y}),
          this._state.get({column: x + 1, row: y}),
          this._state.get({column: x, row: y - 1}),
          this._state.get({column: x, row: y + 1}),
        ) * 0.5;
        const newValue = (base - this._buffer.get({column: x, row: y})) * this._dumping;
        this._buffer.set({column: x, row: y}, newValue);
      }
    }

    const temp = this._state;
    this._state = this._buffer;
    this._buffer = temp;
  }

  drop({spot, value}: {
    spot: SpotCompat,
    value: number,
  }) {
    this._state.set(spot, value);
  }
}

export class ApplicationModel {
  private readonly _water: WaterModel;

  constructor(nargs: {
    dimen: DimenCompat,
    dumping: number,
  }) {
    this._water = new WaterModel({
      dimen: nargs.dimen,
      dumping: nargs.dumping,
    });
  }

  get water(): WaterModel {
    return this._water;
  }

  drop({spot, value}: {
    spot: SpotCompat,
    value: number,
  }) {
    this._water.drop({spot, value});
  }

  update() {
    this._water.update();
  }
}
