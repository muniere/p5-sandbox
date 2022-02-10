// https://www.youtube.com/watch?v=0L2n8Tg2FwI
import * as p5 from 'p5';
import { Point } from '../../lib/graphics2d';
import { ImageMachine } from './model';
import { ImageWidget } from './view';

const Params = Object.freeze({
  PATH: '/image.jpg',
  SCALE: 2,
});

export function sketch(context: p5) {
  let sourceMachine: ImageMachine;
  let sourceWidget: ImageWidget;

  let resultMachine: ImageMachine;
  let resultWidget: ImageWidget;

  context.preload = function () {
    sourceMachine = ImageMachine.create({
      image: context.loadImage(Params.PATH),
    });
    resultMachine = ImageMachine.create({
      image: context.loadImage(Params.PATH),
    })
  }

  context.setup = function () {
    context.createCanvas(
      context.windowWidth,
      context.windowHeight,
      context.P2D,
    );
    context.pixelDensity(1);
    context.noLoop();

    sourceWidget = ImageWidget.create({
      context: context,
      origin: Point.zero(),
      machine: sourceMachine,
    });

    resultWidget = ImageWidget.create({
      context: context,
      origin: sourceWidget.origin.with({
        x: sourceMachine.image.width,
      }),
      machine: resultMachine,
    });
  };

  context.draw = function () {
    resultMachine.dither();

    sourceWidget.draw();
    resultWidget.draw();
  }
}
