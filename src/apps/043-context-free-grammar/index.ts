// https://www.youtube.com/watch?v=8Z9FRiW2Jlc
import * as p5 from 'p5';

class Token {
  constructor(
    public value: string,
  ) {
    // no-op
  }
}

class Phrase {
  constructor(
    public values: string[]
  ) {
    // no-op
  }
}

class Rule {
  constructor(
    public token: Token,
    public phrase: Phrase,
  ) {
    // no-op
  }

  static of(token: string, phrase: string[]): Rule {
    return new Rule(new Token(token), new Phrase(phrase));
  }
}

class Grammar {
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

    const index = Math.floor(phrases.length * Math.random());
    const phrase = phrases[index];
    return [...phrase.values];
  }
}

class Stack {
  constructor(
    public values: string[] = [],
  ) {
    // no-op
  }

  get length(): number {
    return this.values.length;
  }

  push(value: string) {
    this.values.unshift(value);
  }

  pop(): string | undefined {
    return this.values.shift();
  }
}

class List {
  constructor(
    public values: string[] = [],
  ) {
    // no-op
  }

  get length(): number {
    return this.values.length;
  }

  push(value: string) {
    this.values.push(value);
  }
}

class Size {
  constructor(
    public width: number,
    public height: number,
  ) {
    // no-op
  }
}

class Grid {
  constructor(
    private origin: p5.Vector,
    private itemSize: Size,
    private values: string[],
  ) {
    // no-op
  }

  static create({origin, itemSize, values}: {
    origin: p5.Vector,
    itemSize: Size,
    values: string[],
  }): Grid {
    return new Grid(origin, itemSize, values);
  }

  draw(context: p5) {
    context.push();

    context.stroke(0);
    context.textAlign(context.CENTER);
    context.textStyle(context.NORMAL);

    context.translate(this.origin);

    if (this.values.length > 0) {
      let origin = new p5.Vector();
      let size = this.itemSize;

      this.values.forEach((value) => {
        context.rect(origin.x, origin.y, size.width, size.height);
        context.text(value, origin.x + size.width / 2, origin.y + size.height / 2 + 5);

        origin = origin.copy().add(size.width);

        if (origin.x + size.width > context.width) {
          origin = origin.copy().set(0, origin.y + size.height);
        }
      });

    } else {
      const origin = new p5.Vector();
      const size = this.itemSize;

      // @ts-ignore
      context.drawingContext.setLineDash([5, 5]);
      context.rect(origin.x, origin.y, size.width, size.height);
      context.text('φ', origin.x + size.width / 2, origin.y + size.height / 2 + 5);
    }


    context.pop();
  }
}

class Machine {
  public stack: Stack;
  public result: List;

  constructor(
    private grammar: Grammar,
    seed: string
  ) {
    this.stack = new Stack([seed]);
    this.result = new List([]);
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

function sketch(context: p5) {
  let machine: Machine;

  context.setup = function () {
    context.noLoop();
    context.createCanvas(context.windowWidth, 150);

    const grammar = Grammar.assemble([
      Rule.of("S", ["x"]),
      Rule.of("S", ["y"]),
      Rule.of("S", ["z"]),
      Rule.of("S", ["S", "+", "S"]),
      Rule.of("S", ["S", "-", "S"]),
      Rule.of("S", ["S", "/", "S"]),
      Rule.of("S", ["(", "S", ")"]),
    ]);

    machine = Machine.create({
      grammar: grammar,
      seed: "S"
    })

    context.createButton("forward")
      .position(10, context.height + 10)
      .mousePressed(() => {
        machine.update();
        context.redraw();
      });
  }

  context.draw = function () {
    context.background(255);

    context.text(`Stack (${machine.stack.length})`, 10, 10);

    Grid.create({
      origin: context.createVector(10, 15),
      itemSize: new Size(50, 50),
      values: machine.stack.values,
    }).draw(context);

    context.text(`Result (${machine.result.length})`, 10, 90);

    Grid.create({
      origin: context.createVector(10, 95),
      itemSize: new Size(50, 50),
      values: machine.result.values,
    }).draw(context);
  }
}

export { sketch };
