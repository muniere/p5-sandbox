// https://www.youtube.com/watch?v=MlRlgbrAVOs
import * as p5 from 'p5';

const Params = Object.freeze({
  CANVAS_COLOR: '#CCCCCC',
  SEGMENT_COLOR: '#000000',
  SEGMENT_WEIGHT: 20,
});

type Orientation = 'horizontal' | 'vertical';

class Segment {
  public on: boolean = false;

  constructor(
    public orientation: Orientation,
    public origin: p5.Vector,
    public length: number,
    public weight: number,
    public color: string,
  ) {
    // no-op
  }

  static horizontal({origin, length, weight, color}: {
    origin: p5.Vector,
    length: number,
    weight?: number,
    color?: string,
  }): Segment {
    return new Segment('horizontal', origin, length, weight ?? Params.SEGMENT_WEIGHT, color ?? Params.SEGMENT_COLOR);
  }

  static vertical({origin, length, weight, color}: {
    origin: p5.Vector,
    length: number,
    weight?: number,
    color?: string,
  }): Segment {
    return new Segment('vertical', origin, length, weight ?? Params.SEGMENT_WEIGHT, color ?? Params.SEGMENT_COLOR);
  }

  draw(context: p5) {
    switch (this.orientation) {
      case 'horizontal':
        this.drawHorizontal(context);
        return;
      case 'vertical':
        this.drawVertical(context);
        return;
    }
  }

  private drawHorizontal(context: p5) {
    const cap = this.weight / 2;

    const left = this.origin.x;
    const right = left + this.length;

    const top = this.origin.y;
    const middle = top + this.weight / 2;
    const bottom = top + this.weight;


    if (this.on) {
      context.fill(this.color);
    } else {
      context.noFill();
    }

    context.stroke(this.color);

    context.beginShape();
    context.vertex(left, middle);
    context.vertex(left + cap, top);
    context.vertex(right - cap, top);
    context.vertex(right, middle);
    context.vertex(right - cap, bottom);
    context.vertex(left + cap, bottom);
    context.endShape(context.CLOSE);
  }

  private drawVertical(context: p5) {
    const cap = this.weight / 2;

    const left = this.origin.x;
    const center = left + this.weight / 2;
    const right = left + this.weight;

    const top = this.origin.y;
    const bottom = top + this.length;

    context.stroke(this.color);

    if (this.on) {
      context.fill(this.color);
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

class Display {
  private segments: Segment[];

  constructor(
    public origin: p5.Vector,
    public width: number,
    public height: number,
    public weight: number,
    public color: string,
  ) {
    this.segments = [
      Segment.horizontal({
        origin: new p5.Vector().add(weight / 2, 0),
        length: width - weight,
        weight: weight,
        color: color,
      }),
      Segment.vertical({
        origin: new p5.Vector().add(width - weight, weight / 2),
        length: (height - weight) / 2,
        weight: weight,
        color: color,
      }),
      Segment.vertical({
        origin: new p5.Vector().add(width - weight, height / 2),
        length: (height - weight) / 2,
        weight: weight,
        color: color,
      }),
      Segment.horizontal({
        origin: new p5.Vector().add(weight / 2, height - weight),
        length: width - weight,
        weight: weight,
        color: color,
      }),
      Segment.vertical({
        origin: new p5.Vector().add(0, height / 2),
        length: (height - weight) / 2,
        weight: weight,
        color: color,
      }),
      Segment.vertical({
        origin: new p5.Vector().add(0, weight / 2),
        length: (height - weight) / 2,
        weight: weight,
        color: color,
      }),
      Segment.horizontal({
        origin: new p5.Vector().add(weight / 2, (height - weight) / 2),
        length: width - weight,
        weight: weight,
        color: color,
      }),
    ];
  }

  static create({origin, width, height, weight, color}: {
    origin: p5.Vector,
    width: number,
    height: number,
    weight?: number,
    color?: string,
  }): Display {
    return new Display(origin, width, height, weight ?? Params.SEGMENT_WEIGHT, color ?? Params.SEGMENT_COLOR);
  }

  update(pattern: number) {
    for (let i = 1; i <= 7; i++) {
      const bit = pattern >> (7 - i) & 0x01;
      this.segments[i - 1].on = !!bit;
    }
  }

  draw(context: p5) {
    context.push();
    context.translate(this.origin);
    this.segments.forEach(it => it.draw(context));
    context.pop();
  }
}

function sketch(context: p5) {
  const patterns = new Map<string, number>([
    ['0', 0x7E],
    ['1', 0x30],
    ['2', 0x6D],
    ['3', 0x79],
    ['4', 0x33],
    ['5', 0x5B],
    ['6', 0x5F],
    ['7', 0x70],
    ['8', 0x7F],
    ['9', 0x7B],
    ['a', 0x77],
    ['b', 0x1F],
    ['c', 0x4E],
    ['d', 0x3D],
    ['e', 0x4F],
    ['f', 0x47],
  ]);

  let display: Display;

  context.setup = function () {
    const padding = 10;

    context.createCanvas(context.windowWidth, context.windowHeight);

    display = Display.create({
      origin: context.createVector(padding, padding),
      width: (context.height - padding * 2) / 2,
      height: context.height - padding * 2,
      weight: Params.SEGMENT_WEIGHT,
    });
  }

  context.draw = function () {
    context.background(Params.CANVAS_COLOR);
    display.draw(context);
    context.noLoop();
  }

  context.keyTyped = function () {
    const pattern = patterns.get(context.key.toLowerCase());
    if (!pattern) {
      return;
    }

    display.update(pattern);
    context.loop();
  }
}

export { sketch };
