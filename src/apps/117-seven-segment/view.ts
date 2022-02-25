import * as p5 from 'p5';
import { Widget } from '../../lib/process';
import { DisplayModel, Orientation, SegmentModel } from './model';

export class SegmentWidget extends Widget<SegmentModel> {

  protected doDraw(model: SegmentModel) {
    switch (model.orientation) {
      case Orientation.horizontal:
        this.drawHorizontal(model);
        return;
      case Orientation.vertical:
        this.drawVertical(model);
        return;
    }
  }

  private drawHorizontal(model: SegmentModel) {
    const cap = model.weight / 2;

    const left = model.origin.x;
    const right = left + model.length;

    const top = model.origin.y;
    const middle = top + model.weight / 2;
    const bottom = top + model.weight;

    this.scope($ => {
      model.on ? $.fill(model.color) : $.noFill();

      $.stroke(model.color);

      this.shape('closed', $$ => {
        $$.vertex(left, middle);
        $$.vertex(left + cap, top);
        $$.vertex(right - cap, top);
        $$.vertex(right, middle);
        $$.vertex(right - cap, bottom);
        $$.vertex(left + cap, bottom);
      });
    });
  }

  private drawVertical(model: SegmentModel) {
    const cap = model.weight / 2;

    const left = model.origin.x;
    const center = left + model.weight / 2;
    const right = left + model.weight;

    const top = model.origin.y;
    const bottom = top + model.length;

    this.scope($ => {
      model.on ? $.fill(model.color) : $.noFill();

      $.stroke(model.color);

      this.shape('closed', $$ => {
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

export class DisplayWidget extends Widget<DisplayModel> {
  private readonly _segment: SegmentWidget;

  constructor(context: p5) {
    super(context);
    this._segment = new SegmentWidget(context);
  }

  protected doDraw(model: DisplayModel) {
    this.scope($ => {
      $.translate(model.origin.x, model.origin.y);

      model.segments.forEach(it => {
        this._segment.model = it;
        this._segment.draw();
      })
    });
  }
}
