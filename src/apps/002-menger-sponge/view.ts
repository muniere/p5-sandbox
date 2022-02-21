import p5 from 'p5';
import { Widget } from '../../lib/process';
import { ApplicationModel, CubeModel, SpongeModel } from './model';

export class CubeWidget extends Widget<CubeModel> {

  protected doDraw(model: CubeModel) {
    this.scope($ => {
      $.translate(model.center.x, model.center.y, model.center.z);
      $.fill(model.color);
      $.box(model.size);
    });
  }
}

export class SpongeWidget extends Widget<SpongeModel> {
  private _cube: CubeWidget;

  constructor(context: p5) {
    super(context);
    this._cube = new CubeWidget(context);
  }

  protected doDraw(model: SpongeModel) {
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

export class ApplicationWidget extends Widget<ApplicationModel> {
  private _sponge: SpongeWidget;

  constructor(context: p5) {
    super(context);
    this._sponge = new SpongeWidget(context);
  }

  protected doDraw(model: ApplicationModel) {
    this._sponge.model = model.sponge;
    this._sponge.draw();
  }
}
