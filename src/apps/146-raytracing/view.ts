import p5 from 'p5';
import { NumberRange, NumberRangeMap } from '../../lib/stdlib';
import { Widget } from '../../lib/process';
import { Size } from '../../lib/graphics2d';
import { ApplicationModel, ObjectivePerspectiveModel, ParticleModel, SubjectivePerspectiveModel, WallModel } from './model';

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

    const scene = model.scene;
    if (scene) {
      this.scope($ => {
        $.stroke(model.rayColor);

        scene.fragments.compactMap(it => it.position).forEach(point => {
          $.line(model.center.x, model.center.y, point.x, point.y);
        });
      });
    }

    this.scope($ => {
      $.fill(model.color);
      $.noStroke();
      $.rectMode($.CENTER);
      $.translate(model.center.x, model.center.y);
      $.rotate(model.heading);
      $.rect(0, 0, model.width, model.height);

      $.fill('#FF0000');
      $.circle(model.width / 2, 0, 8);
    });

  }
}

export class ObjectivePerspectiveWidget extends Widget<ObjectivePerspectiveModel> {

  private _wall: WallWidget;
  private _particle: ParticleWidget;

  constructor(context: p5) {
    super(context);
    this._wall = new WallWidget(context);
    this._particle = new ParticleWidget(context);
  }

  protected doDraw(model: ObjectivePerspectiveModel) {
    const frame = model.frame;

    this.scope($ => {
      $.translate(frame.left, frame.top);

      model.walls.forEach(it => {
        this._wall.model = it;
        this._wall.draw();
      });

      this._particle.model = model.particle;
      this._particle.draw();
    })
  }
}

export class SubjectivePerspectiveWidget extends Widget<SubjectivePerspectiveModel> {

  protected doDraw(model: SubjectivePerspectiveModel) {
    const scene = model.particle.scene;
    if (!scene) {
      return;
    }

    const viewFrame = model.frame;

    const fragmentSize = new Size({
      width: viewFrame.width / scene.fragments.length,
      height: viewFrame.height,
    });

    const brightnessMap = new NumberRangeMap({
      domain: new NumberRange(0, Math.pow(viewFrame.width, 2)),
      target: new NumberRange(255, 0),
    });
    const heightMap = new NumberRangeMap({
      domain: new NumberRange(0, viewFrame.width),
      target: new NumberRange(viewFrame.height, 0),
    });

    this.scope($ => {
      $.translate(viewFrame.left, viewFrame.top);

      scene.fragments.forEach((it, i) => {
        const x = i * fragmentSize.width;
        const gray = brightnessMap.apply(Math.pow(it.distance, 2));
        const height = heightMap.apply(it.distance);
        $.noStroke();
        $.fill(gray);
        $.rect(x, fragmentSize.height - height, Math.ceil(fragmentSize.width), height);
      })
    });
  }
}

export class ApplicationWidget extends Widget<ApplicationModel> {

  private _objective: ObjectivePerspectiveWidget;
  private _subjective: SubjectivePerspectiveWidget;

  constructor(context: p5,) {
    super(context);
    this._objective = new ObjectivePerspectiveWidget(context);
    this._subjective = new SubjectivePerspectiveWidget(context);
  }

  protected doDraw(model: ApplicationModel) {
    this._objective.model = model.objective;
    this._objective.draw();

    this._subjective.model = model.subjective;
    this._subjective.draw();
  }
}
