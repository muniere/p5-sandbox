// https://www.youtube.com/watch?v=GTWrWM1UsnA
import * as p5 from 'p5';
import { Spot } from '../../lib/dmath';
import { Point, Size } from '../../lib/graphics2d';

const Params = Object.freeze({
  CANVAS_COLOR: '#FFFFFF',
  THINKING_TIME: 500,
});

enum State {
  circle,
  cross,
  empty,
}

class Cell {

  constructor(
    public context: p5,
    public origin: Point,
    public size: Size,
    public spot: Spot,
    public state: State = State.empty
  ) {
    //
  }

  static empty({context, origin, size, spot}: {
    context: p5,
    origin: Point,
    size: Size,
    spot: Spot,
  }): Cell {
    return new Cell(context, origin, size, spot);
  }

  get top(): number {
    return this.origin.y;
  }

  get bottom(): number {
    return this.origin.y + this.size.height;
  }

  get left(): number {
    return this.origin.x;
  }

  get right(): number {
    return this.origin.x + this.size.width;
  }

  get center(): Point {
    return Point.of({
      x: this.origin.x + this.size.width / 2,
      y: this.origin.y + this.size.height / 2
    });
  }

  draw() {
    this.context.push();

    const diameter = Math.min(this.size.width, this.size.height) * 0.4;
    const center = this.center;

    switch (this.state) {
      case State.circle:
        this.context.circle(center.x, center.y, diameter);
        break;

      case State.cross:
        this.context.line(
          center.x - diameter / 2,
          center.y - diameter / 2,
          center.x + diameter / 2,
          center.y + diameter / 2,
        )
        this.context.line(
          center.x - diameter / 2,
          center.y + diameter / 2,
          center.x + diameter / 2,
          center.y - diameter / 2,
        )
        break;

      case State.empty:
        break;
    }

    this.context.pop();
  }
}

class Line {

  constructor(
    public cells: Cell[],
  ) {
    // no-op
  }

  static of(cells: Cell[]): Line {
    return new Line(cells);
  }

  test(): boolean {
    const state = this.cells[0].state;
    if (state == State.empty) {
      return false;
    }
    return this.cells.every(it => it.state == state);
  }
}

class Board {
  private readonly cells: Cell[];

  constructor(
    public context: p5,
    public origin: Point,
    public size: Size,
    public scale: number = 3,
  ) {
    const itemSize = Size.of({
      width: size.width / scale,
      height: size.height / scale,
    });

    this.cells = [...Array(scale * scale)].map((_, i) => {
      const column = Math.floor(i % scale);
      const row = Math.floor(i / scale);

      const itemOrigin = Point.of({
        x: origin.x + itemSize.width * column,
        y: origin.y + itemSize.height * row,
      });
      const itemSpot = Spot.of({
        column: column,
        row: row,
      });

      return Cell.empty({
        context: context,
        origin: itemOrigin,
        size: itemSize,
        spot: itemSpot,
      });
    });
  }

  static create({context, origin, size, scale}: {
    context: p5,
    origin: Point,
    size: Size,
    scale?: number
  }): Board {
    return new Board(context, origin, size, scale ?? 3);
  }

  get top(): number {
    return this.origin.y;
  }

  get bottom(): number {
    return this.origin.y + this.size.height;
  }

  get left(): number {
    return this.origin.x;
  }

  get right(): number {
    return this.origin.x + this.size.width;
  }

  collectEmpty(): Cell[] {
    return this.cells.filter(it => it.state == State.empty);
  }

  collectLines(): Line[] {
    const horizons = [...Array(this.scale)].map(
      (_, row) => Line.of(this.cells.filter(it => it.spot.row == row))
    );
    const verticals = [...Array(this.scale)].map(
      (_, column) => Line.of(this.cells.filter(it => it.spot.column == column))
    );
    const diagonals = [
      Line.of(this.cells.filter(it => it.spot.row == it.spot.column)),
      Line.of(this.cells.filter(it => it.spot.row + it.spot.column == this.scale - 1))
    ];

    return [...horizons, ...verticals, ...diagonals];
  }

  getSpot({x, y}: {
    x: number,
    y: number,
  }): Spot | undefined {
    const itemWidth = this.size.width / this.scale;
    const column = x == 0 ? 0 : Math.floor(x / itemWidth);
    if (column < 0 || this.scale <= column) {
      return undefined;
    }
    const itemHeight = this.size.height / this.scale;
    const row = y == 0 ? 0 : Math.floor(y / itemHeight);
    if (row < 0 || this.scale <= row) {
      return undefined;
    }

    return Spot.of({column, row});
  }

  getState({column, row}: {
    column: number,
    row: number,
  }): State | undefined {
    return this.cells[this.index({column, row})].state;
  }

  setState({column, row, state}: {
    column: number,
    row: number,
    state: State,
  }) {
    this.cells[this.index({column, row})].state = state;
  }

  index({column, row}: {
    column: number,
    row: number,
  }): number {
    return row * this.scale + column;
  }

  draw() {
    for (let i = 1; i < this.scale; i++) {
      const x = Math.floor(this.size.width / this.scale) * i;
      this.context.line(x, this.top, x, this.bottom);
    }

    for (let i = 1; i < this.scale; i++) {
      const y = Math.floor(this.size.height / this.scale) * i;
      this.context.line(this.left, y, this.right, y);
    }

    this.cells.forEach(
      item => item.draw()
    );
  }
}

