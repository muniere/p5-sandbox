import { Image } from 'p5';
import { Pixel } from '../../lib/drawing';

export class RelayModel {
  public readonly x: number;
  public readonly y: number;
  public readonly rate: number;

  constructor(nargs: {
    x: number,
    y: number,
    rate: number,
  }) {
    this.x = nargs.x;
    this.y = nargs.y;
    this.rate = nargs.rate;
  }
}

// noinspection PointlessArithmeticExpressionJS
export class ImageProcessModel {
  private readonly _image: Image;
  private readonly _scale: number;

  private _cursor: number = 0;
  private _speed: number = -1;

  constructor(nargs: {
    image: Image,
    scale: number,
  }) {
    this._image = nargs.image;
    this._scale = nargs.scale;
  }

  also(mutate: (machine: ImageProcessModel) => void): ImageProcessModel {
    mutate(this);
    return this;
  }

  get image(): Image {
    return this._image;
  }

  get scale(): number {
    return this._scale;
  }

  get cursor(): number {
    return this._cursor;
  }

  get speed(): number {
    return this._speed;
  }

  set speed(value: number) {
    this._speed = value;
  }

  get hasNext(): boolean {
    return this._cursor < (this._image.width * this._image.height);
  }

  dither() {
    const speed = this._speed > 0 ? this._speed : Infinity;

    for (let i = 0; i < speed && this.hasNext; i++) {
      this.doDither(this._cursor);
      this._cursor += 1;
    }
  }

  private doDither(index: number) {
    const x = Math.floor(index % this.image.width);
    const y = Math.floor(index / this._image.width);

    const pixelIndex = index * 4;
    const oldValues = this._image.pixels.slice(pixelIndex, pixelIndex + 4);
    const oldPixel = new Pixel(oldValues);
    const newPixel = oldPixel.quantize(this._scale - 1);
    const error = oldPixel.minus(newPixel);

    const newValues = newPixel.values;
    this._image.pixels[pixelIndex + 0] = newValues[0];
    this._image.pixels[pixelIndex + 1] = newValues[1];
    this._image.pixels[pixelIndex + 2] = newValues[2];
    this._image.pixels[pixelIndex + 3] = newValues[3];

    [
      new RelayModel({x: x + 1, y: y + 0, rate: 7 / 16}),
      new RelayModel({x: x - 1, y: y + 1, rate: 3 / 16}),
      new RelayModel({x: x + 0, y: y + 1, rate: 5 / 16}),
      new RelayModel({x: x + 1, y: y + 1, rate: 1 / 16}),
    ].forEach((relay) => {
      if (relay.x < 0 || this._image.width <= relay.x) {
        return;
      }
      if (relay.y < 0 || this._image.height <= relay.y) {
        return;
      }

      const pixelIndex = (this._image.width * relay.y + relay.x) * 4;
      const oldValues = this._image.pixels.slice(pixelIndex, pixelIndex + 4);
      const base = new Pixel(oldValues);
      const delta = error.multiply(relay.rate);
      const result = base.plus(delta);

      const newValues = result.values;
      this._image.pixels[pixelIndex + 0] = newValues[0];
      this._image.pixels[pixelIndex + 1] = newValues[1];
      this._image.pixels[pixelIndex + 2] = newValues[2];
      this._image.pixels[pixelIndex + 3] = newValues[3];
    });
  }

  loadPixels() {
    this._image.loadPixels();
  }

  updatePixels() {
    this._image.updatePixels();
  }
}

export class ApplicationModel {
  private _source: ImageProcessModel;
  private _result: ImageProcessModel;

  constructor(nargs: {
    source: ImageProcessModel,
    result: ImageProcessModel,
  }) {
    this._source = nargs.source;
    this._result = nargs.result;
  }

  get source(): ImageProcessModel {
    return this._source;
  }

  get result(): ImageProcessModel {
    return this._result;
  }

  get hasNext(): boolean {
    return this._result.hasNext;
  }

  also(mutate: (model: ApplicationModel) => void): ApplicationModel {
    mutate(this);
    return this;
  }

  refresh() {
    this._source.loadPixels();
    this._result.loadPixels();
  }

  update() {
    this._result.dither();
    this._result.updatePixels();
  }
}
