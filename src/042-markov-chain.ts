// https://www.youtube.com/watch?v=eGFJ8vugIWA
import * as p5 from 'p5';

const Params = Object.freeze({
  SRC_PATH: 'names.txt',
  GRAM_ORDER: 6,
});

class MarkovChain {

  constructor(
    private table: Map<string, Map<string, number>>,
    private order: number,
  ) {
    // no-op
  }

  static assemble({texts, order}: {
    texts: string[],
    order: number,
  }) : MarkovChain {
    const table = new Map<string, Map<string, number>>();

    texts.forEach((text) => {
      for (let i = 0; i <= text.length - order; i++) {
        const gram = text.substring(i, i + order);
        const next = text[i + order];

        const map = table.get(gram) ?? new Map<string, number>();
        table.set(gram, map);

        const count = (map.get(next) ?? 0) + 1;
        map.set(next, count);
      }
    })

    return new MarkovChain(table, order);
  }

  generate({seed, length}: {seed: string, length: number}): string {
    let result = seed.substring(0, this.order);

    while (result.length < length) {
      const gram = result.substring(result.length - this.order);
      const map = this.table.get(gram);
      if (!map) {
        break;
      }

      const chars = [] as string[];
      map.forEach((count, char) => {
        for (let i = 0; i < count; i++) {
          chars.push(char);
        }
      })

      const index = Math.floor(chars.length * Math.random());
      const next = chars[index];
      result = result + next;
    }

    return result;
  }
}

function sketch(context: p5) {
  let texts: string[];

  context.preload = function() {
    context.loadStrings(Params.SRC_PATH, (result) => {
      texts = result;
    });
  }

  context.setup = function () {
    context.noCanvas();

    const chain = MarkovChain.assemble({
      texts: texts,
      order: Params.GRAM_ORDER,
    });

    const seeds = texts.map((text) => text.substring(0, Params.GRAM_ORDER));

    context.createButton('generate').mousePressed(() => {
      const sentence = chain.generate({
        seed: context.random(seeds),
        length: 1000,
      });
      context.createP(sentence);
    });
  }
}

export { sketch };
