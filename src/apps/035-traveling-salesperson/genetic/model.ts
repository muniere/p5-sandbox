import { Arrays } from '../../../lib/stdlib';
import { Point } from '../../../lib/graphics2d';
import { PathModel, ProgressModel } from '../shared/model';

export abstract class CrossModel {
  abstract perform(a: PathModel, b: PathModel): PathModel
}

export class CloneCrossModel extends CrossModel {

  static create(): CloneCrossModel {
    return new CloneCrossModel();
  }

  perform(a: PathModel, b: PathModel): PathModel {
    return new PathModel({
      points: [...a.points],
    });
  }
}

export class JointCrossModel extends CrossModel {

  static create(): JointCrossModel {
    return new JointCrossModel();
  }

  perform(a: PathModel, b: PathModel): PathModel {
    const i = Math.random() * a.points.length;
    const j = Math.random() * a.points.length;

    const start = Math.min(i, j);
    const end = Math.max(i, j);

    const head = a.points.slice(start, end);
    const tail = b.points.filter(it1 => head.findIndex(it2 => it1.equals(it2)) == -1);

    return new PathModel({
      points: [...head, ...tail],
    });
  }
}

export abstract class MutationModel {
  abstract rate: number;

  abstract perform(path: PathModel): PathModel;
}

export class NoiseMutationModel extends MutationModel {
  public readonly rate: number;
  public readonly depth: number;

  constructor(nargs: {
    rate: number,
    depth: number,
  }) {
    super();
    this.rate = nargs.rate;
    this.depth = nargs.depth;
  }

  perform(path: PathModel): PathModel {
    return path.also(it => {
      for (let i = 0; i < this.depth; i++) {
        it.noise();
      }
    });
  }
}

export class PathGroupModel {
  private _paths: PathModel[];
  private _generation: number = 1;
  public readonly cross: CrossModel;
  public readonly mutation: MutationModel;

  constructor(nargs: {
    paths: PathModel[],
    cross: CrossModel,
    mutation: MutationModel,
  }) {
    this._paths = [...nargs.paths];
    this.cross = nargs.cross;
    this.mutation = nargs.mutation;
  }

  get paths(): PathModel[] {
    return [...this._paths];
  }

  get generation(): number {
    return this._generation;
  }

  best(): PathModel {
    return this._paths.minBy(it => it.measure());
  }

  cycle() {
    const sorted = this._paths.sortedAsc(it => it.measure());
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
  private readonly _group: PathGroupModel;
  private readonly _limit: number;
  private _answer: PathModel | undefined;

  constructor(nargs: {
    paths: PathModel[],
    cross: CrossModel,
    mutation: MutationModel,
    limit: number,
  }) {
    this._group = new PathGroupModel({
      paths: nargs.paths,
      cross: nargs.cross,
      mutation: nargs.mutation,
    });
    this._limit = nargs.limit;
  }

  static create({points, concurrency, cross, mutation, limit}: {
    points: Point[],
    concurrency: number,
    cross: CrossModel,
    mutation: MutationModel,
    limit: number,
  }): GeneticSolver {
    const paths = Arrays.generate(concurrency, () => {
      return new PathModel({
        points: points.shuffled(),
      });
    });
    return new GeneticSolver({paths, cross, mutation, limit});
  }

  get hasNext(): boolean {
    return this._group.generation < this._limit;
  }

  get paths(): PathModel[] {
    return this._group.paths;
  }

  get progress(): ProgressModel {
    return new ProgressModel({
      total: this._limit,
      current: this._group.generation,
    });
  }

  get answer(): PathModel | undefined {
    return this._answer;
  }

  next() {
    this._group.cycle();

    const path = this._group.best();
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
