import * as p5 from 'p5';
import { Point, Rect } from '../../lib/graphics2d';
import { GameType, ProgressState, SimulationState } from './model';

export class SimulationWidget {
  public state: SimulationState | undefined;
  public frame: Rect = Rect.zero();

  public scaleX: number = 1;
  public scaleY: number = 1;
  public axisWeight: number = 1;
  public axisColor: string = '#FFFFFF';
  public pointRadius: number = 1;
  public pointColor: string = '#FFFFFF';
  public strokeWeight: number = 1;
  public strokeColor: string = '#FFFFFF';

  constructor(
    public context: p5,
  ) {
    // no-op
  }

  map<T>(callback: (widget: SimulationWidget) => T): T{
    return callback(this);
  }

  also(mutate: (widget: SimulationWidget) => void): SimulationWidget {
    mutate(this);
    return this;
  }

  draw() {
    const base = Point.of({
      x: this.frame.origin.x,
      y: this.frame.origin.y + this.frame.size.height / 2,
    });

    this.context.push();

    // axis
    this.context.stroke(this.axisColor);
    this.context.strokeWeight(this.axisWeight);
    this.context.noFill();

    this.context.line(
      this.frame.left, this.frame.top,
      this.frame.left, this.frame.bottom
    );
    this.context.line(
      this.frame.left, base.y,
      this.frame.right, base.y,
    );

    const simulation = this.state;
    if (!simulation) {
      this.context.pop();
      return;
    }

    const points = simulation.history.map(
      (value, i) => Point.of({
        x: base.x + i * this.scaleX,
        y: base.y - value * this.scaleY,
      })
    );

    // stroke
    this.context.stroke(this.strokeColor);
    this.context.strokeWeight(this.strokeWeight);
    this.context.noFill();

    this.context.beginShape();
    points.forEach(it => this.context.vertex(it.x, it.y));
    this.context.endShape();

    // points
    this.context.noStroke();
    this.context.fill(this.pointColor);
    points.forEach(it => this.context.circle(it.x, it.y, this.pointRadius * 2));

    this.context.pop();
  }
}

export class ProgressWidget {
  public state: ProgressState | undefined;
  public frame: Rect = Rect.zero();

  public textSize: number = 20;
  public textColor: string = '#FFFFFF';

  private countFormat = Intl.NumberFormat([]);
  private currencyFormat = Intl.NumberFormat([], {
    style: 'currency',
    currency: 'USD',
  });

  constructor(
    public readonly context: p5,
  ) {
    // no-op
  }

  also(mutate: (widget: ProgressWidget) => void): ProgressWidget {
    mutate(this);
    return this;
  }

  draw() {
    const state = this.state;
    if (!state) {
      return;
    }

    this.context.push();
    this.context.noStroke();
    this.context.fill(this.textColor);
    this.context.textAlign(this.context.LEFT, this.context.TOP)
    this.context.textSize(this.textSize);
    this.context.text(
      this.format(state),
      this.frame.left, this.frame.top,
      this.frame.right, this.frame.bottom,
    );
    this.context.pop();
  }

  private format(state: ProgressState): string {
    return [
      `Game: ${GameType[state.type]}`,
      `Trial: ${this.countFormat.format(state.count)}`,
      `Amount: ${this.currencyFormat.format(state.amount)}`,
    ].join('\n');
  }
}
