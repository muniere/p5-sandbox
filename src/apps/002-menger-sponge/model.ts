import { Point as Point3D } from '../../lib/graphics3d';

export class CubeModel {
  public color: string = '#FFFFFF';

  private readonly _size: number;
  private readonly _center: Point3D;

  constructor(nargs: {
    size: number,
    center: Point3D,
  }) {
    this._size = nargs.size;
    this._center = nargs.center;
  }

  get size(): number {
    return this._size;
  }

  get center(): Point3D {
    return this._center;
  }

  spawn(): CubeModel[] {
    let cubes = [];

    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          const ones = [x, y, z].filter(it => Math.abs(it) > 0);
          if (ones.length < 2) {
            continue;
          }

          const newSize = this._size / 3;
          const newCenter = this._center.plus({
            x: x * newSize,
            y: y * newSize,
            z: z * newSize,
          });

          const newCube = new CubeModel({
            size: newSize,
            center: newCenter,
          });

          cubes.push(newCube);
        }
      }
    }

    return cubes;
  }
}

export class SpongeModel {
  public strokeColor: string = '#FFFFFF';

  private _cubes: CubeModel[];
  private _rotation: number;

  constructor(nargs: {
    size: number,
  }) {
    const seed = new CubeModel({
      size: nargs.size,
      center: Point3D.zero(),
    });
    this._cubes = [seed];
    this._rotation = 0;
  }

  get fillColor(): string {
    return this._cubes[0].color;
  }

  set fillColor(value: string) {
    this._cubes.forEach(it => it.color = value);
  }

  get cubes(): CubeModel[] {
    return [...this._cubes];
  }

  get rotation(): number {
    return this._rotation;
  }

  rotate(value: number) {
    this._rotation += value;
  }

  also(mutate: (sponge: SpongeModel) => void): SpongeModel {
    mutate(this);
    return this;
  }

  cycle() {
    this._cubes = this._cubes.reduce(
      (acc, box) => [...acc, ...box.spawn()], [] as CubeModel[]
    );
  }
}

export class ApplicationModel {
  private readonly _sponge: SpongeModel;

  constructor(nargs: {
    sponge: SpongeModel,
  }) {
    this._sponge = nargs.sponge;
  }

  also(mutate: (model: ApplicationModel) => void): ApplicationModel {
    mutate(this);
    return this;
  }

  get sponge(): SpongeModel {
    return this._sponge;
  }

  update() {
    this._sponge.cycle();
  }

  rotate(value: number) {
    this._sponge.rotate(value);
  }
}
