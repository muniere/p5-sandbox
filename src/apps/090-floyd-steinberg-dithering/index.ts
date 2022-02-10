// https://www.youtube.com/watch?v=0L2n8Tg2FwI
import * as p5 from 'p5';
import { Point } from '../../lib/graphics2d';
import { Pixel } from '../../lib/drawing';

const Params = Object.freeze({
  PATH: '/image.jpg',
  SCALE: 2,
});

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
    public origin: Point,
    public machine: Machine,
  ) {
    // no-op
  }

  static create({context, origin, processor}: {
    context: p5,
    origin: Point,
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
      origin: Point.zero(),
      processor: Machine.create({
        image: context.loadImage(Params.PATH),
      })
    });

    resultView = View.create({
      context: context,
      origin: Point.zero(),
      processor: Machine.create({
        image: context.loadImage(Params.PATH),
      })
    });
  }

  context.setup = function () {
    context.createCanvas(context.windowWidth, context.windowHeight);
    context.pixelDensity(1);
    context.noLoop();

    sourceView.origin = sourceView.origin.with({x: 0});
    resultView.origin = resultView.origin.with({x: sourceView.image.width});

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
