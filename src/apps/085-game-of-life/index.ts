// https://www.youtube.com/watch?v=FWSR_7kZuYg
import * as p5 from 'p5';
import { Spot } from '../../lib/dmath';
import { Point, Size, Rect } from '../../lib/graphics2d';

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

class World {
  private readonly states: State[][];

  constructor(
    public readonly width: number,
    public readonly height: number,
    factory?: (coord: Spot) => State
  ) {
    this.states = [...Array(height)].map(
      (_, row) => [...Array(width)].map(
        (_, column) => factory ? factory(Spot.of({row, column})) : State.dead,
      )
    );
  }

  static create({width, height, factory}: {
    width: number,
    height: number,
    factory?: (coord: Spot) => State,
  }) : World {
    return new World(width, height, factory);
  }

  walk(callback: (state: State, coord: Spot) => void) {
    for (let row = 0; row < this.height; row++) {
      for (let column = 0; column < this.width; column++) {
        callback(this.states[row][column], Spot.of({row, column}));
      }
    }
  }

  cycle(): World {
    return World.create({
      width: this.width,
      height: this.height,
      factory: (coord: Spot) => this.next(coord),
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

    this.model.walk((state: State, spot: Spot) => {
      const origin = Point.of({
        x: this.frame.origin.x + spot.column * cellSize.width,
        y: this.frame.origin.y + spot.row * cellSize.height,
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
