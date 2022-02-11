import { Arrays, List } from '../../lib/stdlib';
import { Point } from '../../lib/graphics2d';
import { PathState } from './model.shared';

export abstract class Cross {
  abstract perform(a: PathState, b: PathState): PathState
}

export class CloneCross extends Cross {

  static create(): CloneCross {
    return new CloneCross();
  }

  perform(a: PathState, b: PathState): PathState {
    return PathState.create({
      points: [...a.points],
    });
  }
}

export class JointCross extends Cross {

  static create(): JointCross {
    return new JointCross();
  }

  perform(a: PathState, b: PathState): PathState {
    const i = Math.random() * a.points.length;
    const j = Math.random() * a.points.length;

    const start = Math.min(i, j);
    const end = Math.max(i, j);

    const head = a.points.slice(start, end);
    const tail = b.points.filter(it1 => head.findIndex(it2 => it1.equals(it2)) == -1);

    return PathState.create({
      points: [...head, ...tail],
    });
  }
}

export abstract class Mutation {
  abstract rate: number;

  abstract perform(path: PathState): PathState;
}

export class NoiseMutation extends Mutation {

  constructor(
    public readonly rate: number,
    public readonly depth: number,
  ) {
    super();
  }

  static create({rate, depth}: {
    rate: number,
    depth: number,
  }): NoiseMutation {
    return new NoiseMutation(rate, depth);
  }

  perform(path: PathState): PathState {
    return path.also(it => {
      for (let i = 0; i < this.depth; i++) {
        it.noise();
      }
    });
  }
}

export class PathCrowdState {
  private _paths: PathState[];
  private _generation: number = 1;

  constructor(
    paths: PathState[],
    public readonly cross: Cross,
    public readonly mutation: Mutation,
  ) {
    this._paths = [...paths];
  }

  static create({breadth, points, cross, mutation}: {
    breadth: number
    points: Point[],
    cross: Cross,
    mutation: Mutation,
  }): PathCrowdState {
    const paths = Arrays.generate(breadth, () => {
      return PathState.create({
        points: List.of(points).shuffled().values,
      });
    });

    return new PathCrowdState(paths, cross, mutation);
  }

  get paths(): PathState[] {
    return [...this._paths];
  }

  get generation(): number {
    return this._generation;
  }

  best(): PathState {
    return [...this._paths].sort((a, b) => a.measure() - b.measure())[0];
  }

  cycle() {
    const sorted = [...this._paths].sort((a, b) => a.measure() - b.measure());
    const scores = sorted.map(it => 1 / (it.measure() + 1));
    const total = scores.reduce((acc, score) => acc + score);

    const densities = scores.map(it => it / total);
    const cumulative = [...densities];
    for (let i = 1; i < cumulative.length; i++) {
      cumulative[i] += cumulative[i - 1];
    }

    this._paths = sorted.map(_ => {
      const value1 = Math.random();
      const index1 = cumulative.findIndex(it => it >= value1);
      const parent1 = sorted[index1];

      const value2 = Math.random();
      const index2 = cumulative.findIndex(it => it >= value2);
      const parent2 = sorted[index2];

      const child = this.cross.perform(parent1, parent2);

      if (Math.random() > this.mutation.rate) {
        return this.mutation.perform(child);
      } else {
        return child;
      }
    });

    this._generation += 1;
  }
}

export class GeneticSolver {
  private _answer: PathState | undefined;

  constructor(
    private readonly _crowd: PathCrowdState,
    private readonly _limit: number,
  ) {
    // no-op
  }

  static create({breadth, points, cross, mutation, limit}: {
    breadth: number
    points: Point[],
    cross: Cross,
    mutation: Mutation,
    limit: number,
  }): GeneticSolver {
    const crowd = PathCrowdState.create({
      breadth, points, cross, mutation
    });

    return new GeneticSolver(crowd, limit);
  }

  get hasNext(): boolean {
    return this._crowd.generation < this._limit;
  }

  get generation(): number {
    return this._crowd.generation;
  }

  get limit(): number {
    return this._limit;
  }

  get state(): PathState[] {
    return this._crowd.paths;
  }

  get answer(): PathState | undefined {
    return this._answer;
  }

  next() {
    this._crowd.cycle();

    const path = this._crowd.best();
    if (!path) {
      return;
    }

    if (!this._answer) {
      this._answer = path;
      return;
    }

    if (this._answer.measure() > path.measure()) {
      this._answer = path;
    }
  }
}
