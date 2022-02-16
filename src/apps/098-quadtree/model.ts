import { Point, Rect, Size } from '../../lib/graphics2d';
import { Acceleration, Force, Position, Velocity } from '../../lib/physics2d';

export enum MaterialTag {
  normal,
  focused,
}

export class MaterialState {
  public tag = MaterialTag.normal;
  public color: string = '#888888';

  private readonly _radius: number;
  private readonly _center: Position;
  private readonly _velocity: Velocity = Velocity.zero();

  constructor(
    radius: number,
    center: Position,
  ) {
    this._radius = radius;
    this._center = center;
  }

  static create({radius, center}: {
    radius: number,
    center: Position,
  }): MaterialState {
    return new MaterialState(radius, center);
  }

  get radius(): number {
    return this._radius;
  }

  get center(): Position {
    return this._center;
  }

  get top(): number {
    return this._center.y - this._radius;
  }

  get bottom(): number {
    return this._center.y + this._radius;
  }

  get left(): number {
    return this._center.x - this._radius;
  }

  get right(): number {
    return this._center.x + this._radius;
  }

  get zone(): Rect {
    return Rect.of({
      origin: Point.of({
        x: this.left - this.radius,
        y: this.top - this.radius,
      }),
      size: Size.square(this.radius * 4)
    });
  }

  applyForce(force: Force) {
    this._velocity.plusAssign(force.acceleration({mass: 1}));
  }

  coerceIn(bounds: Size) {
    if (this._center.x - this._radius <= 0 || bounds.width <= this._center.x + this._radius) {
      this._velocity.plusAssign(
        Acceleration.of({x: -this._velocity.x * 2, y: 0})
      );
    }
    if (this._center.y - this._radius <= 0 || bounds.height <= this._center.y + this._radius) {
      this._velocity.plusAssign(
        Acceleration.of({x: 0, y: -this._velocity.y * 2})
      )
    }
  }

  also(mutate: (state: MaterialState) => void): MaterialState {
    mutate(this);
    return this;
  }

  update() {
    this._center.plusAssign(this._velocity);
  }
}

export class DivisionState {
  private readonly _boundary: Rect;
  private readonly _capacity: number;
  private _materials: MaterialState[];
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

  get materials(): MaterialState[] {
    return [...this._materials];
  }

  push(material: MaterialState): boolean {
    if (!this._boundary.includes(Point.of(material.center))) {
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

  includes(position: Position): boolean {
    return this._boundary.includes(Point.of(position));
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

  push(material: MaterialState) {
    this._root.push(material);
  }

  collectDeeply({query}: { query?: Rect }): MaterialState[] {
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
        ? division.materials.filter(it => query.includes(Point.of(it.center)))
        : division.materials
    );
  }

  collectWidely({query}: { query?: Rect }): MaterialState[] {
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
        ? division.materials.filter(it => query.includes(Point.of(it.center)))
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
  private readonly _materials: MaterialState[];
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

  push(material: MaterialState) {
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
        .filter(it => Position.dist(it.center, material.center) < it.radius + material.radius);

      if (collisions.length == 0) {
        material.tag = MaterialTag.normal;
      } else {
        material.tag = MaterialTag.focused;
        collisions.forEach(it => it.tag = MaterialTag.focused);
      }
    });
  }
}
