import '../../lib/stdlib';

export class RatingModel {
  public readonly IV?: number;
  public readonly V?: number;
  public readonly VI?: number;
  public readonly I?: number;
  public readonly II?: number;
  public readonly III?: number;
  public readonly VII?: number;
  public readonly Rogue1?: number;
  public readonly Holiday?: number;

  constructor(nargs: {
    IV?: number,
    V?: number,
    VI?: number,
    I?: number,
    II?: number,
    III?: number,
    VII?: number,
    Rogue1?: number,
    Holiday?: number,
  }) {
    this.IV = nargs.IV;
    this.V = nargs.V;
    this.VI = nargs.VI;
    this.I = nargs.I;
    this.II = nargs.II;
    this.III = nargs.III;
    this.VII = nargs.VII;
    this.Rogue1 = nargs.Rogue1;
    this.Holiday = nargs.Holiday;
  }
}

export class EvaluationModel {
  public readonly timestamp: string;
  public readonly name: string;
  public readonly IV?: number;
  public readonly V?: number;
  public readonly VI?: number;
  public readonly I?: number;
  public readonly II?: number;
  public readonly III?: number;
  public readonly VII?: number;
  public readonly Rogue1?: number;
  public readonly Holiday?: number;

  constructor(nargs: {
    timestamp: string,
    name: string,
    IV?: number,
    V?: number,
    VI?: number,
    I?: number,
    II?: number,
    III?: number,
    VII?: number,
    Rogue1?: number,
    Holiday?: number,
  }) {
    this.timestamp = nargs.timestamp;
    this.name = nargs.name;
    this.IV = nargs.IV;
    this.V = nargs.V;
    this.VI = nargs.VI;
    this.I = nargs.I;
    this.II = nargs.II;
    this.III = nargs.III;
    this.VII = nargs.VII;
    this.Rogue1 = nargs.Rogue1;
    this.Holiday = nargs.Holiday;
  }

  static decode({timestamp, name, IV, V, VI, I, II, III, VII, Rogue1, Holiday}: {
    timestamp: string,
    name: string,
    IV?: number,
    V?: number,
    VI?: number,
    I?: number,
    II?: number,
    III?: number,
    VII?: number,
    Rogue1?: number,
    Holiday?: number,
  }): EvaluationModel {
    return new EvaluationModel({timestamp, name, IV, V, VI, I, II, III, VII, Rogue1, Holiday});
  }

  get key(): string {
    return this.name;
  }

  static similarity(obj1: EvaluationModel, obj2: EvaluationModel): number {
    return 1 / (this.distance(obj1, obj2) + 1)
  }

  static distance(obj1: EvaluationModel, obj2: EvaluationModel): number {
    const diffs = [] as number[];

    if (obj1.IV && obj2.IV) {
      diffs.push(obj1.IV - obj2.IV);
    }
    if (obj1.V && obj2.V) {
      diffs.push(obj1.V - obj2.V);
    }
    if (obj1.VI && obj2.VI) {
      diffs.push(obj1.VI - obj2.VI);
    }
    if (obj1.I && obj2.I) {
      diffs.push(obj1.I - obj2.I);
    }
    if (obj1.II && obj2.II) {
      diffs.push(obj1.II - obj2.II);
    }
    if (obj1.III && obj2.III) {
      diffs.push(obj1.III - obj2.III);
    }
    if (obj1.VII && obj2.VII) {
      diffs.push(obj1.VII - obj2.VII);
    }
    if (obj1.Rogue1 && obj2.Rogue1) {
      diffs.push(obj1.Rogue1 - obj2.Rogue1);
    }
    if (obj1.Holiday && obj2.Holiday) {
      diffs.push(obj1.Holiday - obj2.Holiday);
    }

    return Math.sqrt(
      diffs.map(it => it * it).reduce((acc, it) => acc + it, 0)
    );
  }
}

export class NeighborModel {
  public readonly evaluation: EvaluationModel;
  public readonly similarity: number;

  constructor(nargs: {
    evaluation: EvaluationModel,
    similarity: number,
  }) {
    this.evaluation = nargs.evaluation;
    this.similarity = nargs.similarity;
  }
}

export class SolverModel {
  private readonly _evaluations: EvaluationModel[];

