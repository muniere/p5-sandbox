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

export class ImageMachine {
  public scale: number = 2;

  constructor(
    public image: Image,
  ) {
    // no-op
  }

  static create({image}: {
    image: Image,
  }): ImageMachine {
    return new ImageMachine(image);
  }

  dither() {
    for (let y = 0; y < this.image.height; y++) {
      for (let x = 0; x < this.image.width; x++) {
        this.ditherPixel({x, y});
      }
    }

    this.update();
  }

  ditherPixel({x, y}: {
    x: number,
    y: number,
  }) {
    const oldPixel = Pixel.of(this.image.get(x, y));
    const newPixel = oldPixel.quantize(this.scale - 1);
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
