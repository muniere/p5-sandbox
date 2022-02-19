import p5 from 'p5';
import { ApplicationModel } from './model';
import { Context } from '../../lib/process';

export class ApplicationWidget {
  public pointRadius: number = 2;
  public pointColor: string = '#FFFFFF';
  public lineColor: string = '#FFFFFF';
  public model: ApplicationModel | undefined;

  constructor(
    public readonly context: p5,
  ) {
    // no-op
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

    const start = model.map(0.0);
    const end = model.map(1.0);

    Context.scope(this.context, $ => {
      $.fill(this.pointColor);
      model.points.forEach(it => {
        $.circle(
          it.x * this.context.width,
          it.y * this.context.height,
          this.pointRadius * 2,
        );
      });
    });

    Context.scope(this.context, $ => {
      $.stroke(this.lineColor);
      $.line(
        start.x * this.context.width,
        start.y * this.context.height,
        end.x * this.context.width,
        end.y * this.context.height,
      );
    });
  }
}
