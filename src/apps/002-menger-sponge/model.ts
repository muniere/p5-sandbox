import { Point as Point3D } from '../../lib/graphics3d';

export class CubeState {
  public color: string = '#FFFFFF';

  constructor(
    public center: Point3D,
    public size: number,
  ) {
    // no-op
  }

  static create({center, side}: {
    center: Point3D,
    side: number,
  }): CubeState {
    return new CubeState(center, side);
  }

  spawn(): CubeState[] {
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

          const newBox = CubeState.create({
            center: newCenter,
            side: newSize,
          });

          cubes.push(newBox);
        }
      }
    }

    return cubes;
  }
}

export class SpongeState {
  public strokeColor: string = '#FFFFFF';
  public rotation: number = 0;

  constructor(
    public cubes: CubeState[],
  ) {
    // no-op
  }

  static create({size}: { size: number }): SpongeState {
    const seed = CubeState.create({
      center: Point3D.zero(),
      side: size,
    });

    return new SpongeState([seed]);
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

  also(mutate: (sponge: SpongeState) => void): SpongeState {
    mutate(this);
    return this;
  }

  cycle() {
    this.cubes = this.cubes.reduce(
      (acc, box) => [...acc, ...box.spawn()], [] as CubeState[]
    );
  }
}