enum Player {
  human,
  robot,
}

class Layer {
  public text: string | undefined;
  public textColor: string = '#000000';
  public fillColor: string = '#FFFFFF80';

  constructor(
    public context: p5,
    public origin: Point,
    public size: Size,
  ) {
    // no-op
  }

  static create({context, origin, size}: {
    context: p5,
    origin: Point,
    size: Size,
  }): Layer {
    return new Layer(context, origin, size);
  }

  draw() {
    this.context.push();
    this.context.fill(this.fillColor)
    this.context.noStroke();
    this.context.rect(this.origin.x, this.origin.y, this.size.width, this.size.height);
    this.context.pop();

    if (!this.text) {
      return;
    }

    this.context.push();
    this.context.textSize(32);
    this.context.textAlign(this.context.CENTER, this.context.CENTER);
    this.context.text(this.text, this.origin.x + this.size.width / 2, this.origin.y + this.size.height / 2);
    this.context.pop();
  }
}

abstract class Result {

  static fixed({winner, looser}: {
    winner: Player,
    looser: Player,
  }): Result {
    return Fixed.create({winner, looser});
  }

  static draw(): Result {
    return Draw.create();
  }
}

class Draw extends Result {

  static create(): Draw {
    return new Draw();
  }
}

class Fixed extends Result {

  constructor(
    public winner: Player,
    public looser: Player,
  ) {
    super();
    // no-op
  }

  static create({winner, looser}: {
    winner: Player,
    looser: Player,
  }): Fixed {
    return new Fixed(winner, looser);
  }
}

class Manager {
  private board: Board;
  private overlay: Layer;
  private result: Result | undefined;
  private player: Player = Player.human;

  constructor(
    context: p5,
    origin: Point,
    size: Size,
  ) {
    this.board = Board.create({
      context: context,
      origin: origin,
      size: size,
    });
    this.overlay = Layer.create({
      context: context,
      origin: origin,
      size: size,
    });
  }

  static create({context, origin, size}: {
    context: p5,
    origin: Point,
    size: Size,
  }): Manager {
    return new Manager(context, origin, size);
  }

  get canAdvance(): boolean {
    return !this.result;
  }

  onClick({x, y}: {
    x: number,
    y: number,
  }): boolean {
    if (this.result) {
      return false;
    }
    if (this.player != Player.human) {
      return false;
    }

    const spot = this.board.getSpot({x, y});
    if (!spot) {
      return false;
    }

    const marked = this.mark(spot);
    if (!marked) {
      return false;
    }

    this.judge();
    return true;
  }

  cycle() {
    const cells = this.board.collectEmpty();
    if (cells.length == 0) {
      return;
    }

    const cell = cells[Math.floor(cells.length * Math.random())];
    const marked = this.mark(cell.spot);
    if (!marked) {
      return;
    }

    this.judge();
    return;
  }

  private mark({column, row}: {
    column: number,
    row: number,
  }): boolean {
    const state = this.board.getState({column, row});
    if (state == State.circle || state == State.cross) {
      return false;
    }

    switch (this.player) {
      case Player.human:
        this.board.setState({column, row, state: State.circle});
        this.player = Player.robot;
        break;
      case Player.robot:
        this.board.setState({column, row, state: State.cross});
        this.player = Player.human;
        break;
    }
    return true;
  }

  private judge() {
    const lines = this.board.collectLines();
    const line = lines.find(it => it.test());
    if (!line) {
      if (this.board.collectEmpty().length == 0) {
        this.result = Result.draw();
      } else {
        // not fixed yet
      }
      return;
    }

    switch (line.cells[0].state) {
      case State.circle:
        this.result = Result.fixed({
          winner: Player.human,
          looser: Player.robot,
        });
        break;
      case State.cross:
        this.result = Result.fixed({
          winner: Player.robot,
          looser: Player.human,
        });
        break;
      case State.empty:
        break;
    }
  }

  private label(): string | undefined {
    if (this.result instanceof Fixed) {
      switch (this.result.winner) {
        case Player.human:
          return 'You WON !!';
        case Player.robot:
          return 'CPU Won !!';
      }
    }
    if (this.result instanceof Draw) {
      return 'DRAW !!';
    }
    return undefined;
  }

  draw() {
    this.board.draw();

    const text = this.label();
    if (!text) {
      return;
    }

    this.overlay.text = text
    this.overlay.draw();
  }
}

function sketch(context: p5) {
  let manager: Manager;

  context.setup = function () {
    const canvasSize = Math.min(context.windowWidth, context.windowHeight);
    context.createCanvas(canvasSize, canvasSize);
    context.noLoop();

    manager = Manager.create({
      context: context,
      origin: Point.zero(),
      size: Size.of({
        width: canvasSize,
        height: canvasSize,
      }),
    });
  }

  context.draw = function () {
    context.background(Params.CANVAS_COLOR);

    manager.draw();
  }

  context.mousePressed = function () {
    const advanced = manager.onClick({
      x: context.mouseX,
      y: context.mouseY,
    });
    if (!advanced) {
      return;
    }

    context.redraw();

    if (!manager.canAdvance) {
      return;
    }

    setTimeout(() => {
      manager.cycle();
      context.redraw();
    }, Params.THINKING_TIME);
  }
}

export { sketch } ;
