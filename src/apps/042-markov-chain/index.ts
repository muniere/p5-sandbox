// https://www.youtube.com/watch?v=eGFJ8vugIWA
import * as p5 from 'p5';
import { MarkovWriter } from './model';

const Params = Object.freeze({
  SRC_PATH: 'names.txt',
  GRAM_ORDER: 6,
});

export function sketch(context: p5) {
  let texts: string[];

  context.preload = function () {
    context.loadStrings(Params.SRC_PATH, (result) => {
      texts = result;
    });
  }

  context.setup = function () {
    context.noCanvas();

    const writer = MarkovWriter.analyze({
      texts: texts,
      order: Params.GRAM_ORDER,
    });

    const seeds = texts.map(
      (text) => text.substring(0, Params.GRAM_ORDER)
    );

    context.createButton('generate').mousePressed(() => {
      const sentence = writer.generate({
        seed: context.random(seeds),
        length: 1000,
      });
      context.createP(sentence);
    });
  }
}
