import * as p5 from 'p5';
import { Context } from '../../lib/process';
import { CubeModel, SpongeModel } from './model';

export class CubeWidget {
  public model: CubeModel | undefined;

  constructor(
    public readonly context: p5,
  ) {
    // no-op
  }

  also(mutate: (widget: CubeWidget) => void): CubeWidget {
    mutate(this);
    return this;
  }

  draw() {
    const model = this.model;
    if (!model) {
      return;
    }

    Context.scope(this.context, $ => {
      $.translate(model.center.x, model.center.y, model.center.z);
      $.fill(model.color);
      $.box(model.size);
    });
  }
}

export class SpongeWidget {
  public model: SpongeModel | undefined;

  private _cube: CubeWidget;

  constructor(
    private readonly context: p5,
  ) {
    this._cube = new CubeWidget(context);
  }

  also(mutate: (widget: SpongeWidget) => void): SpongeWidget {
    mutate(this);
    return this;
  }

  draw() {
    const model = this.model;
    if (!model) {
      return;
    }

    Context.scope(this.context, $ => {
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
