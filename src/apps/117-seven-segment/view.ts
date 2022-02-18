import * as p5 from 'p5';
import { Context } from '../../lib/process';
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
    const cap = this.state.weight / 2;

    const left = this.state.origin.x;
    const right = left + this.state.length;

    const top = this.state.origin.y;
    const middle = top + this.state.weight / 2;
    const bottom = top + this.state.weight;

    Context.scope(this.context, $ => {
      if (this.state.on) {
        $.fill(this.state.color);
      } else {
        $.noFill();
      }

      $.stroke(this.state.color);

      Context.shape($, 'closed', $$ => {
        $$.vertex(left, middle);
        $$.vertex(left + cap, top);
        $$.vertex(right - cap, top);
        $$.vertex(right, middle);
        $$.vertex(right - cap, bottom);
        $$.vertex(left + cap, bottom);
      });
    });
  }

  private drawVertical() {
    const cap = this.state.weight / 2;

    const left = this.state.origin.x;
    const center = left + this.state.weight / 2;
    const right = left + this.state.weight;

    const top = this.state.origin.y;
    const bottom = top + this.state.length;

    Context.scope(this.context, $ => {
      if (this.state.on) {
        $.fill(this.state.color);
      } else {
        $.noFill();
      }

      $.stroke(this.state.color);

      Context.shape($, 'closed', $$ => {
        $$.beginShape();
        $$.vertex(center, top);
        $$.vertex(right, top + cap);
        $$.vertex(right, bottom - cap);
        $$.vertex(center, bottom);
        $$.vertex(left, bottom - cap);
        $$.vertex(left, top + cap);
        $$.endShape($$.CLOSE);
      });
    });
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
    Context.scope(this.context, $ => {
      $.translate(
        this.state.origin.x,
        this.state.origin.y,
      );
      this.children.forEach(it => it.draw());
    });
  }
}
