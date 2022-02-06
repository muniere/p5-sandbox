// https://www.youtube.com/watch?v=b3g4sn5ZSnM
import * as p5 from 'p5';
import { Point, Size, Rect } from '../../lib/graphics2d';

enum GameType {
  A,
  B,
  C,
}

const Params = Object.freeze({
  CANVAS_COLOR: '#222222',
  GAME_TYPE: GameType.C,
  ORIGIN_X: 50,
  ORIGIN_Y: 50,
  LABEL_COLOR: '#FFFFFF',
  LABEL_MARGIN: 10,
  AXIS_COLOR: '#FFFFFF',
  CHART_COLOR: '#22FF22',
  CHART_SCALE_X: 1,
  CHART_SCALE_Y: 1,
});

class Wallet {
  constructor(
    public amount: number,
  ) {
    // no-op
  }
}

interface Game {
  perform(): void
}

class GameFactory {

  static create({type, wallet}: {
    type: GameType,
    wallet: Wallet,
  }): Game {
    switch (type) {
      case GameType.A:
        return new GameA(wallet);
      case GameType.B:
        return new GameB(wallet);
      case GameType.C:
        return new GameC(wallet);
    }
  }
}

class GameA implements Game {
  private threshold = 0.52;

  constructor(
    private wallet: Wallet,
  ) {
    // no-op
  }

  static create(wallet: Wallet): GameA {
    return new GameA(wallet);
  }

  perform() {
    const subject = Math.random();
    const threshold = this.threshold;

    if (subject > threshold) {
      this.wallet.amount += 1;
    } else {
      this.wallet.amount -= 1;
    }
  }
}

class GameB implements Game {
  private thresholds = new Map<number, number>([
    [0, 0.99],
    [1, 0.15],
    [2, 0.15],
  ]);

  constructor(
    private wallet: Wallet,
  ) {
    // no-op
  }

  static create(wallet: Wallet): GameB {
    return new GameB(wallet);
  }

  perform() {
    const subject = Math.random();
    const rawValue = this.wallet.amount % 3;
    const remaining = rawValue >= 0 ? rawValue : rawValue + 3;
    const threshold = this.thresholds.get(remaining) ?? 0;

    if (subject > threshold) {
      this.wallet.amount += 1;
    } else {
      this.wallet.amount -= 1;
    }
  }
}

class GameC implements Game {
  private threshold = 0.50;

  constructor(
    private wallet: Wallet,
  ) {
    // no-op
  }

  static create(wallet: Wallet): GameC {
    return new GameC(wallet);
  }

  perform() {
    const subject = Math.random();
    const threshold = this.threshold;

    if (subject > threshold) {
      GameA.create(this.wallet).perform();
    } else {
      GameB.create(this.wallet).perform();
    }
  }
}

class Chart {
  public scaleX: number = 1;
  public scaleY: number = 1;
  public axisWeight: number = 1;
  public axisColor: string = '#FFFFFF';
  public pointRadius: number = 1;
  public pointColor: string = '#FFFFFF';
  public strokeWeight: number = 1;
  public strokeColor: string = '#FFFFFF';
  public maxLength: number = -1;

  constructor(
    public context: p5,
    public frame: Rect,
    public values: number[],
  ) {
    // no-op
  }

  static create({context, origin, size}: {
    context: p5,
    origin: Point,
    size: Size,
  }): Chart {
    return new Chart(context, Rect.of({origin, size}), []);
  }

  also(mutate: (chart: Chart) => void): Chart {
    mutate(this);
    return this;
  }

  push(value: number) {
    this.values.push(value);

    if (this.maxLength > 0 && this.values.length > this.maxLength) {
      this.values.shift();
    }
  }

