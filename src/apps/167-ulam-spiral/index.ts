import p5 from 'p5';
import { Spot } from '../../lib/dmath';
import { Size } from '../../lib/graphics2d';
import { ApplicationModel, Direction, PieceModel } from './model';
import { ApplicationWidget, PieceCircleStyle, PriceCircleMode } from './view';

const Params = Object.freeze({
  CANVAS_COLOR: '#222222',
  PIECE_COLOR: '#FFFFFF',
  SPIRAL_SIZE: 99,
  CONNECTING: false,
  BATCH_MODE: false,
});

export function sketch(context: p5) {
  let model: ApplicationModel;
  let widget: ApplicationWidget;

  context.setup = function () {
    const size = Math.min(context.windowWidth, context.windowHeight);

    context.createCanvas(size, size, context.P2D);
    context.background(Params.CANVAS_COLOR);

    model = new ApplicationModel({
      piece: new PieceModel({
        spot: Spot.of({
          row: Math.floor(Params.SPIRAL_SIZE / 2),
          column: Math.floor(Params.SPIRAL_SIZE / 2),
        }),
        direction: Direction.east,
      })
    });

    widget = new ApplicationWidget(context).also(it => {
      it.model = model;
      it.connection = Params.CONNECTING;
      it.style = new PieceCircleStyle({
        radius: 2,
        mode: PriceCircleMode.prime,
      });
      it.boxSize = Size.square(size / Params.SPIRAL_SIZE);
      it.color = Params.PIECE_COLOR;
    });
  };

  context.draw = function () {
    if (Params.BATCH_MODE) {
      while (model.stepCounter <= Params.SPIRAL_SIZE * Params.SPIRAL_SIZE) {
        widget.draw();
        model.update();
      }
    } else {
      widget.draw();
      model.update();
    }

    if (model.stepCounter > Params.SPIRAL_SIZE * Params.SPIRAL_SIZE) {
      context.noLoop();
    }
  }
}
