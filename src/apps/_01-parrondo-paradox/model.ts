export enum GameType {
  A,
  B,
  C,
}

export class WalletState {
  constructor(
    public amount: number,
  ) {
    // no-op
  }

  static create({amount}: {
    amount: number,
  }): WalletState {
    return new WalletState(amount);
  }
}

export interface Game {
  type: GameType;

  perform(wallet: WalletState): void
}

class GameA implements Game {
  private threshold = 0.52;

  get type(): GameType {
    return GameType.A;
  }

  perform(wallet: WalletState) {
    const subject = Math.random();
    const threshold = this.threshold;

    if (subject > threshold) {
      wallet.amount += 1;
    } else {
      wallet.amount -= 1;
    }
  }
}

class GameB implements Game {
  private thresholds = new Map<number, number>([
    [0, 0.99],
    [1, 0.15],
    [2, 0.15],
  ]);

  get type(): GameType {
    return GameType.B;
  }

  perform(wallet: WalletState) {
    const subject = Math.random();
    const rawValue = wallet.amount % 3;
    const remaining = rawValue >= 0 ? rawValue : rawValue + 3;
    const threshold = this.thresholds.get(remaining) ?? 0;

    if (subject > threshold) {
      wallet.amount += 1;
    } else {
      wallet.amount -= 1;
    }
  }
}

class GameC implements Game {
  private threshold = 0.50;
  private gameA = new GameA();
  private gameB = new GameB();

  get type(): GameType {
    return GameType.C;
  }

  perform(wallet: WalletState) {
    const subject = Math.random();
    const threshold = this.threshold;

    if (subject > threshold) {
      this.gameA.perform(wallet);
    } else {
      this.gameB.perform(wallet);
    }
  }
}

export class SimulationState {
  public maxLength: number = -1;

  private _history: number[] = [];

  constructor(
    public readonly wallet: WalletState,
    public readonly game: Game,
  ) {
    // no-op
  }

  static create({wallet, type}: {
    wallet: WalletState,
    type: GameType,
  }): SimulationState {
    const game = (() => {
      switch (type) {
        case GameType.A:
          return new GameA();
        case GameType.B:
          return new GameB();
        case GameType.C:
          return new GameC();
      }
    })();

    return new SimulationState(wallet, game);
  }

  get type(): GameType {
    return this.game.type;
  }

  get history(): number[] {
    return [...this._history];
  }

  get value(): number {
    return this.wallet.amount;
  }

  also(mutate: (state: SimulationState) => void): SimulationState {
    mutate(this);
    return this;
  }

  reset() {
    this._history = [this.wallet.amount];
  }

  next() {
    this.game.perform(this.wallet);
    this._history.push(this.wallet.amount);

    if (this.maxLength > 0 && this._history.length > this.maxLength) {
      this._history.shift();
    }
  }
}

export class ProgressState {
  private _count: number = 0;
  private _amount: number = 0;

  constructor(
    public readonly type: GameType,
  ) {
    // no-op
  }

  static create({type}: {
    type: GameType,
  }): ProgressState {
    return new ProgressState(type);
  }

  get count(): number {
    return this._count;
  }

  get amount(): number {
    return this._amount;
  }

  update(wallet: WalletState) {
    this._count += 1;
    this._amount = wallet.amount;
  }

  reset() {
    this._count = 0;
  }
}
