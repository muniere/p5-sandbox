export class TreeModel {
  private readonly _length: number;
  private readonly _scale: number;
  private readonly _limit: number;

  constructor(nargs: {
    length: number,
    scale: number,
    limit: number,
  }) {
    this._length = nargs.length;
    this._scale = nargs.scale;
    this._limit = nargs.limit;
  }

  get length(): number {
    return this._length;
  }

  get scale(): number {
    return this._scale;
  }

  get limit(): number {
    return this._limit;
  }

  branch(): TreeModel | undefined {
    if (this._length < this._limit) {
      return undefined;
    }

    return new TreeModel({
      length: this._length * this._scale,
      scale: this._scale,
      limit: this._limit,
    });
  }
}
