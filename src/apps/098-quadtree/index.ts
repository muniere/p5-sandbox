import p5 from 'p5';
import { Arrays } from '../../lib/stdlib';
import { Point, Rect, Size } from '../../lib/graphics2d';
import { Force, Position } from '../../lib/physics2d';
import { MaterialState, WorldState } from './model';
import { WorldWidget } from './view';

const Params = Object.freeze({
  CANVAS_COLOR: '#FFFFFF',
  DIVISION_CAPACITY: 2,
  MATERIAL_COUNT: 100,
  MATERIAL_RADIUS: 10,
});

export function sketch(context: p5) {
  let state: WorldState;
  let widget: WorldWidget;

  context.setup = function () {
    context.createCanvas(
      context.windowWidth,
      context.windowHeight,
      context.P2D,
    );

    const size = Math.min(context.width, context.height);

    state = WorldState.create({
      boundary: Rect.of({
        origin: Point.zero(),
        size: Size.square(size),
      }),
      capacity: Params.DIVISION_CAPACITY,
    });

    widget = new WorldWidget(context).also(it => {
      it.state = state;
      it.fillColor = undefined;
      it.strokeColor = '#888888';
    });

    Arrays.sequence(Params.MATERIAL_COUNT).forEach(() => {
      const center = Position.of({
        x: Math.random() * size,
        y: Math.random() * size,
      });

      const force = Force.of({
        x: Math.random(),
        y: Math.random(),
      });

      const material = MaterialState.create({
        radius: Params.MATERIAL_RADIUS,
        center: center
      }).also(it => {
        it.applyForce(force);
      });

      state.push(material);
    });
  }

  context.draw = function () {
    // canvas
    context.background(Params.CANVAS_COLOR);

    // widget
    widget.draw();

    // update
    state.update();
    console.log(context.frameRate());
  }
}
