import p5 from 'p5';

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
