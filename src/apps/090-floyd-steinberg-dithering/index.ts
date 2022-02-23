// https://www.youtube.com/watch?v=0L2n8Tg2FwI
import p5, { Image } from 'p5';
import { DebugManager } from '../../lib/process';
import { ApplicationModel, ImageProcessModel } from './model';
import { ApplicationWidget } from './view';

const Params = Object.freeze({
  IMAGE_PATH: '/image.jpg',
  DITHER_SCALE: 2,
  DITHER_SPEED: 1,
});

export function sketch(context: p5) {
  let model: ApplicationModel;
  let widget: ApplicationWidget;

  let source: Image;
  let result: Image;

  context.preload = function () {
    source = context.loadImage(Params.IMAGE_PATH);
    result = context.loadImage(Params.IMAGE_PATH);
  }

  context.setup = function () {
    context.createCanvas(
      context.windowWidth,
      context.windowHeight,
      context.P2D,
    );
    context.pixelDensity(1);

    model = new ApplicationModel({
      source: new ImageProcessModel({
        image: source,
        scale: Params.DITHER_SCALE,
      }).also(it => {
        it.speed = source.width * Params.DITHER_SPEED;
      }),
      result: new ImageProcessModel({
        image: result,
        scale: Params.DITHER_SCALE,
      }).also(it => {
        it.speed = result.width * Params.DITHER_SPEED;
      }),
    });

    widget = new ApplicationWidget(context).also(it => {
      it.model = model;
    });

    DebugManager.attach(context);
  };

  context.draw = function () {
    model.refresh();

    widget.draw();

    if (!model.hasNext) {
      context.noLoop();
      return;
    }

    model.update();
  }
}
