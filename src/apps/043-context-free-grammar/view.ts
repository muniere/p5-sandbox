import * as p5 from 'p5';
import { Point, Size } from '../../lib/graphics2d';
import { Machine } from './model';

export class BoxListWidget {
  public values: string[] = [];

  constructor(
    public readonly context: p5,
    public readonly origin: Point,
    public readonly boxSize: Size,
  ) {
    // no-op
  }

  static create({context, origin, itemSize}: {
    context: p5,
    origin: Point,
    itemSize: Size,
  }): BoxListWidget {
    return new BoxListWidget(context, origin, itemSize);
  }

  draw() {
    const context = this.context;

    context.push();

    context.stroke(0);
    context.textAlign(context.CENTER);
    context.textStyle(context.NORMAL);

    context.translate(this.origin.x, this.origin.y);

    if (this.values.length > 0) {
      let origin = new p5.Vector();
      let size = this.boxSize;

      this.values.forEach((value) => {
        context.rect(origin.x, origin.y, size.width, size.height);
        context.text(value, origin.x + size.width / 2, origin.y + size.height / 2 + 5);

        origin = origin.copy().add(size.width);

        if (origin.x + size.width > context.width) {
          origin = origin.copy().set(0, origin.y + size.height);
        }
      });

    } else {
      const origin = new p5.Vector();
      const size = this.boxSize;

      // @ts-ignore
      context.drawingContext.setLineDash([5, 5]);
      context.rect(origin.x, origin.y, size.width, size.height);
      context.text('φ', origin.x + size.width / 2, origin.y + size.height / 2 + 5);
    }


    context.pop();
  }
}

export class MachineWidget {
  private stackWidget: BoxListWidget;
  private listWidget: BoxListWidget;

  constructor(
    public readonly context: p5,
    public readonly machine: Machine,
  ) {
    this.stackWidget = BoxListWidget.create({
      context: context,
      origin: Point.of({x: 10, y: 25}),
      itemSize: Size.of({width: 50, height: 50}),
    });

    this.listWidget = BoxListWidget.create({
      context: context,
      origin: Point.of({x: 10, y: 105}),
      itemSize: Size.of({width: 50, height: 50}),
    });
    // no-op
  }

  draw() {
    this.context.text(`Stack (${this.machine.stack.length})`, 10, 20);

    this.stackWidget.values = this.machine.stack;
    this.stackWidget.draw();

    this.context.text(`Result (${this.machine.result.length})`, 10, 100);

    this.listWidget.values = this.machine.result;
    this.listWidget.draw();
  }
}