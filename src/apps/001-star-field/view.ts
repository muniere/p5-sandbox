import p5 from 'p5';
import { Context } from '../../lib/process';
import { Numeric } from '../../lib/stdlib';
import { ApplicationModel, StarFieldModel, StarModel } from './model';

class StarWidget {
  public model: StarModel | undefined;

  constructor(
    public readonly context: p5,
  ) {
    // no-op
  }

  also(mutate: (widget: StarWidget) => void): StarWidget {
    mutate(this);
    return this;
  }

  draw(): void {
    const model = this.model;
    if (!model) {
      return;
    }

    const currentX = Numeric.map({
      value: model.center.x / model.center.z,
      domain: Numeric.range(0, 1),
      target: Numeric.range(0, this.context.width)
    });

    const currentY = Numeric.map({
      value: model.center.y / model.center.z,
      domain: Numeric.range(0, 1),
      target: Numeric.range(0, this.context.height)
    });

    const currentRadius = Numeric.map({
      value: model.center.z,
      domain: Numeric.range(this.context.width, 0),
      target: Numeric.range(0, model.radius)
    });

    const originX = Numeric.map({
      value: model.center.x / model.origin.z,
      domain: Numeric.range(0, 1),
      target: Numeric.range(0, this.context.width),
    });

    const originY = Numeric.map({
      value: model.center.y / model.origin.z,
      domain: Numeric.range(0, 1),
      target: Numeric.range(0, this.context.height)
    });

    Context.scope(this.context, $ => {
      $.fill(255);
      $.noStroke();
      $.ellipse(currentX, currentY, currentRadius, currentRadius);

      $.stroke(255, 64);
      $.line(originX, originY, currentX, currentY);
    })
  }
}

export class StarFieldWidget {
  public model: StarFieldModel | undefined;

  private _star: StarWidget;

  constructor(
    public readonly context: p5,
  ) {
    this._star = new StarWidget(context);
  }

  also(mutate: (widget: StarFieldWidget) => void): StarFieldWidget {
    mutate(this);
    return this;
  }

  draw() {
    const model = this.model;
    if (!model) {
      return;
    }

    this.context.translate(
      this.context.width / 2,
      this.context.height / 2,
    );

    model.stars.forEach(it => {
      this._star.model = it;
      this._star.draw();
    });
  }
}

export class ApplicationWidget {
  public model: ApplicationModel | undefined;

  private _starField: StarFieldWidget;

  constructor(
    public readonly context: p5,
  ) {
    this._starField = new StarFieldWidget(context);
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

    this._starField.model = model.starField;
    this._starField.draw();
  }
}
