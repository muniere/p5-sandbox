// https://www.youtube.com/watch?v=0L2n8Tg2FwI
import * as p5 from 'p5';
import { Point } from '../../lib/graphics2d';
import { ImageMachine } from './model';
import { ImageWidget } from './view';

const Params = Object.freeze({
  IMAGE_PATH: '/image.jpg',
  DITHER_SCALE: 2,
  DITHER_SPEED: 1,
});

export function sketch(context: p5) {
  let sourceMachine: ImageMachine;
  let sourceWidget: ImageWidget;

  let resultMachine: ImageMachine;
  let resultWidget: ImageWidget;

  context.preload = function () {
    sourceMachine = ImageMachine.create({
      image: context.loadImage(Params.IMAGE_PATH),
      scale: Params.DITHER_SCALE,
    });

    resultMachine = ImageMachine.create({
      image: context.loadImage(Params.IMAGE_PATH),
      scale: Params.DITHER_SCALE,
    });
  }

  context.setup = function () {
    context.createCanvas(
      context.windowWidth,
      context.windowHeight,
      context.P2D,
    );
    context.pixelDensity(1);

    sourceMachine.setSpeed(
      sourceMachine.image.width * Params.DITHER_SPEED
    );

    sourceWidget = new ImageWidget(context).also(it => {
      it.machine = sourceMachine;
      it.origin = Point.zero();
    });

    resultMachine.setSpeed(
      resultMachine.image.width * Params.DITHER_SPEED
    );

    resultWidget = new ImageWidget(context).also(it => {
      it.machine = resultMachine;
      it.origin = sourceWidget.origin.with({
        x: sourceMachine.image.width,
      });
    });
  };

  context.draw = function () {
    sourceMachine.load();
    sourceWidget.draw();

    resultMachine.load();
    resultWidget.draw();

    if (!resultMachine.hasNext) {
      context.noLoop();
      return;
    }

    resultMachine.dither();
    resultMachine.update();
  }
}
