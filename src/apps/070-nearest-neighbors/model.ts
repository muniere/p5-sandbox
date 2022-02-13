export class Rating {
  constructor(
    public readonly IV?: number,
    public readonly V?: number,
    public readonly VI?: number,
    public readonly I?: number,
    public readonly II?: number,
    public readonly III?: number,
    public readonly VII?: number,
    public readonly Rogue1?: number,
    public readonly Holiday?: number,
  ) {
    // no-op
  }

  static create({IV, V, VI, I, II, III, VII, Rogue1, Holiday}: {
    IV?: number,
    V?: number,
    VI?: number,
    I?: number,
    II?: number,
    III?: number,
    VII?: number,
    Rogue1?: number,
    Holiday?: number,
  }): Rating {
    return new Rating(IV, V, VI, I, II, III, VII, Rogue1, Holiday);
  }
}

export class Evaluation {
  constructor(
    public readonly timestamp: string,
    public readonly name: string,
    public readonly IV?: number,
    public readonly V?: number,
    public readonly VI?: number,
    public readonly I?: number,
    public readonly II?: number,
    public readonly III?: number,
    public readonly VII?: number,
    public readonly Rogue1?: number,
    public readonly Holiday?: number,
  ) {
    // no-op
  }

  static create({timestamp, name, IV, V, VI, I, II, III, VII, Rogue1, Holiday}: {
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
  }): Evaluation {
    return new Evaluation(timestamp, name, IV, V, VI, I, II, III, VII, Rogue1, Holiday);
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
  }): Evaluation {
    return new Evaluation(timestamp, name, IV, V, VI, I, II, III, VII, Rogue1, Holiday);
  }

  get key(): string {
    return this.name;
  }

  static similarity(obj1: Evaluation, obj2: Evaluation): number {
    return 1 / (this.distance(obj1, obj2) + 1)
  }

  static distance(obj1: Evaluation, obj2: Evaluation): number {
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

export class Neighbor {
  constructor(
    public readonly evaluation: Evaluation,
    public readonly similarity: number,
  ) {
    // no-op
  }

  static create({evaluation, similarity}: {
    evaluation: Evaluation,
    similarity: number,
  }): Neighbor {
    return new Neighbor(evaluation, similarity);
  }
}

export class Solver {
  constructor(
    public readonly evaluations: Evaluation[],
  ) {
    // no-op
  }

  static create({evaluations}: {
    evaluations: Evaluation[],
  }): Solver {
    return new Solver(evaluations);
  }

  findNearestNeighbors({base, count}: {
    base: Evaluation,
    count: number
  }): Neighbor[] {
    return this.evaluations
      .map((it) => it.key == base.key
        ? Neighbor.create({evaluation: it, similarity: -1})
        : Neighbor.create({evaluation: it, similarity: Evaluation.similarity(base, it)}),
      )
      .filter(it => it.similarity >= 0)
      .sortedDesc((it) => it.similarity)
      .slice(0, count);
  }
}

export class Formula {

  static predict(neighbors: Neighbor[]): Rating {
    const plus = (a: number, b: number) => a + b;
    const similarity = this.sum(neighbors.map(it => it.similarity));

    return Rating.create({
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

  static sum(values: number[]): number {
    return values.reduce((acc, num) => acc + num, 0);
  }
}

export class Persona {
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

  static empty(): Persona {
    return new Persona();
  }

  evaluation(): Evaluation {
    return Evaluation.create({
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

export class Answer {
  constructor(
    public readonly neighbors: Neighbor[],
    public readonly prediction: Rating,
  ) {
    // no-op
  }

  static create({neighbors, prediction}: {
    neighbors: Neighbor[],
    prediction: Rating,
  }): Answer {
    return new Answer(neighbors, prediction)
  }
}

export class WorldState {
  public readonly persona = Persona.empty();
  public limit: number = 5;

  constructor(
    public readonly solver: Solver,
  ) {
    // no-op
  }

  static create({solver}: {
    solver: Solver,
  }): WorldState {
    return new WorldState(solver);
  }

  solve(): Answer {
    const evaluation = this.persona.evaluation();

    const neighbors = this.solver.findNearestNeighbors({
      base: evaluation,
      count: this.limit,
    });

    const prediction = Formula.predict(neighbors);

    return Answer.create({
      neighbors: neighbors,
      prediction: prediction,
    });
  }
}

