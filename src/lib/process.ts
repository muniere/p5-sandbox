import p5, { Vector } from 'p5';

export type ShapeStyle = 'open' | 'closed';

export module Context {

  export function scope<T>(context: p5, callback: (context: p5) => T) {
    context.push();
    const result = callback(context);
    context.pop();
    return result;
  }

  export function shape(context: p5, style: ShapeStyle, callback: (context: p5) => void) {
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

export class FrameClock {
  private readonly _context: p5;
  private readonly _speed: number;

  public constructor(nargs: {
    context: p5,
    speed: number,
  }) {
    this._context = nargs.context;
    this._speed = nargs.speed;
  }

  time(): number {
    return this._context.frameCount * this._speed;
  }

  get speed(): number {
    return this._speed;
  }

  get frameCount(): number {
    return this._context.frameCount
  }
}

export class BaseWidget {
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

export class Widget<Model> extends BaseWidget {
  public model: Model | undefined;

  draw() {
    const model = this.model;
    if (!model) {
      return;
    }
    this.doDraw(model);
  }

  protected doDraw(model: Model) {
    // do nothing; must be overridden by subclasses
  }
}

export namespace Vectors {

  export function of(nargs: {
    x?: number,
    y?: number,
    z?: number,
  }): Vector {
    return new Vector().set(nargs.x, nargs.y, nargs.z);
  }
}

export class Alignment {
  public readonly x: number;
  public readonly y: number;

  static readonly TOP_LEFT = new Alignment({x: -1, y: -1});
  static readonly TOP_CENTER = new Alignment({x: 0, y: -1});
  static readonly TOP_RIGHT = new Alignment({x: 1, y: -1});
  static readonly CENTER_LEFT = new Alignment({x: -1, y: 0});
  static readonly CENTER = new Alignment({x: 0, y: 0});
  static readonly CENTER_RIGHT = new Alignment({x: 1, y: 0});
  static readonly BOTTOM_LEFT = new Alignment({x: -1, y: 1});
  static readonly BOTTOM_CENTER = new Alignment({x: 0, y: 1});
  static readonly BOTTOM_RIGHT = new Alignment({x: 1, y: 1});

  public constructor(nargs: {
    x: number,
    y: number,
  }) {
    this.x = nargs.x;
    this.y = nargs.y;
  }
}

export enum DebugField {
  FRAME_COUNT,
  FRAME_RATE,
  MOUSE,
  KEY,
}

export class DebugMetrics {
  public frameCount: number;
  public frameRate: number;
  public keyCode: number;
  public keyName: string;
  public mouseX: number;
  public mouseY: number;

  public constructor(nargs: {
    frameCount: number,
    frameRate: number,
    keyCode: number,
    keyName: string,
    mouseX: number,
    mouseY: number,
  }) {
    this.frameCount = nargs.frameCount
    this.frameRate = nargs.frameRate;
    this.keyCode = nargs.keyCode;
    this.keyName = nargs.keyName;
    this.mouseX = nargs.mouseX;
    this.mouseY = nargs.mouseY;
  }

  static parse(context: p5): DebugMetrics {
    const contextKeyName = (() => {
      switch (context.key) {
        case '':
          return 'NONE'
        case ' ':
          return 'SPACE'
        default:
          return context.key;
      }
    })();

    return new DebugMetrics({
      frameCount: context.frameCount,
      frameRate: context.frameRate(),
      keyCode: context.keyCode,
      keyName: contextKeyName,
      mouseX: context.mouseX,
      mouseY: context.mouseY,
    });
  }
}

export class DebugMetricsFormat {
  public fields: DebugField[] = [
    DebugField.FRAME_COUNT,
    DebugField.FRAME_RATE,
    DebugField.MOUSE,
    DebugField.KEY,
  ];

  private integerFormat = new Intl.NumberFormat([], {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });

  private floatFormat = new Intl.NumberFormat([], {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  });

  public format(metrics: DebugMetrics): string {
    const lines = this.fields.map(it => {
      switch (it) {
        case DebugField.FRAME_COUNT:
          return `Frame: ${this.integerFormat.format(metrics.frameCount)}`;

        case DebugField.FRAME_RATE:
          return `FPS: ${this.floatFormat.format(metrics.frameRate)}`;

        case DebugField.MOUSE:
          return `Mouse: (${metrics.mouseX}, ${metrics.mouseY})`;

        case DebugField.KEY:
          return `Key: ${metrics.keyName} [${metrics.keyCode}]`;
      }
    });

    return lines.join('\n');
  }
}

export class DebugMetricsWidget extends Widget<DebugMetrics> {
  public refreshRate: number = 10;
  public padding: number = 8;
  public alignment: Alignment = Alignment.TOP_LEFT;
  public textColor: string = '#FFFFFF'
  public textSize: number = 14;

  public get fields(): DebugField[] {
    return this._format.fields;
  }

  public set fields(value: DebugField[]) {
    this._format.fields = value;
  }

  private _format: DebugMetricsFormat;

  constructor(context: p5) {
    super(context);
    this._format = new DebugMetricsFormat();
  }

  public get horizAlign() {
    if (Math.abs(this.alignment.x) < 0.5) {
      return this.context.CENTER;
    }
    return this.alignment.x < 0
      ? this.context.LEFT
      : this.context.RIGHT;
  }

  public get vertAlign() {
    if (Math.abs(this.alignment.y) < 0.5) {
      return this.context.CENTER;
    }
    return this.alignment.y < 0
      ? this.context.TOP
      : this.context.BOTTOM;
  }

  public get x(): number {
    return this.context.width / 2 + (this.context.width / 2 - this.padding) * this.alignment.x;
  }

  public get y(): number {
    return this.context.height / 2 + (this.context.height / 2 - this.padding) * this.alignment.y;
  }

  protected doDraw(model: DebugMetrics) {
    const label = this._format.format(model);

    this.scope($ => {
      $.fill(this.textColor);
      $.textSize(this.textSize);
      $.textAlign(this.horizAlign, this.vertAlign);
      $.text(label, this.x, this.y);
    });
  }
}

export class DebugManager {
  private readonly _context: p5;
  private readonly _refreshRate: number;

  private _widget: DebugMetricsWidget | undefined;
  private _draw: (() => void) | undefined;

  private constructor(context: p5, options?: {
    refreshRate?: number,
  }) {
    this._context = context;
    this._refreshRate = options?.refreshRate ?? 10;
  }

  static attach(context: p5, options?: {
    refreshRate?: number,
  }): DebugManager {
    const manager = new DebugManager(context, options);
    manager.attach();
    return manager;
  }

  public get isAttached(): boolean {
    return this._draw != null;
  }

  public get isDetached(): boolean {
    return this._draw == null;
  }

  public get widget(): DebugMetricsWidget | undefined {
    return this._widget;
  }

  public also(mutate: (manager: DebugManager) => void): DebugManager {
    mutate(this);
    return this;
  }

  public attach() {
    if (this._draw) {
      return;
    }

    const context = this._context;
    const refreshRate = this._refreshRate;

    const draw = context.draw;
    const widget = new DebugMetricsWidget(context).also(it => {
      it.model = DebugMetrics.parse(context);
    });

    this._draw = draw;
    this._context.draw = function () {
      context.push();
      draw();
      context.pop();

      if (context.frameCount % refreshRate == 0) {
        widget.model = DebugMetrics.parse(context);
      }

      widget.draw();
    }
    this._widget = widget;
  }

  public detach() {
    if (!this._draw) {
      return;
    }

    this._widget = undefined;
    this._context.draw = this._draw;
    this._draw = undefined;
  }
}
