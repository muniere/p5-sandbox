// https://www.youtube.com/watch?v=jxGS3fKPKJA
import * as p5 from 'p5';
import { Arrays } from '../../lib/stdlib';
import { Colors } from '../../lib/drawing';
import { Point, Size } from '../../lib/graphics2d';
import { ApplicationModel, CellModel } from './model';
import { ApplicationWidget } from './view';

const Params = Object.freeze({
  CANVAS_COLOR: '#333333',
  CELL_RADIUS: 50,
  CELL_GROWTH: 1.01,
  CELL_COUNT: 10,
});

export function sketch(context: p5) {
  let model: ApplicationModel;
  let widget: ApplicationWidget;

  context.setup = function () {
    context.createCanvas(
      context.windowWidth,
      context.windowHeight,
      context.P2D,
    );

    model = new ApplicationModel({
      bounds: Size.of(context),
      cells: Arrays.generate(Params.CELL_COUNT, () => {
        return new CellModel({
          center: Point.of({
            x: context.width * Math.random(),
            y: context.height * Math.random()
          }),
          radius: Params.CELL_RADIUS,
          growth: Params.CELL_GROWTH,
          limit: Params.CELL_RADIUS,
        }).also(it => {
          it.fillColor = Colors.sample({alpha: 128});
        });
      }),
    });

    widget = new ApplicationWidget(context).also(it => {
      it.model = model;
    });
  }

  context.draw = function () {
    // canvas
    context.background(Params.CANVAS_COLOR);

    // widget
    widget.draw();

    // update
    model.update();
  }

  context.mouseClicked = function () {
    const point = Point.of({
      x: context.mouseX,
      y: context.mouseY,
    });

    const index = model.findIndex(point);
    if (index >= 0) {
      model.split(index);
    }
  }
}
