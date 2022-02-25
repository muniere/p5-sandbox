import p5 from 'p5';
import { Widget } from '../../lib/process';
import { NumberRange, NumberRangeMap } from '../../lib/stdlib';
import { ApplicationModel, PathModel, VehicleModel } from './model';

export enum PathMode {
  discrete,
  continuous,
}

export class VehicleWidget extends Widget<VehicleModel> {
  public color: string = '#FFFFF';

  protected doDraw(model: VehicleModel) {
    this.scope($ => {
      $.fill(this.color);
      $.noStroke();

      $.circle(model.center.x, model.center.y, model.radius);
    });
  }
}

export class PathWidget extends Widget<PathModel> {
  public color: string = '#FFFFF';
  public mode: PathMode = PathMode.discrete;

  protected doDraw(model: PathModel) {
    // intermediate
    this.scope($ => {
      this.context.colorMode($.HSB, 360, 100, 100, 100);
      this.context.noFill();

      const hueMap = NumberRangeMap.of({
        domain: new NumberRange(model.points.first().x, model.points.last().x),
        target: new NumberRange(0, 360),
      });

      model.auxiliaries.forEach(it => {
        const p1 = it.start;
        const p2 = it.stop;
        const hue = hueMap.apply((p1.x + p2.x) / 2);
        const color = this.context.color(hue, 100, 100);
        $.stroke(color);
        $.line(p1.x, p1.y, p2.x, p2.y);
      });
    });

    // result
    this.scope($ => {
      $.stroke(this.color);
      $.noFill();

      switch (this.mode) {
        case PathMode.discrete:
          model.points.forEach(it => {
            $.point(it.x, it.y);
          });
          break;

        case PathMode.continuous:
          this.shape('open', $$ => {
            model.points.forEach(it => {
              $$.vertex(it.x, it.y);
            });
          });
          break;
      }
    });
  }
}

export class ApplicationWidget extends Widget<ApplicationModel> {
  private _point: VehicleWidget;
  private _bezier: PathWidget;

  constructor(context: p5) {
    super(context);
    this._point = new VehicleWidget(context);
    this._bezier = new PathWidget(context);
  }

  get mode(): PathMode {
    return this._bezier.mode;
  }

  set mode(value: PathMode) {
    this._bezier.mode = value;
  }

  protected doDraw(model: ApplicationModel) {
    this._bezier.model = model.bezier;
    this._bezier.draw();

    model.vehicles.forEach(point => {
      this._point.model = point;
      this._point.draw();
    });
  }
}
