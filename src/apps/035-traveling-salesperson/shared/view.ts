import * as p5 from 'p5';
import { Point, Rect, Size } from '../../../lib/graphics2d';
import { PathState, ProgressState } from './model';

export class PathWidget {
  public color: string = '#FFFFFF';
  public weight: number = 1;

  constructor(
    public readonly context: p5,
    public readonly state: PathState,
  ) {
    // no-op
  }

  private get points(): Point[] {
    return this.state.points;
  }

  draw() {
    this.drawNodes();
    this.drawEdges();
  }

  private drawNodes() {
    this.context.push();

    this.context.stroke(this.color);
    this.context.fill(this.color);

    this.points.forEach(
      it => this.context.ellipse(it.x, it.y, 8)
    );

    this.context.pop();
  }

  private drawEdges() {
    this.context.push();

    this.context.stroke(this.color);
    this.context.strokeWeight(this.weight);
    this.context.noFill();

    this.context.beginShape();
    this.points.forEach(
      it => this.context.vertex(it.x, it.y)
    );
    this.context.endShape();

    this.context.pop();
  }
}

export class ProgressWidget {
  private integerFormat = Intl.NumberFormat([]);
  private fractionFormat = Intl.NumberFormat([], {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });

  public textSize: number = 20;
  public textColor: string = '#FFFFFF';

  public state: ProgressState | undefined;

  constructor(
    public context: p5,
    public frame: Rect,
  ) {
    // no-op
  }

  static create({context, origin, size}: {
    context: p5,
    origin: Point,
    size: Size,
  }): ProgressWidget {
    return new ProgressWidget(context, Rect.of({origin, size}));
  }

  draw() {
    if (!this.state) {
      return;
    }

    this.context.push();
    this.context.noStroke();
    this.context.fill(this.textColor);
    this.context.textAlign(this.context.RIGHT, this.context.TOP)
    this.context.textSize(this.textSize);
    this.context.text(
      this.format(this.state),
      this.frame.left, this.frame.top,
      this.frame.right, this.frame.bottom,
    );
    this.context.pop();
  }

  private format(state: ProgressState): string {
    const currentLabel = this.integerFormat.format(state.current);
    const totalLabel = this.integerFormat.format(state.total);
    const percentLabel = this.fractionFormat.format(100 * state.current / state.total)

    return `${currentLabel} / ${totalLabel}\n(${percentLabel}%)`;
  }
}
