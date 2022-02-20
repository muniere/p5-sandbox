import p5 from 'p5';
import { Widget } from '../../lib/process';
import { ApplicationModel, CubeModel, SpongeModel } from './model';

export class CubeWidget extends Widget {
  public model: CubeModel | undefined;

  draw() {
    const model = this.model;
    if (!model) {
      return;
    }

    this.scope($ => {
      $.translate(model.center.x, model.center.y, model.center.z);
      $.fill(model.color);
      $.box(model.size);
    });
  }
}

export class SpongeWidget extends Widget {
  public model: SpongeModel | undefined;

  private _cube: CubeWidget;

  constructor(context: p5) {
    super(context);
    this._cube = new CubeWidget(context);
  }

  draw() {
    const model = this.model;
    if (!model) {
      return;
    }

    this.scope($ => {
      $.rotateX(model.rotation);
      $.rotateY(model.rotation * 0.5)
      $.rotateZ(model.rotation * 0.2)

      $.stroke(model.strokeColor)

      model.cubes.forEach(it => {
        this._cube.model = it;
        this._cube.draw();
      });
    });
  }
}

export class ApplicationWidget extends Widget {
  public model: ApplicationModel | undefined;

  private _sponge: SpongeWidget;

  constructor(context: p5) {
    super(context);
    this._sponge = new SpongeWidget(context);
  }

  draw() {
    const model = this.model;
    if (!model) {
      return;
    }

    this._sponge.model = model.sponge;
    this._sponge.draw();
  }
}
