import { Widget } from '../../lib/process';
import { ApplicationModel } from './model';

export class ApplicationWidget extends Widget<ApplicationModel> {
  public pointRadius: number = 2;
  public pointColor: string = '#FFFFFF';
  public lineColor: string = '#FFFFFF';

  protected doDraw(model: ApplicationModel) {
    const start = model.map(0.0);
    const end = model.map(1.0);

    this.scope($ => {
      $.fill(this.pointColor);
      model.points.forEach(it => {
        $.circle(
          it.x * $.width,
          it.y * $.height,
          this.pointRadius * 2,
        );
      });
    });

    this.scope($ => {
      $.stroke(this.lineColor);
      $.line(
        start.x * $.width,
        start.y * $.height,
        end.x * $.width,
        end.y * $.height,
      );
    });
  }
}
