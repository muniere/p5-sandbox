import { Widget } from '../../lib/process';
import { Point, Rect, Size } from '../../lib/graphics2d';
import { RuleType, SimulationModel } from './model';

export class SimulationWidget extends Widget<SimulationModel> {
  public frame: Rect = Rect.zero();
  public padding: Size = Size.zero();

  public scaleX: number = 1;
  public scaleY: number = 1;
  public axisWeight: number = 1;
  public axisColor: string = '#FFFFFF';
  public pointRadius: number = 1;
  public pointColor: string = '#FFFFFF';
  public strokeWeight: number = 1;
  public strokeColor: string = '#FFFFFF';
  public textSize: number = 20;
  public textColor: string = '#FFFFFF';

  private countFormat = Intl.NumberFormat([]);
  private valueFormat = Intl.NumberFormat([]);

  draw() {
    const base = Point.of({
      x: this.frame.origin.x,
      y: this.frame.origin.y + this.frame.size.height / 2,
    });

    // axis
    this.scope($ => {
      $.stroke(this.axisColor);
      $.strokeWeight(this.axisWeight);
      $.noFill();

      $.line(
        this.frame.left, this.frame.top,
        this.frame.left, this.frame.bottom
      );
      $.line(
        this.frame.left, base.y,
        this.frame.right, base.y,
      );
    });

    const model = this.model;
    if (!model) {
      return;
    }

    const points = model.history.map(
      (value, i) => Point.of({
        x: base.x + i * this.scaleX,
        y: base.y - value * this.scaleY,
      })
    );

    // stroke
    this.scope($ => {
      $.stroke(this.strokeColor);
      $.strokeWeight(this.strokeWeight);
      $.noFill();

      this.shape('open', $$ => {
        points.forEach(it => $$.vertex(it.x, it.y));
      });
    });

    // points
    this.scope($ => {
      $.noStroke();
      $.fill(this.pointColor);
      points.forEach(it => {
        $.circle(it.x, it.y, this.pointRadius * 2);
      });
    });

    // label
    this.scope($ => {
      const top = this.frame.top + this.padding.height;
      const left = this.frame.left + this.padding.width;
      $.noStroke();
      $.fill(this.textColor);
      $.textAlign($.LEFT, $.TOP)
      $.textSize(this.textSize);
      $.text(this.format(model), left, top);
    });
  }

  private format(model: SimulationModel): string {
    return [
      `Game: ${RuleType[model.type]}`,
      `Trial: ${this.countFormat.format(model.statistic.count)}`,
      `Value: ${this.valueFormat.format(model.statistic.value)}`,
    ].join('\n');
  }
}
