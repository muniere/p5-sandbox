import p5 from 'p5';
import { Widget } from '../../lib/process';
import { Point, Size } from '../../lib/graphics2d';
import { Machine } from './model';

export class BoxListWidget extends Widget<string[]> {
  public origin: Point = Point.zero();
  public boxSize: Size = Size.zero();

  protected doDraw(model: string[]) {
    this.scope($ => {
      $.stroke(0);
      $.textAlign($.CENTER);
      $.textStyle($.NORMAL);

      $.translate(this.origin.x, this.origin.y);

      if (model.length > 0) {
        let origin = new p5.Vector();
        let size = this.boxSize;

        model.forEach((char) => {
          $.rect(origin.x, origin.y, size.width, size.height);
          $.text(char, origin.x + size.width / 2, origin.y + size.height / 2 + 5);

          origin = origin.copy().add(size.width);

          if (origin.x + size.width > $.width) {
            origin = origin.copy().set(0, origin.y + size.height);
          }
        });

      } else {
        const origin = new p5.Vector();
        const size = this.boxSize;

        // @ts-ignore
        $.drawingContext.setLineDash([5, 5]);
        $.rect(origin.x, origin.y, size.width, size.height);
        $.text('φ', origin.x + size.width / 2, origin.y + size.height / 2 + 5);
      }
    });
  }
}

export class MachineWidget extends Widget<Machine> {
  private _stack: BoxListWidget;
  private _list: BoxListWidget;

  constructor(context: p5) {
    super(context);

    this._stack = new BoxListWidget(context).also(it => {
      it.origin = Point.of({x: 10, y: 25});
      it.boxSize = Size.of({width: 50, height: 50});
    });

    this._list = new BoxListWidget(context).also(it => {
      it.origin = Point.of({x: 10, y: 105});
      it.boxSize = Size.of({width: 50, height: 50});
    });
  }

  protected doDraw(model: Machine) {
    this.scope($ => {
      $.text(`Stack (${model.stack.length})`, 10, 20);

      this._stack.model = model.stack;
      this._stack.draw();

      $.text(`Result (${model.result.length})`, 10, 100);

      this._list.model = model.result;
      this._list.draw();
    });
  }
}
