// https://www.youtube.com/watch?v=0L2n8Tg2FwI
import * as p5 from "p5";

const Params = Object.freeze({
  PATH: '/image.jpg',
  SCALE: 2,
});

class Pixel {
  constructor(
    private _values: number[]
  ) {
    if (_values.length != 4) {
      throw new Error('invalid values format');
    }
  }

  static of(values: number[]): Pixel {
    return new Pixel(values);
  }

  quantize(factor: number): Pixel {
    return new Pixel([
      Math.round(factor * this.r / 255) * 255 / factor,
      Math.round(factor * this.g / 255) * 255 / factor,
      Math.round(factor * this.b / 255) * 255 / factor,
      this.a,
    ]);
  }

  plus(other: Pixel): Pixel {
    return new Pixel([
      this._values[0] + other._values[0],
      this._values[1] + other._values[1],
      this._values[2] + other._values[2],
      this._values[3] + other._values[3],
    ]);
  }

  minus(other: Pixel): Pixel {
    return new Pixel([
      this._values[0] - other._values[0],
      this._values[1] - other._values[1],
      this._values[2] - other._values[2],
      this._values[3] - other._values[3],
    ]);
  }

  multiply(factor: number): Pixel {
    return new Pixel([
      this._values[0] * factor,
      this._values[1] * factor,
      this._values[2] * factor,
      this._values[3] * factor,
    ]);
  }

  get values(): number[] {
    return [...this._values];
  }

  get r(): number {
    return this._values[0];
  }

  get g(): number {
    return this._values[1];
  }

  get b(): number {
    return this._values[2];
  }

  get a(): number {
    return this._values[3];
  }
}

class Relay {

  constructor(
    public x: number,
    public y: number,
    public rate: number,
  ) {
    // no-op
  }

  apply(image: p5.Image, err: Pixel): boolean {
    if (this.x < 0 || image.width < this.x) {
      return false;
    }
    if (this.y < 0 || image.width < this.y) {
      return false;
    }

    const base = Pixel.of(image.get(this.x, this.y));
    const delta = err.multiply(this.rate);
    const result = base.plus(delta);
    image.set(this.x, this.y, result.values);
    return true;
  }
}

class Dithering {

  constructor(
    private relays: Relay[]
  ) {
    // no-op
  }

  static of(x: number, y: number): Dithering {
    return new Dithering([
      new Relay(x + 1, y + 0, 7 / 16),
      new Relay(x - 1, y + 1, 3 / 16),
      new Relay(x + 0, y + 1, 5 / 16),
      new Relay(x + 1, y + 1, 1 / 16),
    ]);
  }

  apply(image: p5.Image, err: Pixel) {
    this.relays.forEach(it => it.apply(image, err));
  }
}

function sketch(self: p5) {
  let image: p5.Image;

  self.preload = function () {
    image = self.loadImage(Params.PATH);
  }

  self.setup = function () {
    self.createCanvas(image.width * 2, image.height);

    self.image(image, 0, 0);

    for (let y = 0; y < image.height; y++) {
      for (let x = 0; x < image.width; x++) {
        const old_px = Pixel.of(image.get(x, y));
        const new_px = old_px.quantize(Params.SCALE - 1);
        const err = old_px.minus(new_px);

        image.set(x, y, new_px.values);

        Dithering.of(x, y).apply(image, err);
      }
    }

    image.updatePixels();

    self.image(image, image.width, 0);
  };

  self.draw = function () {
    // update image only once, at startup
  }
}

export { sketch };
