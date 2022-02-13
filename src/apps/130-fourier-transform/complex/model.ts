import { Point } from '../../../lib/graphics2d';
import { ChainState, Clock, PathState } from '../shared/model';

export class ComplexWorldState {
  constructor(
    public readonly clock: Clock,
    public readonly chain: ChainState,
    public readonly path: PathState,
  ) {
    // no-op
  }

  static create({clock, chain, path}: {
    clock: Clock,
    chain: ChainState,
    path: PathState,
  }): ComplexWorldState {
    return new ComplexWorldState(clock, chain, path);
  }

  update() {
    this.chain.update({
      clock: this.clock,
      offset: 0,
    });

    const nextPoint = Point.of({
      x: this.chain.last().epicycleCenter.x,
      y: this.chain.last().epicycleCenter.y,
    });

    this.path.push(nextPoint);
  }
}
