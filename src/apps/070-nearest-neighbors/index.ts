// https://www.youtube.com/watch?v=N8Fabn1om2k
import * as p5 from 'p5';
import { DataSetSchema } from './storage';
import { Evaluation, Solver, WorldState } from './model';
import { SelectWidget, WorldWidget } from './view';

const Params = Object.freeze({
  CANVAS_COLOR: '#333333',
  DATA_SOURCE: 'data.json',
  NEIGHBOR_COUNT: 5,
});

export function sketch(context: p5) {
  let solver: Solver;
  let state: WorldState;
  let widget: WorldWidget;

  context.preload = function () {
    context.loadJSON(Params.DATA_SOURCE, (rawValue: DataSetSchema) => {
      solver = Solver.create({
        evaluations: rawValue.users.map(it => Evaluation.decode(it))
      });
    })
  }

  context.setup = function () {
    context.noCanvas();

    state = WorldState.create({
      solver: solver,
    });
    state.limit = Params.NEIGHBOR_COUNT;

    widget = new WorldWidget(context, state);

    [
      new SelectWidget(context).also(it => {
        it.label = 'I';
        it.onChanged = (ev) => state.persona.I = parseInt(ev.target.value);
      }),
      new SelectWidget(context).also(it => {
        it.label = 'II';
        it.onChanged = (ev) => state.persona.II = parseInt(ev.target.value);
      }),
      new SelectWidget(context).also(it => {
        it.label = 'III';
        it.onChanged = (ev) => state.persona.III = parseInt(ev.target.value);
      }),
      new SelectWidget(context).also(it => {
        it.label = 'IV';
        it.onChanged = (ev) => state.persona.IV = parseInt(ev.target.value);
      }),
      new SelectWidget(context).also(it => {
        it.label = 'V';
        it.onChanged = (ev) => state.persona.V = parseInt(ev.target.value);
      }),
      new SelectWidget(context).also(it => {
        it.label = 'VI';
        it.onChanged = (ev) => state.persona.VI = parseInt(ev.target.value);
      }),
      new SelectWidget(context).also(it => {
        it.label = 'VII';
        it.onChanged = (ev) => state.persona.VII = parseInt(ev.target.value);
      }),
      new SelectWidget(context).also(it => {
        it.label = 'Rogue1';
        it.onChanged = (ev) => state.persona.Rogue1 = parseInt(ev.target.value);
      }),
      new SelectWidget(context).also(it => {
        it.label = 'Holiday';
        it.onChanged = (ev) => state.persona.Holiday = parseInt(ev.target.value);
      }),
    ].forEach(it => {
      it.render();
    });

    context.createButton('submit').mousePressed(() => {
      widget.render();
    });
  }
}
