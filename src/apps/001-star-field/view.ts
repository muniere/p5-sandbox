import p5 from 'p5';
import { Widget } from '../../lib/process';
import { Numeric } from '../../lib/stdlib';
import { ApplicationModel, StarFieldModel, StarModel } from './model';

export class StarWidget extends Widget {
  public model: StarModel | undefined;

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

    this.scope($ => {
      $.fill(255);
      $.noStroke();
      $.ellipse(currentX, currentY, currentRadius, currentRadius);

      $.stroke(255, 64);
      $.line(originX, originY, currentX, currentY);
    })
  }
}

export class StarFieldWidget extends Widget {
  public model: StarFieldModel | undefined;

  private _star: StarWidget;

  constructor(context: p5) {
    super(context);
    this._star = new StarWidget(context);
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

export class ApplicationWidget extends Widget {
  public model: ApplicationModel | undefined;

  private _starField: StarFieldWidget;

  constructor(context: p5) {
    super(context);
    this._starField = new StarFieldWidget(context);
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
