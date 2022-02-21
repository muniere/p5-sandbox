export class Token {
  constructor(
    public readonly value: string,
  ) {
    // no-op
  }
}

export class Phrase {
  constructor(
    public readonly values: string[]
  ) {
    // no-op
  }
}

export class Rule {
  constructor(
    public readonly token: Token,
    public readonly phrase: Phrase,
  ) {
    // no-op
  }

  static of(token: string, phrase: string[]): Rule {
    return new Rule(new Token(token), new Phrase(phrase));
  }
}

export class Grammar {
  constructor(
    private table: Map<string, Phrase[]>,
  ) {
    // no-op
  }

  static assemble(rules: Rule[]): Grammar {
    const table = new Map<string, Phrase[]>();

    rules.forEach((rule) => {
      const oldValue = table.get(rule.token.value) ?? [];
      const newValue = [...oldValue, rule.phrase];
      table.set(rule.token.value, newValue);
    });

    return new Grammar(table);
  }

  expand(token: string): string[] {
    const phrases = this.table.get(token) ?? [];
    if (phrases.length == 0) {
      return [];
    }

    const phrase = phrases.sample();
    return [...phrase.values];
  }
}

export class Machine {
  public stack: string[];
  public result: string[];

  constructor(
    private grammar: Grammar,
    seed: string
  ) {
    this.stack = [seed];
    this.result = [];
  }

  static create({grammar, seed}: {
    grammar: Grammar,
    seed: string,
  }): Machine {
    return new Machine(grammar, seed);
  }

  update() {
    const token = this.stack.pop();
    if (!token) {
      return;
    }

    const next = this.grammar.expand(token);
    if (next.length == 0) {
      this.result.push(token);
      return;
    }

    next.reverse().forEach(
      it => this.stack.push(it)
    );
  }
}
