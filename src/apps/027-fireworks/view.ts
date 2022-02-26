import p5 from 'p5';
import { Widget } from '../../lib/process';
import { NumberRange } from '../../lib/stdlib';
import { CircularMaterial, Material, RectangularMaterial } from '../../lib/physics2d';
import { ApplicationModel, FireworkModel } from './model';

export class ParticleWidget extends Widget<Material> {
  public alpha: number = -1;

  protected doDraw(model: Material) {
    const alphaRange = new NumberRange(0, 255);

    const alphaSuffix = this.alpha >= 0
      ? Math.floor(alphaRange.coerce(this.alpha)).toString(16).padStart(2, '0')
      : null;

    this.scope($ => {
      if (model.fillColor && alphaSuffix) {
        $.fill(model.fillColor.slice(0, 7) + alphaSuffix);
      } else if (model.fillColor) {
        $.fill(model.fillColor);
      } else {
        $.noFill();
      }

      if (model.strokeColor && alphaSuffix) {
        $.stroke(model.strokeColor.slice(0, 7) + alphaSuffix);
      } else if (model.strokeColor) {
        $.stroke(model.strokeColor);
      } else {
        $.noStroke();
      }

      if (model instanceof CircularMaterial) {
        $.circle(model.center.x, model.center.y, model.radius * 2);
      }
      if (model instanceof RectangularMaterial) {
        $.rect(model.left, model.top, model.width, model.height);
      }
    });
  }
}

export class FireworkWidget extends Widget<FireworkModel> {
  private readonly _particle: ParticleWidget;

  constructor(context: p5) {
    super(context);
    this._particle = new ParticleWidget(context);
  }

  protected doDraw(model: FireworkModel) {
    if (!model.active) {
      return;
    }

    const alpha = model.remaining * 255;

    model.particles.forEach(it => {
      this._particle.model = it;
      this._particle.alpha = alpha
      this._particle.draw();
    });
  }
}

export class ApplicationWidget extends Widget<ApplicationModel> {
  private readonly _firework: FireworkWidget;

  constructor(context: p5) {
    super(context);
    this._firework = new FireworkWidget(context);
  }

  protected doDraw(model: ApplicationModel) {
    model.fireworks.forEach(it => {
      this._firework.model = it;
      this._firework.draw();
    });
  }
}
