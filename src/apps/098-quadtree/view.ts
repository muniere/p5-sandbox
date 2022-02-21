import p5 from 'p5';
import { Context } from '../../lib/process';
import { BallState, BallTag, DivisionState, TreeState, WorldState } from './model';

export class MaterialWidget {
  public state: BallState | undefined;

  constructor(
    public readonly context: p5,
  ) {
    // no-op
  }

  draw() {
    const state = this.state;
    if (!state) {
      return;
    }

    Context.scope(this.context, $ => {
      switch (state.tag) {
        case BallTag.normal:
          state.fillColor ? $.fill(state.fillColor) : $.noFill();
          state.strokeColor ? $.stroke(state.strokeColor) : $.noStroke();
          break;

        case BallTag.focused:
          $.fill('#ff1111');
          $.noStroke();
          break;
      }

      $.circle(state.center.x, state.center.y, state.radius * 2);
    });
  }
}

export class DivisionWidget {
  public state: DivisionState | undefined;
  public fillColor: string | undefined;
  public strokeColor: string | undefined;

  private _material: MaterialWidget;

  constructor(
    public readonly context: p5,
  ) {
    this._material = new MaterialWidget(context);
  }

  draw() {
    const state = this.state;
    if (!state) {
      return;
    }

    if (this.strokeColor || this.fillColor) {
      Context.scope(this.context, $ => {
        const boundary = state.boundary;

        this.strokeColor ? $.stroke(this.strokeColor) : $.noStroke();
        this.fillColor ? $.fill(this.fillColor) : $.noFill();
        $.rect(boundary.left, boundary.top, boundary.width, boundary.height);
      });
    }

    state.materials.forEach(it => {
      this._material.state = it;
      this._material.draw();
    })
  }
}

export class TreeWidget {
  public state: TreeState | undefined;

  private _division: DivisionWidget;

  constructor(
    public readonly context: p5,
  ) {
    this._division = new DivisionWidget(context);
  }

  set fillColor(value: string | undefined) {
    this._division.fillColor = value;
  }

  set strokeColor(value: string | undefined) {
    this._division.strokeColor = value;
  }

  also(mutate: (widget: TreeWidget) => void): TreeWidget {
    mutate(this);
    return this;
  }

  draw() {
    const state = this.state;
    if (!state) {
      return;
    }

    state.walkWidely(it => {
      this._division.state = it;
      this._division.draw();
    });
  }
}

export class WorldWidget {
  public state: WorldState | undefined;

  private _tree: TreeWidget;

  constructor(
    public readonly context: p5,
  ) {
    this._tree = new TreeWidget(context);
  }

  set fillColor(value: string | undefined) {
    this._tree.fillColor = value;
  }

  set strokeColor(value: string | undefined) {
    this._tree.strokeColor = value;
  }

  also(mutate: (widget: WorldWidget) => void): WorldWidget {
    mutate(this);
    return this;
  }

  draw() {
    const state = this.state;
    if (!state) {
      return;
    }

    this._tree.also(it => {
      it.state = state.tree;
      it.draw();
    });
  }
}
