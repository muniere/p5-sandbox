import * as p5 from 'p5';
import { Point } from '../../lib/graphics2d';
import { ImageMachine } from './model';

export class ImageWidget {

  constructor(
    public context: p5,
    public origin: Point,
    public machine: ImageMachine,
  ) {
    // no-op
  }

  static create({context, origin, machine}: {
    context: p5,
    origin: Point,
    machine: ImageMachine,
  }): ImageWidget {
    return new ImageWidget(context, origin, machine);
  }

  draw() {
    this.context.image(this.machine.image, this.origin.x, this.origin.y);
  }
}
