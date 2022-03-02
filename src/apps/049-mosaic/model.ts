import p5, { Image } from 'p5';
import '../../lib/stdlib';
import { Matrix, SpotCompat } from '../../lib/dmath';

export type Value = number;

export interface EvaluateFunction {
  min: number;
  max: number;

  apply(image: Image): number;

  perform(pixel: number[]): number;
}

export class AlphaFunction implements EvaluateFunction {
  private readonly _context: p5;

  constructor(context: p5) {
    this._context = context;
  }

  get min(): number {
    return 0;
  }

  get max(): number {
    return 255;
  }

  apply(image: Image): number {
    let sum = 0;

    for (let y = 0; y < image.height; y++) {
      for (let x = 0; x < image.width; x++) {
        sum += this.perform(image.get(x, y));
      }
    }

    return sum / (image.width * image.height)
  }

  perform(pixel: number[]): number {
    return this._context.alpha(pixel)
  }
}

export class BrightnessFunction implements EvaluateFunction {
  private readonly _context: p5;

  constructor(context: p5) {
    this._context = context;
  }

  get min(): number {
    return 0;
  }

  get max(): number {
    return 255;
  }

  apply(image: Image): number {
    let sum = 0;

    for (let y = 0; y < image.height; y++) {
      for (let x = 0; x < image.width; x++) {
        sum += this.perform(image.get(x, y));
      }
    }

    return sum / (image.width * image.height)
  }

  perform(pixel: number[]): number {
    return this._context.brightness(pixel);
  }
}

export class AverageFunction implements EvaluateFunction {
  private readonly _context: p5;

  constructor(context: p5) {
    this._context = context;
  }

  get min(): number {
    return 0;
  }

  get max(): number {
    return 255;
  }

  apply(image: Image): number {
    let sum = 0;

    for (let y = 0; y < image.height; y++) {
      for (let x = 0; x < image.width; x++) {
        sum += this.perform(image.get(x, y));
      }
    }

    return sum / (image.width * image.height)
  }

  perform(pixel: number[]): number {
    return (pixel[0] + pixel[1] + pixel[2]) / 3;
  }
}

export class PatchImageModel {
  private readonly _image: Image;
  private readonly _value: Value;

  constructor(nargs: {
    image: Image,
    value: number,
  }) {
    this._image = nargs.image;
    this._value = nargs.value;
  }

  get image(): Image {
    return this._image;
  }

  get value(): Value {
    return this._value;
  }
}

export class MosaicImageModel {
  private readonly _patches: Matrix<PatchImageModel>;

  constructor(patches: Matrix<PatchImageModel>) {
    this._patches = patches;
  }

  get width(): number {
    return this._patches.width;
  }

  get height(): number {
    return this._patches.height;
  }

  get(spot: SpotCompat): PatchImageModel {
    return this._patches.get(spot);
  }
}

export class MosaicProcessModel {
  private readonly _context: p5;
  private readonly _evaluate: EvaluateFunction;
  private readonly _patches: PatchImageModel[];

  private _table: Map<Value, PatchImageModel> | undefined;

  constructor(nargs: {
    context: p5,
    evaluate: EvaluateFunction,
  }) {
    this._context = nargs.context;
    this._evaluate = nargs.evaluate;
    this._patches = [];
  }

  get patches(): PatchImageModel[] {
    return [...this._patches];
  }

  append(image: Image) {
    const model = new PatchImageModel({
      image: image,
      value: this._evaluate.apply(image),
    });

    this._patches.push(model);
    this._table = undefined;
  }

  convert({image, scale}: {
    image: Image,
    scale: number,
  }): MosaicImageModel {
    if (!this._table) {
      this._table = this.index();
    }

    const table = this._table!;

    const scaled = this._context.createImage(
      Math.floor(image.width / scale),
      Math.floor(image.height / scale),
    );

    scaled.copy(
      image,
      0, 0, image.width, image.height,
      0, 0, scaled.width, scaled.height,
    );

    const patches = Matrix.generate(scaled, (spot) => {
      const pixel = scaled.get(spot.column, spot.row);
      const value = Math.floor(this._evaluate.perform(pixel));
      return table.get(value)!;
    });

    return new MosaicImageModel(patches);
  }

  private index(): Map<Value, PatchImageModel> {
    const table = new Map<number, PatchImageModel>();

    for (let value = this._evaluate.min; value <= this._evaluate.max; value++) {
      const patch = this._patches.minBy(it => Math.abs(it.value - value));
      table.set(value, patch);
    }

    return table;
  }
}
