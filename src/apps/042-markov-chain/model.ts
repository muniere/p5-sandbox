export class CharFrequency {
  constructor(
    public readonly table: Map<string, number>,
  ) {
    // no-op
  }

  static empty(): CharFrequency {
    return new CharFrequency(new Map());
  }

  increment(s: string) {
    const oldValue = this.table.get(s) ?? 0;
    const newValue = oldValue + 1;
    this.table.set(s, newValue);
  }

  decrement(s: string) {
    const oldValue = this.table.get(s);
    if (!oldValue) {
      return;
    }
    const newValue = oldValue - 1;
    this.table.set(s, newValue);
  }
}

export class CharSpectrum {
  private readonly sum: number;

  constructor(
    private readonly table: Map<string, number>,
  ) {
    this.sum = [...table.values()].reduce((acc, v) => acc + v);
  }

  static create(table: Map<string, number>) {
    return new CharSpectrum(table);
  }

  random() {
    const rnd = Math.random() * this.sum;

    let acc = 0;

    for (let [k, v] of this.table) {
      acc += v;

      if (acc >= rnd) {
        return k;
      }
    }

    throw new Error();
  }
}

export class MarkovChain {
  constructor(
    private readonly table: Map<string, CharSpectrum>,
    private readonly order: number,
  ) {
    // no-op
  }

  static analyze({texts, order}: {
    texts: string[],
    order: number,
  }): MarkovChain {
    const frequencies = new Map<string, CharFrequency>();

    texts.forEach((text) => {
      for (let i = 0; i <= text.length - order; i++) {
        const gram = text.substring(i, i + order);
        const char = text[i + order];
        const freq = frequencies.get(gram) ?? CharFrequency.empty();
        freq.increment(char);
        frequencies.set(gram, freq);
      }
    })

    const spectrums = new Map<string, CharSpectrum>();

    frequencies.forEach((freq, gram) => {
      spectrums.set(gram, CharSpectrum.create(freq.table));
    })

    return new MarkovChain(spectrums, order);
  }

  next(word: string): string | undefined {
    const gram = word.substring(word.length - this.order);

    const spectrum = this.table.get(gram);
    if (!spectrum) {
      return undefined;
    }

    return spectrum.random();
  }
}

export class MarkovWriter {
  constructor(
    public readonly chain: MarkovChain,
  ) {
    // no-op
  }

  static analyze({texts, order}: {
    texts: string[],
    order: number,
  }): MarkovWriter {
    const chain = MarkovChain.analyze({texts, order});
    return new MarkovWriter(chain);
  }

  generate({seed, length}: {
    seed: string,
    length: number,
  }): string {
    let result = seed;

    while (result.length < length) {
      const next = this.chain.next(result);
      if (!next) {
        break;
      }
      result = result + next;
    }

    return result;
  }
}
