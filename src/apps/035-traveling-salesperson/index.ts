// https://www.youtube.com/watch?v=BAejnwN4Ccw
import * as p5 from 'p5';
import { Generators } from '../../lib/stdlib';
import { Point, Size, Rect } from '../../lib/graphics2d';

const Params = Object.freeze({
  CANVAS_COLOR: '#222222',
  SHAPE_COLOR: '#FFFFFF',
  CANDIDATE_COLOR: '#FFFF22',
  CANDIDATE_WEIGHT: 5,
  ANSWER_COLOR: '#FF22FF',
  ANSWER_WEIGHT: 5,
  LABEL_MARGIN: 10,
  POINT_COUNT: 15,
  GROUP_SIZE: 10,
  MUTATION_RATE: 0.8,
  MUTATION_DEPTH: 5,
  GENERATION_LIMIT: 1200,
});

class Path {
  public color: string = Params.SHAPE_COLOR;
  public weight: number = 1;
  private _length: number = -1;

  constructor(
    public context: p5,
    public points: Point[],
  ) {
    // no-op
  }

  static create({context, points}: { context: p5, points: Point[] }): Path {
    return new Path(context, points);
  }

  measure(): number {
    if (this._length >= 0) {
      return this._length;
    }

    let length = 0
    for (let i = 1; i < this.points.length; i++) {
      length += Point.dist(this.points[i], this.points[i - 1]);
    }
    this._length = length;
    return length;
  }

  also(mutate: (path: Path) => void): Path {
    mutate(this);
    return this;
  }

  noise() {
    const i = Math.floor(Math.random() * this.points.length);
    const j = Math.floor(Math.random() * this.points.length);
    const tmp = this.points[i];
    this.points[i] = this.points[j];
    this.points[j] = tmp;
  }

  draw() {
    this.drawNodes();
    this.drawEdges();
  }

  private drawNodes() {
    this.context.push();

    this.context.stroke(this.color);
    this.context.fill(this.color);

    this.points.forEach(
      it => this.context.ellipse(it.x, it.y, 8)
    );

    this.context.pop();
  }

  private drawEdges() {
    this.context.push();

    this.context.stroke(this.color);
    this.context.strokeWeight(this.weight);
    this.context.noFill();

    this.context.beginShape();
    this.points.forEach(
      it => this.context.vertex(it.x, it.y)
    );
    this.context.endShape();

    this.context.pop();
  }
}

class PathFinder {
  public color: string = Params.SHAPE_COLOR;
  public weight: number = 1;

  private readonly _size: number;
  private readonly _indexer: Generator<number[]>;

  constructor(
    public readonly context: p5,
    public readonly points: Point[],
  ) {
    this.points = points.sort(
      (a, b) => Point.dist(a, Point.zero()) - Point.dist(b, Point.zero())
    );
    this._size = points.map((_, i) => i + 1).reduce((acc, n) => acc * n, 1);
    this._indexer = Generators.permutation(points.map((_, i) => i));
  }

  static create({context, points}: {
    context: p5,
    points: Point[],
  }): PathFinder {
    return new PathFinder(context, points);
  }

  also(mutate: (obj: PathFinder) => void): PathFinder {
    mutate(this);
    return this;
  }

  get size(): number {
    return this._size;
  }

  next(): Path | undefined {
    const result = this._indexer.next();
    if (result.done) {
      return undefined;
    }
    return Path.create({
      context: this.context,
      points: result.value.map(i => this.points[i])
    }).also(it => {
      it.color = this.color;
      it.weight = this.weight;
    });
  }
}

class Progress {
  private integerFormat = Intl.NumberFormat([]);
  private fractionFormat = Intl.NumberFormat([], {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });

  public current: number = 0;
  public textSize: number = 20;
  public textColor: string = Params.SHAPE_COLOR;

  constructor(
    public context: p5,
    public frame: Rect,
    public total: number,
  ) {
    // no-op
  }

  static create({context, origin, size, total}: {
    context: p5,
    origin: Point,
    size: Size,
    total: number,
  }): Progress {
    return new Progress(context, Rect.of({origin, size}), total);
  }

  increment(delta: number = 1) {
    this.current += delta;
  }

  decrement(delta: number = 1) {
    this.current -= delta;
  }

  draw() {
    this.context.push();
    this.context.noStroke();
    this.context.fill(this.textColor);
    this.context.textAlign(this.context.RIGHT, this.context.TOP)
    this.context.textSize(this.textSize);
    this.context.text(
      this.format(),
      this.frame.left, this.frame.top,
      this.frame.right, this.frame.bottom,
    );
    this.context.pop();
  }

  private format(): string {
    const currentLabel = this.integerFormat.format(this.current);
    const totalLabel = this.integerFormat.format(this.total);
    const percentLabel = this.fractionFormat.format(100 * this.current / this.total)

    return `${currentLabel} / ${totalLabel}\n(${percentLabel}%)`;
  }
}

abstract class Cross {
  abstract perform(a: Path, b: Path): Path
}

class CloneCross extends Cross {

  static create(): CloneCross {
    return new CloneCross();
  }

  perform(a: Path, b: Path): Path {
    return Path.create({
      context: a.context,
      points: [...a.points],
    });
  }
}

class JointCross extends Cross {

  static create(): JointCross {
    return new JointCross();
  }

  perform(a: Path, b: Path): Path {
    const i = Math.random() * a.points.length;
    const j = Math.random() * a.points.length;

    const start = Math.min(i, j);
    const end = Math.max(i, j);

    const head = a.points.slice(start, end);
    const tail = b.points.filter(it1 => head.findIndex(it2 => it1.equals(it2)) == -1);

    return Path.create({
      context: a.context,
      points: [...head, ...tail],
    });
  }
}

