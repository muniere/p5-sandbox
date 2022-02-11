import * as p5 from 'p5';
import { DisplayState, SegmentState } from './model';

export class SegmentWidget {
  constructor(
    public readonly context: p5,
    public readonly state: SegmentState,
  ) {
    // no-op
  }

  draw() {
    switch (this.state.orientation) {
      case 'horizontal':
        this.drawHorizontal();
        return;
      case 'vertical':
        this.drawVertical();
        return;
    }
  }

  private drawHorizontal() {
    const context = this.context;
    const cap = this.state.weight / 2;

    const left = this.state.origin.x;
    const right = left + this.state.length;

    const top = this.state.origin.y;
    const middle = top + this.state.weight / 2;
    const bottom = top + this.state.weight;


    if (this.state.on) {
      context.fill(this.state.color);
    } else {
      context.noFill();
    }

    context.stroke(this.state.color);

    context.beginShape();
    context.vertex(left, middle);
    context.vertex(left + cap, top);
    context.vertex(right - cap, top);
    context.vertex(right, middle);
    context.vertex(right - cap, bottom);
    context.vertex(left + cap, bottom);
    context.endShape(context.CLOSE);
  }

  private drawVertical() {
    const context = this.context;
    const cap = this.state.weight / 2;

    const left = this.state.origin.x;
    const center = left + this.state.weight / 2;
    const right = left + this.state.weight;

    const top = this.state.origin.y;
    const bottom = top + this.state.length;

    context.stroke(this.state.color);

    if (this.state.on) {
      context.fill(this.state.color);
    } else {
      context.noFill();
    }

    context.beginShape();
    context.vertex(center, top);
    context.vertex(right, top + cap);
    context.vertex(right, bottom - cap);
    context.vertex(center, bottom);
    context.vertex(left, bottom - cap);
    context.vertex(left, top + cap);
    context.endShape(context.CLOSE);
  }
}

export class DisplayWidget {
  private readonly children: SegmentWidget[];

  constructor(
    public readonly context: p5,
    public readonly state: DisplayState,
  ) {
    this.children = state.segments.map(
      it => new SegmentWidget(context, it)
    );
  }

  draw() {
    this.context.push();
    this.context.translate(this.state.origin.x, this.state.origin.y);
    this.children.forEach(it => it.draw());
    this.context.pop();
  }
}
