import p5, { Vector } from 'p5';

export type ShapeStyle = 'open' | 'closed';

export class Context {
  public constructor(
    public readonly context: p5,
  ) {
    // no-op
  }

  static scope<T>(context: p5, callback: (context: p5) => T) {
    context.push();
    const result = callback(context);
    context.pop();
    return result;
  }

  static shape(context: p5, style: ShapeStyle, callback: (context: p5) => void) {
    context.beginShape();

    callback(context);

    switch (style) {
      case 'open':
        context.endShape();
        break;
      case 'closed':
        context.endShape(context.CLOSE);
        break;
    }
  }
}

export class Widget {
  public constructor(
    public readonly context: p5,
  ) {
    //no-op
  }

  draw(): void {
    // do nothing; must be overridden by subclasses
  }

  scope<T>(callback: (context: p5) => T): T {
    return Context.scope(this.context, callback);
  }

  shape(style: ShapeStyle, callback: (context: p5) => void) {
    Context.shape(this.context, style, callback);
  }

  also(mutate: (widget: this) => void): this {
    mutate(this);
    return this;
  }
}

export namespace Vectors {

  export function of(nargs: {
    x?: number,
    y?: number,
    z?: number,
  }) : Vector {
    return new Vector().set(nargs.x, nargs.y, nargs.z);
  }
}
