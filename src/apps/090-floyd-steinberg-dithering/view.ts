import * as p5 from 'p5';
import { Point } from '../../lib/graphics2d';
import { ImageMachine } from './model';

export class ImageWidget {
  public machine: ImageMachine | undefined;
  public origin = Point.zero();

  constructor(
    public readonly context: p5,
  ) {
    // no-op
  }

  also(mutate: (widget: ImageWidget) => void): ImageWidget {
    mutate(this);
    return this;
  }

  draw() {
    const machine = this.machine;
    if (!machine) {
      return;
    }

    this.context.image(machine.image, this.origin.x, this.origin.y);
  }
}