  constructor(nargs: {
    evaluations: EvaluationModel[],
  }) {
    this._evaluations = nargs.evaluations;
  }

  findNearestNeighbors({base, count}: {
    base: EvaluationModel,
    count: number
  }): NeighborModel[] {
    const neighbors = this._evaluations.map((it) => it.key == base.key
      ? new NeighborModel({evaluation: it, similarity: -1})
      : new NeighborModel({evaluation: it, similarity: EvaluationModel.similarity(base, it)}),
    );

    return neighbors
      .filter(it => it.similarity >= 0)
      .sortedDesc(it => it.similarity)
      .slice(0, count);
  }
}

export module Formula {

  export function predict(neighbors: NeighborModel[]): RatingModel {
    const plus = (a: number, b: number) => a + b;
    const similarity = Math.sum(...neighbors.map(it => it.similarity));

    return new RatingModel({
      IV: neighbors.filter(it => it.evaluation.IV).map(it => it.evaluation.IV! * it.similarity).reduce(plus) / similarity,
      V: neighbors.filter(it => it.evaluation.V).map(it => it.evaluation.V! * it.similarity).reduce(plus) / similarity,
      VI: neighbors.filter(it => it.evaluation.VI).map(it => it.evaluation.VI! * it.similarity).reduce(plus) / similarity,
      I: neighbors.filter(it => it.evaluation.I).map(it => it.evaluation.I! * it.similarity).reduce(plus) / similarity,
      II: neighbors.filter(it => it.evaluation.II).map(it => it.evaluation.II! * it.similarity).reduce(plus) / similarity,
      III: neighbors.filter(it => it.evaluation.III).map(it => it.evaluation.III! * it.similarity).reduce(plus) / similarity,
      VII: neighbors.filter(it => it.evaluation.VII).map(it => it.evaluation.VII! * it.similarity).reduce(plus) / similarity,
      Rogue1: neighbors.filter(it => it.evaluation.Rogue1).map(it => it.evaluation.Rogue1! * it.similarity).reduce(plus) / similarity,
      Holiday: neighbors.filter(it => it.evaluation.Holiday).map(it => it.evaluation.Holiday! * it.similarity).reduce(plus) / similarity,
    });
  }
}

export class PersonaModel {
  constructor(
    public IV?: number,
    public V?: number,
    public VI?: number,
    public I?: number,
    public II?: number,
    public III?: number,
    public VII?: number,
    public Rogue1?: number,
    public Holiday?: number,
  ) {
    // no-op
  }

  evaluation(): EvaluationModel {
    return new EvaluationModel({
      timestamp: new Date().toISOString(),
      name: 'anonymous',
      IV: this.IV,
      V: this.V,
      VI: this.VI,
      I: this.I,
      II: this.II,
      III: this.III,
      VII: this.VII,
      Rogue1: this.Rogue1,
      Holiday: this.Holiday,
    });
  }
}

export class SolutionModel {
  public _neighbors: NeighborModel[];
  public _prediction: RatingModel;

  constructor(nargs: {
    neighbors: NeighborModel[],
    prediction: RatingModel,
  }) {
    this._neighbors = nargs.neighbors;
    this._prediction = nargs.prediction
  }

  get neighbors(): NeighborModel[] {
    return [...this._neighbors];
  }

  get prediction(): RatingModel {
    return this._prediction;
  }
}

export class ApplicationModel {
  private readonly _persona = new PersonaModel();
  private readonly _solver: SolverModel;
  private _limit: number = 5;

  constructor(nargs: {
    solver: SolverModel,
  }) {
    this._solver = nargs.solver;
  }

  get persona(): PersonaModel {
    return this._persona;
  }

  get limit(): number {
    return this._limit;
  }

  set limit(value: number) {
    this._limit = value;
  }

  also(mutate: (model: ApplicationModel) => void): ApplicationModel {
    mutate(this);
    return this;
  }

  solve(): SolutionModel {
    const evaluation = this._persona.evaluation();

    const neighbors = this._solver.findNearestNeighbors({
      base: evaluation,
      count: this._limit,
    });

    const prediction = Formula.predict(neighbors);

    return new SolutionModel({
      neighbors: neighbors,
      prediction: prediction,
    });
  }
}
