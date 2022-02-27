import { Point } from '../../../lib/graphics2d';
import { FrameClock, Vectors } from '../../../lib/process';
import { NumberRange, Numeric } from '../../../lib/stdlib';

export interface Connectable {
  readonly reference: Point;
  readonly children: LinkModel[];

  connect(nargs: { length: number, angle: number }): LinkModel
}

export class AnchorModel implements Connectable {
  public radius: number = 0;
  public color: string = '#FFFFFF';
  public phase: number = 0;

  private readonly _point: Point;
  private readonly _children: LinkModel[];

  constructor(nargs: {
    point: Point,
  }) {
    this._point = nargs.point.copy();
    this._children = [];
  }

  also(mutate: (model: AnchorModel) => void): AnchorModel {
    mutate(this);
    return this;
  }

  get point(): Point {
    return this._point;
  }

  //
  // Connectable
  //
  get reference(): Point {
    return this._point;
  }

  get children(): LinkModel [] {
    return [...this._children];
  }

  connect(nargs: { length: number, angle: number }): LinkModel {
    const child = new LinkModel({...nargs, parent: this});
    this._children.push(child);
    return child;
  }
}

export class LeadModel {
  public start: Point;
  public stop: Point;

  constructor(nargs: {
    start: Point,
    stop: Point,
  }) {
    this.start = nargs.start;
    this.stop = nargs.stop;
  }

  heading(): number {
    const vector = Vectors.create({
      x: this.stop.x - this.start.x,
      y: this.stop.y - this.start.y,
    });

    return vector.heading();
  }
}

export class LinkModel implements Connectable {
  public weight: number = 0;
  public color: string = '#FFFFFF';
  public phase: number = 0;
  public angleRange = new NumberRange(-Math.PI / 4, +Math.PI / 4);

  // stored
  private readonly _length: number;
  private readonly _parent: Connectable;
  private readonly _children: LinkModel[];

  private _angle: number;

  // computed
  private _lead: LeadModel;

  constructor(nargs: {
    length: number,
    angle: number,
    parent: Connectable,
  }) {
    this._length = nargs.length;
    this._angle = nargs.angle;
    this._parent = nargs.parent;
    this._children = [];
    this._lead = new LeadModel({
      start: Point.zero(),
      stop: Point.zero(),
    });

    this.layout();
  }

  also(mutate: (model: LinkModel) => void): LinkModel {
    mutate(this);
    return this;
  }

  layout() {
    const baseAngle = (() => {
      if (this._parent instanceof LinkModel) {
        return this._parent.lead.heading();
      }
      if (this._parent instanceof AnchorModel) {
        return this._parent.phase;
      }
      return 0;
    })();

    const globalAngle = baseAngle + this._angle + this.phase;

    this._lead = new LeadModel({
      start: this._parent.reference,
      stop: this._parent.reference.plus({
        x: this._length * Math.cos(globalAngle),
        y: this._length * Math.sin(globalAngle),
      })
    });

    this._children.forEach(it => it.layout());
  }

  get length(): number {
    return this._length;
  }

  get lead(): LeadModel {
    return this._lead;
  }

  set angle(value: number) {
    this._angle = this.angleRange.coerce(value);
    this.layout();
  }

  lerp(amount: number) {
    this._angle = this.angleRange.lerp(amount);
    this.layout();
  }

  rotate(value: number) {
    this._angle = this.angleRange.coerce(this._angle + value);
    this.layout();
  }

  //
  // Connectable
  //
  get children(): LinkModel[] {
    return this._children;
  }

  get reference(): Point {
    return this._lead.stop;
  }

  connect(nargs: {
    length: number,
    angle: number,
  }): LinkModel {
    const child = new LinkModel({...nargs, parent: this});
    this._children.push(child);
    return child;
  }
}

export class ChainModel implements Connectable {
  private readonly _anchor: AnchorModel;

  constructor(nargs: {
    anchor: Point
  }) {
    this._anchor = new AnchorModel({
      point: nargs.anchor,
    });
  }

  get anchor(): AnchorModel {
    return this._anchor;
  }

  also(mutate: (model: ChainModel) => void): ChainModel {
    mutate(this);
    return this;
  }

  walkDeeply(callback: (link: LinkModel) => void) {
    const stack = this._anchor.children;

    while (stack.length) {
      const link = stack.shift()!;

      callback(link);

      stack.unshift(...link.children);
    }
  }

  walkWidely(callback: (link: LinkModel) => void) {
    const queue = this._anchor.children;

    while (queue.length) {
      const link = queue.shift()!;

      callback(link);

      queue.push(...link.children);
    }
  }

  rotate(value: number) {
    this._anchor.children.forEach(it => it.rotate(value));
  }

  layout() {
    this._anchor.children.forEach(it => it.layout());
  }

  //
  // Connectable
  //
  get reference(): Point {
    return this.head().reference;
  }

  get children(): LinkModel[] {
    return this.head().children;
  }

  connect(nargs: { length: number; angle: number }): LinkModel {
    return this.head().connect(nargs);
  }

  private head(): Connectable {
    let cursor = this._anchor as Connectable;
    while (cursor.children.length) {
      cursor = cursor.children.first();
    }
    return cursor;
  }
}

export class ApplicationModel {

  private readonly _chain: ChainModel;
  private readonly _clock: FrameClock;

  constructor(nargs: {
    chain: ChainModel,
    clock: FrameClock,
  }) {
    this._chain = nargs.chain;
    this._clock = nargs.clock;
  }

  get chain(): ChainModel {
    return this._chain;
  }

  connect(nargs: { length: number; angle: number }): LinkModel {
    return this._chain.connect(nargs);
  }

  update() {
    const amount = Numeric.map({
      value: Math.sin(this._clock.time()),
      domain: new NumberRange(-1, 1),
      target: new NumberRange(0, 1),
    });

    this._chain.walkWidely(it => it.lerp(amount));
  }
}
