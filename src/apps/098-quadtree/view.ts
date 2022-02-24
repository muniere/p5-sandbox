import p5 from 'p5';
import { Widget } from '../../lib/process';
import { ApplicationModel, DivisionModel, TreeModel, VehicleModel, VehicleTag } from './model';

export class VehicleWidget extends Widget<VehicleModel> {

  protected doDraw(model: VehicleModel) {
    this.scope($ => {
      switch (model.tag) {
        case VehicleTag.normal:
          model.fillColor ? $.fill(model.fillColor) : $.noFill();
          model.strokeColor ? $.stroke(model.strokeColor) : $.noStroke();
          break;

        case VehicleTag.focused:
          $.fill('#ff1111');
          $.noStroke();
          break;
      }

      $.circle(model.center.x, model.center.y, model.radius * 2);
    });
  }
}

export class DivisionWidget extends Widget<DivisionModel> {
  public fillColor: string | undefined;
  public strokeColor: string | undefined;

  private _material: VehicleWidget;

  constructor(context: p5) {
    super(context);
    this._material = new VehicleWidget(context);
  }

  protected doDraw(model: DivisionModel) {
    if (this.strokeColor || this.fillColor) {
      this.scope($ => {
        const boundary = model.boundary;

        this.strokeColor ? $.stroke(this.strokeColor) : $.noStroke();
        this.fillColor ? $.fill(this.fillColor) : $.noFill();
        $.rect(boundary.left, boundary.top, boundary.width, boundary.height);
      });
    }

    model.materials.forEach(it => {
      this._material.model = it;
      this._material.draw();
    })
  }
}

export class TreeWidget extends Widget<TreeModel> {
  private _division: DivisionWidget;

  constructor(context: p5) {
    super(context);
    this._division = new DivisionWidget(context);
  }

  set fillColor(value: string | undefined) {
    this._division.fillColor = value;
  }

  set strokeColor(value: string | undefined) {
    this._division.strokeColor = value;
  }


  protected doDraw(model: TreeModel) {
    model.walkWidely(it => {
      this._division.model = it;
      this._division.draw();
    });
  }
}

export class ApplicationWidget extends Widget<ApplicationModel> {
  private _tree: TreeWidget;

  constructor(context: p5) {
    super(context);
    this._tree = new TreeWidget(context);
  }

  set fillColor(value: string | undefined) {
    this._tree.fillColor = value;
  }

  set strokeColor(value: string | undefined) {
    this._tree.strokeColor = value;
  }


  protected doDraw(model: ApplicationModel) {
    this._tree.model = model.tree;
    this._tree.draw();
  }
}
