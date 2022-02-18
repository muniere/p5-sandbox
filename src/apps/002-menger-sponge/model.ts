import { Point as Point3D } from '../../lib/graphics3d';

export class CubeModel {
  public color: string = '#FFFFFF';

  constructor(
    public size: number,
    public center: Point3D,
  ) {
    // no-op
  }

  static create({size, center}: {
    size: number,
    center: Point3D,
  }): CubeModel {
    return new CubeModel(size, center);
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

          const newSize = this.size / 3;
          const newCenter = this.center.plus({
            x: x * newSize,
            y: y * newSize,
            z: z * newSize,
          });

          const newCube = CubeModel.create({
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
  public rotation: number = 0;

  constructor(
    public cubes: CubeModel[],
  ) {
    // no-op
  }

  static create({size}: { size: number }): SpongeModel {
    const seed = CubeModel.create({
      size: size,
      center: Point3D.zero(),
    });

    return new SpongeModel([seed]);
  }

  get fillColor(): string {
    return this.cubes[0].color;
  }

  set fillColor(value: string) {
    this.cubes.forEach(it => it.color = value);
  }

  rotate(value: number) {
    this.rotation += value;
  }

  also(mutate: (sponge: SpongeModel) => void): SpongeModel {
    mutate(this);
    return this;
  }

  cycle() {
    this.cubes = this.cubes.reduce(
      (acc, box) => [...acc, ...box.spawn()], [] as CubeModel[]
    );
  }
}

export class ApplicationModel {
  private readonly _sponge: SpongeModel;

  constructor(
    sponge: SpongeModel,
  ) {
    this._sponge = sponge;
  }

  static create({size}: { size: number }): ApplicationModel {
    const sponge = SpongeModel.create({size});
    return new ApplicationModel(sponge);
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
    this._sponge.rotation += value;
  }
}