  draw() {
    const base = Point.of({
      x: this.frame.origin.x,
      y: this.frame.origin.y + this.frame.size.height / 2,
    });

    const points = this.values.map(
      (value, i) => Point.of({
        x: base.x + i * this.scaleX,
        y: base.y - value * this.scaleY,
      })
    );

    this.context.push();

    // axis
    this.context.stroke(this.axisColor);
    this.context.strokeWeight(this.axisWeight);
    this.context.noFill();

    this.context.line(
      this.frame.left, this.frame.top,
      this.frame.left, this.frame.bottom
    );
    this.context.line(
      this.frame.left, base.y,
      this.frame.right, base.y,
    );

    // stroke
    this.context.stroke(this.strokeColor);
    this.context.strokeWeight(this.strokeWeight);
    this.context.noFill();

    this.context.beginShape();
    points.forEach(it => this.context.vertex(it.x, it.y));
    this.context.endShape();

    // points
    this.context.noStroke();
    this.context.fill(this.pointColor);
    points.forEach(it => this.context.circle(it.x, it.y, this.pointRadius * 2));

    this.context.pop();
  }
}

class Progress {
  private countFormat = Intl.NumberFormat([]);
  private currencyFormat = Intl.NumberFormat([], {
    style: 'currency',
    currency: 'USD',
  });

  public count: number = 0;
  public value: number = 0;

  public textSize: number = 20;
  public textColor: string = Params.LABEL_COLOR;

  constructor(
    public context: p5,
    public frame: Rect,
    public game: GameType,
  ) {
    // no-op
  }

  static create({context, origin, size, game}: {
    context: p5,
    origin: Point,
    size: Size,
    game: GameType,
  }): Progress {
    return new Progress(context, Rect.of({origin, size}), game);
  }

  draw() {
    this.context.push();
    this.context.noStroke();
    this.context.fill(this.textColor);
    this.context.textAlign(this.context.LEFT, this.context.TOP)
    this.context.textSize(this.textSize);
    this.context.text(
      this.format(),
      this.frame.left, this.frame.top,
      this.frame.right, this.frame.bottom,
    );
    this.context.pop();
  }

  private format(): string {
    return [
      `Game: ${GameType[this.game]}`,
      `Trial: ${this.countFormat.format(this.count)}`,
      `Amount: ${this.currencyFormat.format(this.value)}`,
    ].join('\n');
  }
}

function sketch(context: p5) {
  let wallet: Wallet;
  let game: Game;
  let chart: Chart;
  let progress: Progress;

  context.setup = function () {
    context.createCanvas(context.windowWidth, context.windowHeight);

    wallet = new Wallet(0);

    game = GameFactory.create({
      type: Params.GAME_TYPE,
      wallet: wallet,
    });

    chart = Chart.create({
      context: context,
      origin: Point.of({
        x: Params.ORIGIN_X,
        y: Params.ORIGIN_Y,
      }),
      size: Size.of({
        width: context.width - (Params.ORIGIN_X * 2),
        height: context.height - (Params.ORIGIN_Y * 2),
      }),
    }).also(it => {
      it.scaleX = Params.CHART_SCALE_X;
      it.scaleY = Params.CHART_SCALE_Y;
      it.axisColor = Params.AXIS_COLOR;
      it.pointColor = Params.CHART_COLOR;
      it.strokeColor = Params.CHART_COLOR;
      it.maxLength = it.frame.width / it.scaleX;
    });

    progress = Progress.create({
      context: context,
      origin: Point.of({
        x: Params.ORIGIN_X + Params.LABEL_MARGIN,
        y: Params.ORIGIN_Y + Params.LABEL_MARGIN,
      }),
      size: Size.of({
        width: context.width - Params.LABEL_MARGIN * 2,
        height: context.height - Params.LABEL_MARGIN * 2,
      }),
      game: Params.GAME_TYPE,
    })

    chart.push(wallet.amount);
  }

  context.draw = function () {
    // draw
    context.background(Params.CANVAS_COLOR);

    chart.draw();
    progress.draw();

    // update
    game.perform();
    chart.push(wallet.amount);
    progress.count += 1;
    progress.value = wallet.amount;
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
