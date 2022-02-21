import { Image } from 'p5';
import { Pixel } from '../../lib/drawing';

export class Relay {

  constructor(
    public x: number,
    public y: number,
    public rate: number,
  ) {
    // no-op
  }

  static of({x, y, rate}: {
    x: number,
    y: number,
    rate: number,
  }): Relay {
    return new Relay(x, y, rate);
  }
}

// noinspection PointlessArithmeticExpressionJS
export class ImageMachine {
  private readonly _image: Image;
  private readonly _scale: number;

  private _cursor: number = 0;
  private _speed: number = -1;

  constructor(
    image: Image,
    scale: number,
  ) {
    this._image = image;
    this._scale = scale;
  }

  static create({image, scale}: {
    image: Image,
    scale: number,
  }): ImageMachine {
    return new ImageMachine(image, scale);
  }

  also(mutate: (machine: ImageMachine) => void): ImageMachine {
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

  setSpeed(speed: number) {
    this._speed = speed;
  }

  get hasNext(): boolean {
    return this._cursor < (this._image.width * this._image.height);
  }

  dither() {
    const speed = this._speed > 0 ? this._speed : Infinity;

    for (let i = 0; i < speed && this.hasNext; i++) {
      this.ditherPixel(this._cursor);
      this._cursor += 1;
    }
  }

  ditherPixel(index: number) {
    const x = Math.floor(index % this.image.width);
    const y = Math.floor(index / this._image.width);

    const pixelIndex = index * 4;
    const oldValues = this._image.pixels.slice(pixelIndex, pixelIndex + 4);
    const oldPixel = Pixel.of(oldValues);
    const newPixel = oldPixel.quantize(this._scale - 1);
    const error = oldPixel.minus(newPixel);

    const newValues = newPixel.values;
    this._image.pixels[pixelIndex + 0] = newValues[0];
    this._image.pixels[pixelIndex + 1] = newValues[1];
    this._image.pixels[pixelIndex + 2] = newValues[2];
    this._image.pixels[pixelIndex + 3] = newValues[3];

    [
      Relay.of({x: x + 1, y: y + 0, rate: 7 / 16}),
      Relay.of({x: x - 1, y: y + 1, rate: 3 / 16}),
      Relay.of({x: x + 0, y: y + 1, rate: 5 / 16}),
      Relay.of({x: x + 1, y: y + 1, rate: 1 / 16}),
    ].forEach((relay) => {
      if (relay.x < 0 || this._image.width <= relay.x) {
        return;
      }
      if (relay.y < 0 || this._image.height <= relay.y) {
        return;
      }

      const pixelIndex = (this._image.width * relay.y + relay.x) * 4;
      const oldValues = this._image.pixels.slice(pixelIndex, pixelIndex + 4);
      const base = Pixel.of(oldValues);
      const delta = error.multiply(relay.rate);
      const result = base.plus(delta);

      const newValues = result.values;
      this._image.pixels[pixelIndex + 0] = newValues[0];
      this._image.pixels[pixelIndex + 1] = newValues[1];
      this._image.pixels[pixelIndex + 2] = newValues[2];
      this._image.pixels[pixelIndex + 3] = newValues[3];
    });
  }

  load() {
    this._image.loadPixels();
  }

  update() {
    this._image.updatePixels();
  }
}

