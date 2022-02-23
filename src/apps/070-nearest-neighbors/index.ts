// https://www.youtube.com/watch?v=N8Fabn1om2k
import p5 from 'p5';
import { DataSetSchema } from './storage';
import { ApplicationModel, EvaluationModel, SolverModel } from './model';
import { ApplicationWidget, SelectWidget } from './view';

const Params = Object.freeze({
  CANVAS_COLOR: '#333333',
  DATA_SOURCE: 'data.json',
  NEIGHBOR_COUNT: 5,
});

export function sketch(context: p5) {
  let model: ApplicationModel;
  let widget: ApplicationWidget;
  let dataSet: DataSetSchema;

  context.preload = function () {
    dataSet = context.loadJSON(Params.DATA_SOURCE) as DataSetSchema;
  }

  context.setup = function () {
    context.noCanvas();

    model = new ApplicationModel({
      solver: new SolverModel({
        evaluations: dataSet.users.map(it => EvaluationModel.decode(it))
      }),
    }).also(it => {
      it.limit = Params.NEIGHBOR_COUNT;
    });

    widget = new ApplicationWidget(context).also(it => {
      it.model = model;
    });

    [
      new SelectWidget(context).also(it => {
        it.label = 'I';
        it.onChanged = (ev) => model.persona.I = parseInt(ev.target.value);
      }),
      new SelectWidget(context).also(it => {
        it.label = 'II';
        it.onChanged = (ev) => model.persona.II = parseInt(ev.target.value);
      }),
      new SelectWidget(context).also(it => {
        it.label = 'III';
        it.onChanged = (ev) => model.persona.III = parseInt(ev.target.value);
      }),
      new SelectWidget(context).also(it => {
        it.label = 'IV';
        it.onChanged = (ev) => model.persona.IV = parseInt(ev.target.value);
      }),
      new SelectWidget(context).also(it => {
        it.label = 'V';
        it.onChanged = (ev) => model.persona.V = parseInt(ev.target.value);
      }),
      new SelectWidget(context).also(it => {
        it.label = 'VI';
        it.onChanged = (ev) => model.persona.VI = parseInt(ev.target.value);
      }),
      new SelectWidget(context).also(it => {
        it.label = 'VII';
        it.onChanged = (ev) => model.persona.VII = parseInt(ev.target.value);
      }),
      new SelectWidget(context).also(it => {
        it.label = 'Rogue1';
        it.onChanged = (ev) => model.persona.Rogue1 = parseInt(ev.target.value);
      }),
      new SelectWidget(context).also(it => {
        it.label = 'Holiday';
        it.onChanged = (ev) => model.persona.Holiday = parseInt(ev.target.value);
      }),
    ].forEach(it => {
      it.render();
    });

    context.createButton('submit').mousePressed(() => {
      widget.render();
    });
  }
}
