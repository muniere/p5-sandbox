import p5 from 'p5';
import { Widget } from '../../lib/process';
import { ApplicationModel, VehicleModel } from './model';

export class VehicleWidget extends Widget {
  public model: VehicleModel | undefined;

  draw() {
    const model = this.model;
    if (!model) {
      return;
    }
    this.scope($ => {
      if (model.fillColor) {
        $.fill(model.fillColor);
      }
      if (model.strokeColor) {
        $.stroke(model.strokeColor);
      }

      $.circle(model.center.x, model.center.y, model.radius * 2);
    });
  }
}

export class ApplicationWidget extends Widget {
  public model: ApplicationModel | undefined;

  private readonly _vehicle: VehicleWidget;

  constructor(context: p5) {
    super(context);
    this._vehicle = new VehicleWidget(context);
  }

  draw() {
    const model = this.model;
    if (!model) {
      return;
    }

    model.vehicles.forEach(it => {
      this._vehicle.model = it;
      this._vehicle.draw();
    });
  }
}
