import p5 from 'p5';
import { Widget } from '../../lib/process';
import { ApplicationModel, ParticleModel, WallModel } from './model';

export class WallWidget extends Widget<WallModel> {

  protected doDraw(model: WallModel) {
    this.scope($ => {
      $.stroke(model.color);
      $.line(model.p1.x, model.p1.y, model.p2.x, model.p2.y);
    });
  }
}

export class ParticleWidget extends Widget<ParticleModel> {

  protected doDraw(model: ParticleModel) {
    super.doDraw(model);

    this.scope($ => {
      $.fill(model.color);
      $.stroke(model.rayColor);

      $.rect(model.left, model.top, model.width, model.height);

      model.points.forEach(point => {
        $.line(model.center.x, model.center.y, point.position.x, point.position.y);
      });
    });
  }
}

export class ApplicationWidget extends Widget<ApplicationModel> {

  private _wall: WallWidget;
  private _particle: ParticleWidget;

  constructor(context: p5) {
    super(context);
    this._wall = new WallWidget(context);
    this._particle = new ParticleWidget(context);
  }

  protected doDraw(model: ApplicationModel) {
    model.walls.forEach(it => {
      this._wall.model = it;
      this._wall.draw();
    });

    this._particle.model = model.particle;
    this._particle.draw();
  }
}
