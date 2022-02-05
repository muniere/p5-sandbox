// https://www.youtube.com/watch?v=FWSR_7kZuYg
import * as p5 from 'p5';

const Params = Object.freeze({
  CANVAS_COLOR: '#222222',
  ALIVE_COLOR: '#000000',
  DEAD_COLOR: '#FFFFFF',
  STROKE_COLOR: '#888888',
  WORLD_SPEED: 2,
  WORLD_SIZE: 20,
  SEED_RATE: 0.2,
});

enum State {
  alive,
  dead,
}

class Coordinate {
  constructor(
    public row: number,
    public column: number,
  ) {
    // no-op
  }

  static of({row, column}: {
    row: number,
    column: number,
  }): Coordinate {
    return new Coordinate(row, column);
  }
}

class World {
  private readonly states: State[][];

  constructor(
    public readonly width: number,
    public readonly height: number,
    factory?: (coord: Coordinate) => State
  ) {
    this.states = [...Array(height)].map(
      (_, row) => [...Array(width)].map(
        (_, column) => factory ? factory(Coordinate.of({row, column})) : State.dead,
      )
    );
  }

  static create({width, height, factory}: {
    width: number,
    height: number,
    factory?: (coord: Coordinate) => State,
  }) : World {
    return new World(width, height, factory);
  }

  walk(callback: (state: State, coord: Coordinate) => void) {
    for (let row = 0; row < this.height; row++) {
      for (let column = 0; column < this.width; column++) {
        callback(this.states[row][column], Coordinate.of({row, column}));
      }
    }
  }

  cycle(): World {
    return World.create({
      width: this.width,
      height: this.height,
      factory: (coord: Coordinate) => this.next(coord),
    });
  }

  private next({row, column}: {
    row: number,
    column: number,
  }): State {
    const current = this.get({row, column});

    // noinspection PointlessArithmeticExpressionJS
    const neighbors = [
      this.get({row: row - 1, column: column - 1}),
      this.get({row: row - 1, column: column + 0}),
      this.get({row: row - 1, column: column + 1}),
      this.get({row: row + 0, column: column - 1}),
      this.get({row: row + 0, column: column + 1}),
      this.get({row: row + 1, column: column - 1}),
      this.get({row: row + 1, column: column + 0}),
      this.get({row: row + 1, column: column + 1}),
    ].filter(it => it != undefined) as State[];

    const density = neighbors.filter(it => it == State.alive).length;

    switch (current) {
      case State.alive:
        if (2 <= density && density <= 3) {
          return State.alive;
        } else {
          return State.dead;
        }
      case State.dead:
        if (density == 3) {
          return State.alive;
        } else {
          return State.dead;
        }
      default:
        throw new Error();
    }
  }

  private get({row, column}: {
    row: number,
    column: number,
  }): State | undefined {
    if (row < 0 || this.height <= row) {
      return undefined;
    }
    if (column < 0 || this.width <= column) {
      return undefined;
    }
    return this.states[row][column];
  }
}

class Point {
  constructor(
    public x: number,
    public y: number,
  ) {
    // no-op
  }

  static zero(): Point {
    return new Point(0, 0);
  }

  static of({x, y}: {
    x: number,
    y: number,
  }): Point {
    return new Point(x, y);
  };
}

class Size {
  constructor(
    public width: number,
    public height: number,
  ) {
    // no-op
  }

  static square(size: number): Size {
    return new Size(size, size);
  }

  static of({width, height}: {
    width: number,
    height: number,
  }): Size {
    return new Size(width, height);
  }
}

class Rect {
  constructor(
    public origin: Point,
    public size: Size,
  ) {
    // no-op
  }

  static of({origin, size}: {
    origin: Point,
    size: Size,
  }): Rect {
    return new Rect(origin, size);
  }

  get top(): number {
    return this.origin.y;
  }

  get left(): number {
    return this.origin.x;
  }

  get right(): number {
    return this.origin.x + this.size.width;
  }

  get bottom(): number {
    return this.origin.y + this.size.height;
  }

  get width(): number {
    return this.size.width;
  }

  get height(): number {
    return this.size.height;
  }
}

class WorldView {
  public aliveColor: string = Params.ALIVE_COLOR;
  public deadColor: string = Params.DEAD_COLOR;
  public strokeColor: string = Params.STROKE_COLOR;
  public model?: World;

  constructor(
    public context: p5,
    public frame: Rect,
  ) {
    // no-op
  }

  static create({context, origin, size}: {
    context: p5,
    origin: Point,
    size: Size,
  }) : WorldView {
    return new WorldView(context, Rect.of({origin, size}));
  }

  draw() {
    if (!this.model) {
      return;
    }

    const cellSize = Size.of({
      width: this.frame.width / this.model.width,
      height: this.frame.height / this.model.height,
    });

    this.context.push();

    this.model.walk((state: State, coord: Coordinate) => {
      const origin = Point.of({
        x: this.frame.origin.x + coord.column * cellSize.width,
        y: this.frame.origin.y + coord.row * cellSize.height,
      });

      const strokeColor = this.strokeColor;

      const fillColor = (() => {
        switch (state) {
          case State.alive:
            return this.aliveColor;
          case State.dead:
            return this.deadColor;
        }
      })();

      this.context.stroke(strokeColor);
      this.context.fill(fillColor);
      this.context.rect(origin.x, origin.y, cellSize.width, cellSize.height);
    })

    this.context.pop();
  }
}

function sketch(context: p5) {
  let model: World;
  let view: WorldView;

  context.setup = function () {
    context.createCanvas(context.windowWidth, context.windowHeight);
    context.frameRate(Params.WORLD_SPEED);
    context.noLoop();

    model = World.create({
      width: Params.WORLD_SIZE,
      height: Params.WORLD_SIZE,
      factory: _ => Math.random() < Params.SEED_RATE ? State.alive : State.dead,
    });

    view = WorldView.create({
      context: context,
      origin: Point.zero(),
      size: Size.square(
        Math.min(context.width, context.height)
      ),
    });

    view.model = model;
  }

  context.draw = function () {
    // draw
    context.background(Params.CANVAS_COLOR);
    view.draw();

    // update
    model = model.cycle();
    view.model = model;
  }

  context.mouseClicked = function () {
    if (context.isLooping()) {
      context.noLoop();
    } else {
      context.loop();
    }
  }
}

export { sketch };
