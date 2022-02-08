import { Vector } from 'p5';
import { Point } from '../../lib/graphics2d';

export class BranchState {
  private _children: BranchState[];

  constructor(
    public begin: Point,
    public end: Point,
  ) {
    this._children = [];
  }

  static create({begin, end}: {
    begin: Point,
    end: Point,
  }): BranchState {
    return new BranchState(begin, end);
  }

  get length(): number {
    return Point.dist(this.begin, this.end);
  }

  get children(): BranchState[] {
    return [...this._children];
  }

  get leaf(): boolean {
    return this._children.length == 0;
  }

  branch({angle, scale}: {angle: number, scale: number}) {
    if (this._children.length > 0) {
      throw new Error('branch can call only once')
    }

    const vec = new Vector().set(
      this.end.x - this.begin.x,
      this.end.y - this.begin.y,
    );

    const dir1 = vec.copy().mult(scale).rotate(-Math.abs(angle));
    const child1 = BranchState.create({
      begin: this.end.copy(),
      end: this.end.plus(dir1),
    });

    const dir2 = vec.copy().mult(scale).rotate(Math.abs(angle));
    const child2 = BranchState.create({
      begin: this.end.copy(),
      end: this.end.plus(dir2),
    });

    this._children = [child1, child2];
  }
}

export class TreeState {
  constructor(
    public readonly root: BranchState,
  ) {
    // no-op
  }

  static create({begin, end}: {
    begin: Point,
    end: Point,
  }): TreeState {
    return new TreeState(BranchState.create({begin, end}));
  }

  walk(callback: (branch: BranchState) => void) {
    const queue = [this.root];

    while (queue.length > 0) {
      const node = queue.shift()!;
      callback(node);
      queue.push(...node.children);
    }
  }

  branch({angle, scale}: {angle: number, scale: number}) {
    this.leaves().forEach(it => it.branch({angle, scale}));
  }

  leaves(): BranchState[] {
    if (this.root.leaf) {
      return [this.root];
    }

    const stack = [this.root];
    const leaves = [] as BranchState[];

    while (stack.length > 0) {
      const node = stack.pop()!;
      const children = node.children;
      leaves.push(...children.filter(it => it.leaf));
      stack.push(...children.reverse());
    }

    return leaves;
  }
}
