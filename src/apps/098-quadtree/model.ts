import { Point, Rect, Size } from '../../lib/graphics2d';
import { Acceleration, CircularMaterial, Velocity } from '../../lib/physics2d';

export enum BallTag {
  normal,
  focused,
}

export class BallState extends CircularMaterial {
  public tag = BallTag.normal;

  get zone(): Rect {
    return Rect.of({
      origin: Point.of({
        x: this.left - this.radius,
        y: this.top - this.radius,
      }),
      size: Size.square(this.radius * 4)
    });
  }
}

export class DivisionState {
  private readonly _boundary: Rect;
  private readonly _capacity: number;
  private _materials: BallState[];
  private _children: DivisionState[];

  constructor(
    boundary: Rect,
    capacity: number,
  ) {
    this._boundary = boundary;
    this._capacity = capacity;
    this._materials = [];
    this._children = [];
  }

  static of({boundary, capacity}: {
    boundary: Rect,
    capacity: number,
  }): DivisionState {
    return new DivisionState(boundary, capacity);
  }

  get boundary(): Rect {
    return this._boundary.copy();
  }

  get capacity(): number {
    return this._capacity;
  }

  get children(): DivisionState[] {
    return [...this._children];
  }

  get materials(): BallState[] {
    return [...this._materials];
  }

  push(material: BallState): boolean {
    if (!this._boundary.includes(material.center)) {
      return false;
    }

    if (this._children.length == 0 && this._materials.length < this._capacity) {
      this._materials.push(material);
      return true;
    }

    if (this._children.length == 0) {
      this.subdivide();

      this._materials.forEach(material => {
        this._children.find(it => it.includes(material.center))?.push(material);
      });

      this._materials = [];
    }

    this._children.find(it => it.includes(material.center))?.push(material);
    return true;
  }

  includes(point: Point): boolean {
    return this._boundary.includes(point);
  }

  clear(): void {
    this._materials = [];
    this._children = [];
  }

  private subdivide() {
    const origins = [
      Point.of({
        x: this._boundary.origin.x,
        y: this._boundary.origin.y,
      }),
      Point.of({
        x: this._boundary.center.x,
        y: this._boundary.origin.y,
      }),
      Point.of({
        x: this._boundary.origin.x,
        y: this._boundary.center.y,
      }),
      Point.of({
        x: this._boundary.center.x,
        y: this._boundary.center.y,
      }),
    ];

    this._children = origins.map(origin => {
      return DivisionState.of({
        boundary: Rect.of({
          origin: origin,
          size: this._boundary.size.times(0.5),
        }),
        capacity: this._capacity,
      });
    });
  }
}

export class TreeState {
  private readonly _root: DivisionState;

  constructor(
    root: DivisionState,
  ) {
    this._root = root;
  }

  static create({boundary, capacity}: {
    boundary: Rect
    capacity: number,
  }): TreeState {
    return new TreeState(DivisionState.of({boundary, capacity}));
  }

  get boundary(): Rect {
    return this._root.boundary;
  }

  get capacity(): number {
    return this._root.capacity;
  }

  push(material: BallState) {
    this._root.push(material);
  }

  collectDeeply({query}: { query?: Rect }): BallState[] {
    const stack = [this._root];
    const divisions = [] as DivisionState[];

    while (stack.length > 0) {
      const division = stack.pop()!;

      if (!!query && !division.boundary.intersects(query)) {
        continue;
      }

      const children = division.children;
      if (children.length > 0) {
        stack.push(...children.reversed());
      } else {
        divisions.push(division);
      }
    }

    return divisions.flatMap(
      division => query
        ? division.materials.filter(it => query.includes(it.center))
        : division.materials
    );
  }

  collectWidely({query}: { query?: Rect }): BallState[] {
    const queue = [this._root];
    const divisions = [] as DivisionState[];

    while (queue.length > 0) {
      const division = queue.shift()!;

      if (!!query && !division.boundary.intersects(query)) {
        continue;
      }

      const children = division.children;
      if (children.length > 0) {
        queue.push(...children);
      } else {
        divisions.push(division);
      }
    }

    return divisions.flatMap(
      division => query
        ? division.materials.filter(it => query.includes(it.center))
        : division.materials
    );
  }

  walkDeeply(callback: (division: DivisionState) => void) {
    const stack = [this._root];

    while (stack.length > 0) {
      const division = stack.pop()!;

      callback(division);

      stack.push(...division.children.reversed());
    }
  }

  walkWidely(callback: (division: DivisionState) => void) {
    const queue = [this._root];

    while (queue.length > 0) {
      const division = queue.shift()!;

      callback(division);

      queue.push(...division.children);
    }
  }

  clear() {
    this._root.clear();
  }
}

export class WorldState {
  private readonly _materials: BallState[];
  private readonly _tree: TreeState;

  constructor(
    boundary: Rect,
    capacity: number,
  ) {
    this._tree = TreeState.create({boundary, capacity});
    this._materials = [];
  }

  static create({boundary, capacity}: {
    boundary: Rect,
    capacity: number,
  }): WorldState {
    return new WorldState(boundary, capacity);
  }

  get tree(): TreeState {
    return this._tree;
  }

  push(material: BallState) {
    this._materials.push(material);
  }

  walk(callback: (division: DivisionState) => void) {
    this._tree.walkWidely(callback);
  }

  // how can we re-balance tree instead of rebuild??
  update() {
    const bounds = this._tree.boundary.size;

    this._tree.clear();

    this._materials.forEach(it => {
      it.update();
      it.coerceIn(bounds);
      this._tree.push(it);
    });

    this._materials.forEach(material => {
      const collisions = this._tree
        .collectDeeply({query: material.zone})
        .filter(it => it != material)
        .filter(it => it.intersects(material));

      if (collisions.length == 0) {
        material.tag = BallTag.normal;
      } else {
        material.tag = BallTag.focused;
        collisions.forEach(it => it.tag = BallTag.focused);
      }
    });
  }
}
