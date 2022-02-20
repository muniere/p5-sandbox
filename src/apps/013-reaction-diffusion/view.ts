import * as p5 from 'p5';
import { Context } from '../../lib/process';
import { Numeric } from '../../lib/stdlib';
import { Spot } from '../../lib/dmath';
import { ApplicationModel } from './model';

export class ApplicationWidget {
  constructor(
    public readonly context: p5,
    public readonly model: ApplicationModel,
  ) {
    // no-op
  }

  draw() {
    const grid = this.model.grid;
    const valueRange = Numeric.range(0, 255);

    Context.scope(this.context, $ => {
      $.loadPixels();

      for (let row = 0; row < $.height; row++) {
        for (let column = 0; column < $.width; column++) {
          const spot = Spot.of({row, column});
          const index = (column + row * $.width) * 4;
          const {a, b} = grid.getValue(spot);
          const value = 255 - Math.floor((a - b) * 256);
          const color = valueRange.coerce(value);
          $.pixels[index + 0] = color;
          $.pixels[index + 1] = color;
          $.pixels[index + 2] = color;
          $.pixels[index + 3] = 255;
        }
      }

      $.updatePixels();
    });
  }
}
