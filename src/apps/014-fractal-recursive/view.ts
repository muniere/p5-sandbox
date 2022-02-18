import * as p5 from 'p5';
import { Context } from '../../lib/process';

export class TreeWidget {
  public angle: number = Math.PI / 4;

  constructor(
    public readonly context: p5,
    public readonly stem: number,
    public readonly scale: number,
    public readonly limit: number,
  ) {
    // no-op
  }

  static create({context, stem, scale, limit}: {
    context: p5,
    stem: number,
    scale: number,
    limit: number
  }): TreeWidget {
    return new TreeWidget(context, stem, scale, limit);
  }

  draw() {
    this._draw(this.stem)
  }

  private _draw(length: number) {
    Context.scope(this.context, $ => {
      $.line(0, 0, 0, -length);
      $.translate(0, -length);
    });

    if (length < this.limit) {
      return;
    }

    Context.scope(this.context, $ => {
      $.rotate(this.angle);
      this._draw(length * this.scale);
    });

    Context.scope(this.context, $ => {
      $.rotate(-this.angle);
      this._draw(length * this.scale);
    });
  }
}
