import p5 from 'p5';
import { Context } from '../../lib/process';
import { Numeric } from '../../lib/stdlib';
import { CircularMaterial, Material, RectangularMaterial } from '../../lib/physics2d';
import { ApplicationModel, FireworkModel } from './model';

export class ParticleWidget {
  public model: Material | undefined;
  public alpha: number = -1;

  constructor(
    public readonly context: p5,
  ) {
    // no-op
  }

  draw() {
    const model = this.model;
    if (!model) {
      return;
    }

    const alphaRange = Numeric.range(0, 255);

    const alphaSuffix = this.alpha >= 0
      ? Math.floor(alphaRange.coerce(this.alpha)).toString(16).padStart(2, '0')
      : null;

    Context.scope(this.context, $ => {
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

export class FireworkWidget {
  public model: FireworkModel | undefined;

  private readonly _particle: ParticleWidget;

  constructor(
    public readonly context: p5,
  ) {
    this._particle = new ParticleWidget(context);
  }

  also(mutate: (widget: FireworkWidget) => void): FireworkWidget {
    mutate(this);
    return this;
  }

  draw() {
    const model = this.model;
    if (!model) {
      return;
    }
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

export class ApplicationWidget {
  public model: ApplicationModel | undefined;

  private readonly _firework: FireworkWidget;

  constructor(
    public readonly context: p5,
  ) {
    this._firework = new FireworkWidget(context);
  }

  also(mutate: (widget: ApplicationWidget) => void): ApplicationWidget {
    mutate(this);
    return this;
  }

  draw() {
    const model = this.model;
    if (!model) {
      return;
    }

    model.fireworks.forEach(it => {
      this._firework.model = it;
      this._firework.draw();
    });
  }
}
