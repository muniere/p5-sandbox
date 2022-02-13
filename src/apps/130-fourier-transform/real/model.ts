import { Point } from '../../../lib/graphics2d';
import { ChainState, Clock, PathState } from '../shared/model';

export class RealWorldState {
  constructor(
    public readonly clock: Clock,
    public readonly xChain: ChainState,
    public readonly yChain: ChainState,
    public readonly path: PathState,
  ) {
    // no-op
  }

  static create({clock, xChain, yChain, path}: {
    clock: Clock,
    xChain: ChainState,
    yChain: ChainState
    path: PathState,
  }): RealWorldState {
    return new RealWorldState(clock, xChain, yChain, path);
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

    const nextPoint = Point.of({
      x: this.xChain.last().epicycleCenter.x,
      y: this.yChain.last().epicycleCenter.y,
    });

    this.path.push(nextPoint);
  }
}
