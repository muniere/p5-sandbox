// https://www.youtube.com/watch?v=55iwMYv8tGI
import p5, { Element, Image } from 'p5';
import { Density } from '../shared';

const Params = Object.freeze({
  CAPTURE_SIZE: 48,
  BLANK_LEVEL: 1,
});

export function sketch(context: p5) {
  let density: Density;
  let ascii: Element;
  let image: Image;

  context.setup = function () {
    context.noCanvas();

    density = Density.create({
      blanks: Params.BLANK_LEVEL,
    });

    // @ts-ignore
    image = context.createCapture(context.VIDEO)
      .size(Params.CAPTURE_SIZE, Params.CAPTURE_SIZE)
      .hide();

    ascii = context.createElement('pre');
  }

  context.draw = function () {
    image.loadPixels();

    let text = '';

    for (let y = 0; y < image.height; y++) {
      for (let x = 0; x < image.width; x++) {
        const index = (y * image.width + x) * 4;
        const r = image.pixels[index];
        const g = image.pixels[index + 1];
        const b = image.pixels[index + 2];
        const gray = Math.average(r, g, b);
        const char = density.map(gray);
        text += char;
      }
      if (y < image.height - 1) {
        text += '\n';
      }
    }

    ascii.html(text);
  }
}
