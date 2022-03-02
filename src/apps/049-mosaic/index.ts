import p5, { Image } from 'p5';
import { BrightnessFunction, MosaicImageModel, MosaicProcessModel } from './model';

const Params = Object.freeze({
  SCALE_FACTOR: 8,
  PATCH_VARIETY: 256,
  RENDER_INTERVAL: 10,
});

export function sketch(context: p5) {
  let model: MosaicProcessModel;
  let source: Image;
  let mosaic: MosaicImageModel | undefined;
  let running: boolean;

  context.preload = function () {
    model = new MosaicProcessModel({
      context: context,
      evaluate: new BrightnessFunction(context)
    });

    source = context.loadImage('photo.jpg');
  }

  context.setup = function () {
    context.createCanvas(
      context.windowWidth,
      context.windowHeight,
      context.P2D,
    );

    context.noLoop();

    context.loadJSON(`patch/index.json`, (filenames: string[]) => {
      filenames.shuffled().slice(0, Params.PATCH_VARIETY).forEach(name => {
        context.loadImage(`patch/${name}`, (image) => {
          const patch = context.createImage(
            Params.SCALE_FACTOR,
            Params.SCALE_FACTOR,
          );

          patch.copy(
            image,
            0, 0, image.width, image.height,
            0, 0, patch.width, patch.height,
          );

          model.append(patch);

          if (running) {
            return;
          }

          const interval = model.patches.length % Params.RENDER_INTERVAL == 0;
          const finished = model.patches.length >= filenames.length;

          if (!interval && !finished) {
            return;
          }

          running = true;

          mosaic = model.convert({
            image: source,
            scale: Params.SCALE_FACTOR,
          });

          context.redraw();
        });
      });
    });
  }

  context.draw = function () {
    source.loadPixels();

    context.image(source, 0, 0);

    if (!mosaic) {
      return;
    }

    for (let row = 0; row < mosaic.height; row++) {
      for (let column = 0; column < mosaic.width; column++) {
        const patch = mosaic.get({row, column});
        const x = column * Params.SCALE_FACTOR;
        const y = row * Params.SCALE_FACTOR;
        context.image(patch.image, x, y);
      }
    }

    mosaic = undefined;
    running = false;
  }
}
