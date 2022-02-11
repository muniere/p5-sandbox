import * as p5 from 'p5';
import { Numeric } from '../../lib/stdlib';
import { Spot } from '../../lib/dmath';
import { WorldState } from './model';

export class WorldWidget {
  constructor(
    public readonly context: p5,
    public readonly state: WorldState,
  ) {
    // no-op
  }

  draw() {
    const context = this.context;
    const grid = this.state.grid;

    context.loadPixels();

    const valueRange = Numeric.range(0, 255);

    for (let row = 0; row < context.height; row++) {
      for (let column = 0; column < context.width; column++) {
        const spot = Spot.of({row, column});
        const index = (column + row * context.width) * 4;
        const {a, b} = grid.getValue(spot);
        const value = 255 - Math.floor((a - b) * 256);
        const color = valueRange.coerce(value);
        context.pixels[index + 0] = color;
        context.pixels[index + 1] = color;
        context.pixels[index + 2] = color;
        context.pixels[index + 3] = 255;
      }
    }

    context.updatePixels();
  }
}
