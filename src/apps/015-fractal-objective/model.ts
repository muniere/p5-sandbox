import { Vector } from 'p5';
import { Point } from '../../lib/graphics2d';

export class BranchModel {
  private readonly _begin: Point;
  private readonly _end: Point;
  private readonly _children: BranchModel[];

  constructor(nargs: {
    begin: Point,
    end: Point,
  }) {
    this._begin = nargs.begin;
    this._end = nargs.end;
    this._children = [];
  }

  get begin(): Point {
    return this._begin;
  }

  get end(): Point {
    return this._end;
  }

  get length(): number {
    return Point.dist(this._begin, this._end);
  }

  get children(): BranchModel[] {
    return [...this._children];
  }

  get isLeaf(): boolean {
    return this._children.length == 0;
  }

  branch({angle, scale}: {
    angle: number,
    scale: number,
  }) {
    if (this._children.length > 0) {
      throw new Error('branch can call only once')
    }

    const vec = new Vector().set(
      this._end.x - this._begin.x,
      this._end.y - this._begin.y,
    );

    const dir1 = vec.copy().mult(scale).rotate(-Math.abs(angle));
    const child1 = new BranchModel({
      begin: this._end.copy(),
      end: this._end.plus(dir1),
    });

    const dir2 = vec.copy().mult(scale).rotate(Math.abs(angle));
    const child2 = new BranchModel({
      begin: this._end.copy(),
      end: this._end.plus(dir2),
    });

    this._children.push(child1, child2);
  }
}

export class TreeModel {
  private readonly _root: BranchModel;

  constructor(nargs: {
    root: BranchModel,
  }) {
    this._root = nargs.root;
  }

  walk(callback: (branch: BranchModel) => void) {
    const queue = [this._root];

    while (queue.length > 0) {
      const node = queue.shift()!;
      callback(node);
      queue.push(...node.children);
    }
  }

  branch(nargs: { angle: number, scale: number }) {
    this.leaves().forEach(it => it.branch(nargs));
  }

  leaves(): BranchModel[] {
    if (this._root.isLeaf) {
      return [this._root];
    }

    const stack = [this._root];
    const leaves = [] as BranchModel[];

    while (stack.length > 0) {
      const node = stack.pop()!;
      const children = node.children;
      leaves.push(...children.filter(it => it.isLeaf));
      stack.push(...children.reverse());
    }

    return leaves;
  }
}
