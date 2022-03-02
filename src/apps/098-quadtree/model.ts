import { Point, Rect, Size } from '../../lib/graphics2d';
import { CircularMaterial } from '../../lib/physics2d';

export enum VehicleTag {
  normal,
  focused,
}

export class VehicleModel extends CircularMaterial {
  public tag = VehicleTag.normal;

  get zone(): Rect {
    return new Rect({
      origin: new Point({
        x: this.left - this.radius,
        y: this.top - this.radius,
      }),
      size: Size.square(this.radius * 4)
    });
  }
}

export class DivisionModel {
  private readonly _boundary: Rect;
  private readonly _capacity: number;
  private _materials: VehicleModel[];
  private _children: DivisionModel[];

  constructor(nargs: {
    boundary: Rect,
    capacity: number,
  }) {
    this._boundary = nargs.boundary;
    this._capacity = nargs.capacity;
    this._materials = [];
    this._children = [];
  }

  get boundary(): Rect {
    return this._boundary.copy();
  }

  get capacity(): number {
    return this._capacity;
  }

  get children(): DivisionModel[] {
    return [...this._children];
  }

  get materials(): VehicleModel[] {
    return [...this._materials];
  }

  push(material: VehicleModel): boolean {
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
      new Point({
        x: this._boundary.origin.x,
        y: this._boundary.origin.y,
      }),
      new Point({
        x: this._boundary.center.x,
        y: this._boundary.origin.y,
      }),
      new Point({
        x: this._boundary.origin.x,
        y: this._boundary.center.y,
      }),
      new Point({
        x: this._boundary.center.x,
        y: this._boundary.center.y,
      }),
    ];

    this._children = origins.map(origin => {
      return new DivisionModel({
        boundary: new Rect({
          origin: origin,
          size: this._boundary.size.times(0.5),
        }),
        capacity: this._capacity,
      });
    });
  }
}

export class TreeModel {
  private readonly _root: DivisionModel;

  constructor(nargs: {
    root: DivisionModel,
  }) {
    this._root = nargs.root;
  }

  static create({boundary, capacity}: {
    boundary: Rect
    capacity: number,
  }): TreeModel {
    return new TreeModel({
      root: new DivisionModel({boundary, capacity})
    });
  }

  get boundary(): Rect {
    return this._root.boundary;
  }

  get capacity(): number {
    return this._root.capacity;
  }

  push(material: VehicleModel) {
    this._root.push(material);
  }

  collectDeeply({query}: { query?: Rect }): VehicleModel[] {
    const stack = [this._root];
    const divisions = [] as DivisionModel[];

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

  collectWidely({query}: { query?: Rect }): VehicleModel[] {
    const queue = [this._root];
    const divisions = [] as DivisionModel[];

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

  walkDeeply(callback: (division: DivisionModel) => void) {
    const stack = [this._root];

    while (stack.length > 0) {
      const division = stack.pop()!;

      callback(division);

      stack.push(...division.children.reversed());
    }
  }

  walkWidely(callback: (division: DivisionModel) => void) {
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

export class ApplicationModel {
  private readonly _materials: VehicleModel[];
  private readonly _tree: TreeModel;

  constructor(nargs: {
    boundary: Rect,
    capacity: number,
  }) {
    this._tree = TreeModel.create(nargs);
    this._materials = [];
  }

  get tree(): TreeModel {
    return this._tree;
  }

  push(material: VehicleModel) {
    this._materials.push(material);
  }

  walk(callback: (division: DivisionModel) => void) {
    this._tree.walkWidely(callback);
  }

  // how can we re-balance tree instead of rebuild??
  update() {
    const bounds = this._tree.boundary;

    this._tree.clear();

    this._materials.forEach(it => {
      it.update();
      it.bounceIn(bounds);
      this._tree.push(it);
    });

    this._materials.forEach(material => {
      const collisions = this._tree
        .collectDeeply({query: material.zone})
        .filter(it => it != material)
        .filter(it => it.intersects(material));

      if (collisions.length == 0) {
        material.tag = VehicleTag.normal;
      } else {
        material.tag = VehicleTag.focused;
        collisions.forEach(it => it.tag = VehicleTag.focused);
      }
    });
  }
}