abstract class Mutation {
  abstract rate: number;

  abstract perform(path: Path): Path;
}

class NoiseMutation extends Mutation {

  constructor(
    public rate: number,
    public depth: number,
  ) {
    super();
  }

  static create({rate, depth}: {
    rate: number,
    depth: number,
  }): NoiseMutation {
    return new NoiseMutation(rate, depth);
  }

  perform(path: Path): Path {
    return path.also(it => {
      for (let i = 0; i < this.depth; i++) {
        it.noise();
      }
    });
  }
}

class Group {
  public generation: number = 1;

  constructor(
    public paths: Path[],
    public cross: Cross,
    public mutation: Mutation,
  ) {
    // no-op
  }

  static create({context, size, points, cross, mutation}: {
    context: p5,
    size: number
    points: Point[],
    cross: Cross,
    mutation: Mutation,
  }): Group {
    const paths = [...Array(size)].map(
      _ => Path.create({
        context: context,
        points: [...context.shuffle(points)],
      })
    );

    return new Group(paths, cross, mutation);
  }

  best(): Path {
    return [...this.paths].sort((a, b) => a.measure() - b.measure())[0];
  }

  cycle() {
    const sorted = [...this.paths].sort((a, b) => a.measure() - b.measure());
    const scores = sorted.map(it => 1 / (it.measure() + 1));
    const total = scores.reduce((acc, score) => acc + score);

    const densities = scores.map(it => it / total);
    const cumulative = [...densities];
    for (let i = 1; i < cumulative.length; i++) {
      cumulative[i] += cumulative[i - 1];
    }

    this.paths = sorted.map(_ => {
      const value1 = Math.random();
      const index1 = cumulative.findIndex(it => it >= value1);
      const parent1 = sorted[index1];

      const value2 = Math.random();
      const index2 = cumulative.findIndex(it => it >= value2);
      const parent2 = sorted[index2];

      const child = this.cross.perform(parent1, parent2);

      if (Math.random() > this.mutation.rate) {
        return this.mutation.perform(child);
      } else {
        return child;
      }
    });

    this.generation += 1;
  }
}

function sketchLexicographic(context: p5) {
  let finder: PathFinder;
  let progress: Progress;
  let answer: Path;

  context.setup = function () {
    context.createCanvas(context.windowWidth, context.windowHeight);

    finder = PathFinder.create({
      context: context,
      points: [...Array(Params.POINT_COUNT)].map(
        _ => Point.of({
          x: Math.random() * context.width,
          y: Math.random() * context.height,
        })
      )
    });

    progress = Progress.create({
      context: context,
      origin: Point.of({
        x: Params.LABEL_MARGIN,
        y: Params.LABEL_MARGIN,
      }),
      size: Size.of({
        width: context.width - Params.LABEL_MARGIN * 2,
        height: context.height - Params.LABEL_MARGIN * 2,
      }),
      total: finder.size,
    });
  }

  context.draw = function () {
    // find
    const working = finder.next();

    progress.increment(working ? 1 : 0);

    // draw
    context.background(Params.CANVAS_COLOR);

    if (!working) {
      answer.color = Params.ANSWER_COLOR;
      answer.weight = Params.ANSWER_WEIGHT;
    }

    working?.draw();
    answer?.draw();
    progress.draw();

    // update
    if (!working) {
      context.noLoop();
      return;
    }

    if (!answer) {
      answer = working.also(it => {
        it.color = Params.CANDIDATE_COLOR;
        it.weight = Params.CANDIDATE_WEIGHT;
      });
      return;
    }

    if (working.measure() >= answer.measure()) {
      return;
    }

    answer = working.also(it => {
      it.color = Params.CANDIDATE_COLOR;
      it.weight = Params.CANDIDATE_WEIGHT;
    });
  }
}

function sketchGenetic(context: p5) {
  let group: Group;
  let answer: Path;

  context.setup = function () {
    context.createCanvas(context.windowWidth, context.windowHeight);

    group = Group.create({
      context: context,
      size: Params.GROUP_SIZE,
      points: [...Array(Params.POINT_COUNT)].map(
        _ => Point.of({
          x: Math.random() * context.width,
          y: Math.random() * context.height,
        })
      ),
      cross: JointCross.create(),
      mutation: NoiseMutation.create({
        rate: Params.MUTATION_RATE,
        depth: Params.MUTATION_DEPTH,
      })
    });
  }

  context.draw = function () {
    // draw
    context.background(Params.CANVAS_COLOR);

    if (group.generation >= Params.GENERATION_LIMIT) {
      answer.color = Params.ANSWER_COLOR;
      answer.weight = Params.ANSWER_WEIGHT;
      answer.draw();
      context.noLoop();
      return;
    }

    group.paths.forEach(it => it.draw());
    answer?.draw();

    // update
    const working = group.best();

    if (!answer) {
      answer = working.also(it => {
        it.color = Params.CANDIDATE_COLOR;
        it.weight = Params.CANDIDATE_WEIGHT;
      });
      group.cycle();
      return;
    }

    if (working.measure() >= answer.measure()) {
      group.cycle();
      return;
    }

    answer = working.also(it => {
      it.color = Params.CANDIDATE_COLOR;
      it.weight = Params.CANDIDATE_WEIGHT;
    });
    group.cycle();
  }
}

export { sketchGenetic as sketch };
