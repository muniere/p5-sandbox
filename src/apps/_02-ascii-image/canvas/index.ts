// https://www.youtube.com/watch?v=55iwMYv8tGI
import p5, { Image } from 'p5';
import { Density } from '../shared';

const Params = Object.freeze({
  CANVAS_COLOR: '#111111',
  CHAR_COLOR: '#FFFFFF',
  CAPTURE_SIZE: 48,
  BLANK_LEVEL: 1,
});

export function sketch(context: p5) {
  let density: Density;
  let image: Image;

  context.setup = function () {
    const size = Math.min(context.windowWidth, context.windowHeight);
    context.createCanvas(size, size, context.P2D);

    density = Density.create({
      blanks: Params.BLANK_LEVEL,
    });

    // @ts-ignore
    image = context.createCapture(context.VIDEO)
      .size(Params.CAPTURE_SIZE, Params.CAPTURE_SIZE)
      .hide();
  }

  context.draw = function () {
    image.loadPixels();

    context.background(Params.CANVAS_COLOR);

    const w = context.width / image.width;
    const h = context.height / image.height;

    context.noStroke();

    for (let y = 0; y < image.height; y++) {
      for (let x = 0; x < image.width; x++) {
        const index = (y * image.width + x) * 4;
        const r = image.pixels[index];
        const g = image.pixels[index + 1];
        const b = image.pixels[index + 2];
        const gray = Math.average(r, g, b);
        const char = density.map(gray);

        context.textSize(w);
        context.textAlign(context.LEFT, context.BOTTOM);
        context.fill(Params.CHAR_COLOR);
        context.text(char, x * w, y * h);
      }
    }
  }
}
