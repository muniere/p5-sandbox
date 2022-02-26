import { FrameClock } from '../../../lib/process';
import { Point } from '../../../lib/graphics2d';
import { ChainModel, PathModel } from '../shared/model';

export class ApplicationModel {
  public readonly clock: FrameClock;
  public readonly xChain: ChainModel;
  public readonly yChain: ChainModel;
  public readonly path: PathModel;

  constructor(nargs: {
    clock: FrameClock,
    xChain: ChainModel,
    yChain: ChainModel,
    path: PathModel,
  }) {
    this.clock = nargs.clock;
    this.xChain = nargs.xChain;
    this.yChain = nargs.yChain;
    this.path = nargs.path;
  }

  update() {
    this.xChain.update({
      clock: this.clock,
      offset: 0,
    });
    this.yChain.update({
      clock: this.clock,
      offset: Math.PI / 2,
    });

    const nextPoint = new Point({
      x: this.xChain.last().epicycleCenter.x,
      y: this.yChain.last().epicycleCenter.y,
    });

    this.path.push(nextPoint);
  }
}
