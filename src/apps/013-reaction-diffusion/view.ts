import p5 from 'p5';
import { Widget } from '../../lib/process';
import { NumberRange } from '../../lib/stdlib';
import { ApplicationModel } from './model';

export class ApplicationWidget extends Widget<ApplicationModel> {
  constructor(context: p5) {
    super(context);
  }

  protected doDraw(model: ApplicationModel) {
    const valueRange = new NumberRange(0, 255);

    this.scope($ => {
      $.loadPixels();

      for (let row = 0; row < $.height; row++) {
        for (let column = 0; column < $.width; column++) {
          const spot = {row, column};
          const index = (column + row * $.width) * 4;
          const {a, b} = model.grid.getValue(spot);
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
