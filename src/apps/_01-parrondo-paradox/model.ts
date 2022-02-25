export class StatisticModel {
  private _value: number;
  private _count: number;

  constructor(nargs: {
    value: number
  }) {
    this._value = nargs.value;
    this._count = 0;
  }

  get value(): number {
    return this._value;
  }

  set value(value: number) {
    this._value = value;
    this._count += 1;
  }

  get count(): number {
    return this._count;
  }
}

export enum RuleType {
  A,
  B,
  C,
}

export namespace RuleModels {

  export function choose(type: RuleType): RuleModel {
    switch (type) {
      case RuleType.A:
        return new RuleModelA();
      case RuleType.B:
        return new RuleModelB();
      case RuleType.C:
        return new RuleModelC();
    }
  }
}

export abstract class RuleModel {
  abstract readonly type: RuleType;

  abstract apply(wallet: StatisticModel): void
}

class RuleModelA extends RuleModel {
  private threshold = 0.52;

  get type(): RuleType {
    return RuleType.A;
  }

  apply(state: StatisticModel) {
    const subject = Math.random();
    const threshold = this.threshold;

    if (subject > threshold) {
      state.value += 1;
    } else {
      state.value -= 1;
    }
  }
}

class RuleModelB extends RuleModel {
  private thresholds = new Map<number, number>([
    [0, 0.99],
    [1, 0.15],
    [2, 0.15],
  ]);

  get type(): RuleType {
    return RuleType.B;
  }

  apply(state: StatisticModel) {
    const subject = Math.random();
    const rawValue = state.value % 3;
    const remaining = rawValue >= 0 ? rawValue : rawValue + 3;
    const threshold = this.thresholds.get(remaining) ?? 0;

    if (subject > threshold) {
      state.value += 1;
    } else {
      state.value -= 1;
    }
  }
}

class RuleModelC extends RuleModel {
  private threshold = 0.50;
  private gameA = new RuleModelA();
  private gameB = new RuleModelB();

  get type(): RuleType {
    return RuleType.C;
  }

  apply(wallet: StatisticModel) {
    const subject = Math.random();
    const threshold = this.threshold;

    if (subject > threshold) {
      this.gameA.apply(wallet);
    } else {
      this.gameB.apply(wallet);
    }
  }
}

export class SimulationModel {
  public maxLength: number = -1;

  private readonly _rule: RuleModel;
  private readonly _statistic: StatisticModel;
  private _history: number[];

  constructor(nargs: {
    rule: RuleModel,
    statistic: StatisticModel,
  }) {
    this._rule = nargs.rule;
    this._statistic = nargs.statistic;
    this._history = [nargs.statistic.value];
  }

  get type(): RuleType {
    return this._rule.type;
  }

  get statistic(): StatisticModel {
    return this._statistic;
  }

  get history(): number[] {
    return [...this._history];
  }

  also(mutate: (state: SimulationModel) => void): SimulationModel {
    mutate(this);
    return this;
  }

  next() {
    this._rule.apply(this._statistic);
    this._history.push(this._statistic.value);

    if (this.maxLength > 0 && this._history.length > this.maxLength) {
      this._history.shift();
    }
  }
}
