import * as p5 from 'p5';
import { Point } from '../../../lib/graphics2d';
import { Complex } from '../../../lib/cmath';
import * as data from '../shared/data';
import { ChainState, CircleState, Clock, PathState } from '../shared/model';
import { RealWorldState } from './model';
import { RealWorldWidget } from './view';

const Params = Object.freeze({
  CANVAS_COLOR: '#222222',
  SHAPE_COLOR: '#FFFFFF',
  ORIGIN_X: 50,
  ORIGIN_Y: 50,
  MARGIN_X: 300,
  MARGIN_Y: 300,
  AMPLITUDE: 200,
});

// x-y plan edition; with combinations of real numbers
// noinspection JSUnusedLocalSymbols
export function sketch(context: p5) {
  let state: RealWorldState;
  let widget: RealWorldWidget;

  context.setup = function () {
    context.createCanvas(
      context.windowWidth,
      context.windowHeight,
      context.P2D,
    );

    const points = data.path
      .filter((it, i) => i % 10 == 0)
      .map((it) => Point.of(it));

    const origin = Point.of({
      x: Params.ORIGIN_X,
      y: Params.ORIGIN_Y,
    });

    state = RealWorldState.create({
      clock: Clock.create({
        context: context,
        speed: (2 * Math.PI) / points.length,
      }),
      xChain: ChainState.create({
        center: origin.plus({x: Params.MARGIN_X}),
        values: points.map(it => Complex.re(it.x)),
        decorate: (circle: CircleState) => {
          circle.color = Params.SHAPE_COLOR;
        }
      }),
      yChain: ChainState.create({
        center: origin.plus({y: Params.MARGIN_Y}),
        values: points.map(it => Complex.re(it.y)),
        decorate: (circle: CircleState) => {
          circle.color = Params.SHAPE_COLOR;
        }
      }),
      path: PathState.create({
        plots: [],
      }).also(it => {
        it.color = Params.SHAPE_COLOR;
        it.maxLength = Math.floor(points.length * 0.8);
      })
    });

    widget = new RealWorldWidget(context).also(it => {
      it.state = state;
      it.origin = origin;
      it.xChain.also(it => {
        it.trackWeight = .5;
        it.handWeight = .5;
        it.pointRadius = 0;
      });
      it.yChain.also(it => {
        it.trackWeight = .5;
        it.handWeight = .5;
        it.pointRadius = 0;
      });
      it.xLine.also(it => {
        it.weight = .5;
        it.color = Params.SHAPE_COLOR;
      });
      it.yLine.also(it => {
        it.weight = .5;
        it.color = Params.SHAPE_COLOR;
      });
    });
  }

  context.draw = function () {
    // canvas
    context.background(Params.CANVAS_COLOR);

    // widget
    widget.draw();

    // update
    state.update();
  }

  context.mouseClicked = function () {
    if (context.isLooping()) {
      context.noLoop();
    } else {
      context.loop();
    }
  }
}
