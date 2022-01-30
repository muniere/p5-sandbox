// https://www.youtube.com/watch?v=0L2n8Tg2FwI
import * as p5 from "p5";

const Params = Object.freeze({
  PATH: '/image.jpg',
  SCALE: 2,
});

class Coordinate {
  constructor(
    public x: number,
    public y: number,
  ) {
    // no-op
  }

  static zero(): Coordinate {
    return new Coordinate(0, 0);
  }

  static of({x, y}: {
    x: number,
    y: number,
  }): Coordinate {
    return new Coordinate(x, y);
  }
}

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

  static of({x, y, rate}: {
    x: number,
    y: number,
    rate: number,
  }): Relay {
    return new Relay(x, y, rate);
  }
}

class Machine {

  constructor(
    public image: p5.Image,
  ) {
    // no-op
  }

  static create({image}: {
    image: p5.Image,
  }): Machine {
    return new Machine(image);
  }

  dither({x, y}: {
    x: number,
    y: number,
  }) {
    const oldPixel = Pixel.of(this.image.get(x, y));
    const newPixel = oldPixel.quantize(Params.SCALE - 1);
    const error = oldPixel.minus(newPixel);

    this.image.set(x, y, newPixel.values);

    // noinspection PointlessArithmeticExpressionJS
    [
      Relay.of({x: x + 1, y: y + 0, rate: 7 / 16}),
      Relay.of({x: x - 1, y: y + 1, rate: 3 / 16}),
      Relay.of({x: x + 0, y: y + 1, rate: 5 / 16}),
      Relay.of({x: x + 1, y: y + 1, rate: 1 / 16}),
    ].forEach((relay) => {
      if (relay.x < 0 || this.image.width < relay.x) {
        return;
      }
      if (relay.y < 0 || this.image.width < relay.y) {
        return;
      }

      const base = Pixel.of(this.image.get(relay.x, relay.y));
      const delta = error.multiply(relay.rate);
      const result = base.plus(delta);
      this.image.set(relay.x, relay.y, result.values);
    });
  }

  update() {
    this.image.updatePixels();
  }
}

class View {

  constructor(
    public context: p5,
    public origin: Coordinate,
    public machine: Machine,
  ) {
    // no-op
  }

  static create({context, origin, processor}: {
    context: p5,
    origin: Coordinate,
    processor: Machine,
  }): View {
    return new View(context, origin, processor);
  }

  get image(): p5.Image {
    return this.machine.image;
  }

  draw() {
    this.context.image(this.machine.image, this.origin.x, this.origin.y);
  }
}

function sketch(context: p5) {
  let sourceView: View;
  let resultView: View;

  context.preload = function () {
    sourceView = View.create({
      context: context,
      origin: Coordinate.zero(),
      processor: Machine.create({
        image: context.loadImage(Params.PATH),
      })
    });

    resultView = View.create({
      context: context,
      origin: Coordinate.zero(),
      processor: Machine.create({
        image: context.loadImage(Params.PATH),
      })
    });
  }

  context.setup = function () {
    context.createCanvas(context.windowWidth, context.windowHeight);
    context.pixelDensity(1);
    context.noLoop();

    sourceView.origin.x = 0;
    resultView.origin.x = sourceView.image.width;

    for (let y = 0; y < resultView.image.height; y++) {
      for (let x = 0; x < resultView.image.width; x++) {
        resultView.machine.dither({x, y});
      }
    }

    resultView.machine.update();

    sourceView.draw();
    resultView.draw();
  };

  context.draw = function () {
    // no-op
  }
}

export { sketch };
