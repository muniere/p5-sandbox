import { Widget } from '../../../lib/process';
import { Rect } from '../../../lib/graphics2d';
import { PathModel, ProgressModel } from './model';

export class PathWidget extends Widget<PathModel> {
  public color: string = '#FFFFFF';
  public weight: number = 1;

  protected doDraw(model: PathModel) {
    // nodes
    this.scope($ => {
      $.stroke(this.color);
      $.fill(this.color);

      model.points.forEach(
        it => this.context.ellipse(it.x, it.y, 8)
      );
    });

    // edges
    this.scope($ => {
      $.stroke(this.color);
      $.strokeWeight(this.weight);
      $.noFill();

      this.shape('open', $$ => {
        model.points.forEach(
          it => $$.vertex(it.x, it.y)
        );
      });
    });
  }
}

export class ProgressWidget extends Widget<ProgressModel> {
  private integerFormat = Intl.NumberFormat([]);
  private fractionFormat = Intl.NumberFormat([], {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });

  public frame: Rect = Rect.zero();
  public textSize: number = 20;
  public textColor: string = '#FFFFFF';

  protected doDraw(model: ProgressModel) {
    this.scope($ => {
      $.push();
      $.noStroke();
      $.fill(this.textColor);
      $.textAlign($.RIGHT, $.TOP)
      $.textSize(this.textSize);
      $.text(
        this.format(model),
        this.frame.left, this.frame.top,
        this.frame.right, this.frame.bottom,
      );
      $.pop();
    });
  }

  private format(model: ProgressModel): string {
    const currentLabel = this.integerFormat.format(model.current);
    const totalLabel = this.integerFormat.format(model.total);
    const percentLabel = this.fractionFormat.format(100 * model.current / model.total)

    return `${currentLabel} / ${totalLabel}\n(${percentLabel}%)`;
  }
}
