import { FrameClock } from '../../../lib/process';
import { Point } from '../../../lib/graphics2d';
import { ChainModel, PathModel } from '../shared/model';

export class ApplicationModel {
  public readonly clock: FrameClock;
  public readonly chain: ChainModel;
  public readonly path: PathModel;

  constructor(nargs: {
    clock: FrameClock,
    chain: ChainModel,
    path: PathModel,
  }) {
    this.clock = nargs.clock;
    this.chain = nargs.chain;
    this.path = nargs.path;
  }

  update() {
    this.chain.update({
      clock: this.clock,
      offset: 0,
    });

    const nextPoint = new Point({
      x: this.chain.last().epicycleCenter.x,
      y: this.chain.last().epicycleCenter.y,
    });

    this.path.push(nextPoint);
  }
}
