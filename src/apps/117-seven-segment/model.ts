import { Point, Size } from '../../lib/graphics2d';

export type Orientation = 'horizontal' | 'vertical';

export class SegmentState {
  public on: boolean = false;

  constructor(
    public orientation: Orientation,
    public origin: Point,
    public length: number,
    public weight: number,
    public color: string,
  ) {
    // no-op
  }

  static horizontal({origin, length, weight, color}: {
    origin: Point,
    length: number,
    weight: number,
    color: string,
  }): SegmentState {
    return new SegmentState('horizontal', origin, length, weight, color);
  }

  static vertical({origin, length, weight, color}: {
    origin: Point,
    length: number,
    weight: number,
    color: string,
  }): SegmentState {
    return new SegmentState('vertical', origin, length, weight, color);
  }
}

export class DisplayState {
  public readonly segments: SegmentState[];

  public constructor(
    public origin: Point,
    public size: Size,
    public weight: number,
    public color: string,
  ) {
    this.segments = [
      SegmentState.horizontal({
        origin: Point.of({x: weight / 2, y: 0}),
        length: size.width - weight,
        weight: weight,
        color: color,
      }),
      SegmentState.vertical({
        origin: Point.of({x: size.width - weight, y: weight / 2}),
        length: (size.height - weight) / 2,
        weight: weight,
        color: color,
      }),
      SegmentState.vertical({
        origin: Point.of({x: size.width - weight, y: size.height / 2}),
        length: (size.height - weight) / 2,
        weight: weight,
        color: color,
      }),
      SegmentState.horizontal({
        origin: Point.of({x: weight / 2, y: size.height - weight}),
        length: size.width - weight,
        weight: weight,
        color: color,
      }),
      SegmentState.vertical({
        origin: Point.of({x: 0, y: size.height / 2}),
        length: (size.height - weight) / 2,
        weight: weight,
        color: color,
      }),
      SegmentState.vertical({
        origin: Point.of({x: 0, y: weight / 2}),
        length: (size.height - weight) / 2,
        weight: weight,
        color: color,
      }),
      SegmentState.horizontal({
        origin: Point.of({x: weight / 2, y: (size.height - weight) / 2}),
        length: size.width - weight,
        weight: weight,
        color: color,
      }),
    ];
  }

  static create({origin, size, weight, color}: {
    origin: Point,
    size: Size,
    weight: number,
    color: string,
  }): DisplayState {
    return new DisplayState(origin, size, weight, color);
  }

  update(pattern: number) {
    for (let i = 1; i <= 7; i++) {
      const bit = pattern >> (7 - i) & 0x01;
      this.segments[i - 1].on = !!bit;
    }
  }
}

export namespace Patterns {
  const TABLE = new Map<string, number>([
    ['0', 0x7E],
    ['1', 0x30],
    ['2', 0x6D],
    ['3', 0x79],
    ['4', 0x33],
    ['5', 0x5B],
    ['6', 0x5F],
    ['7', 0x70],
    ['8', 0x7F],
    ['9', 0x7B],
    ['a', 0x77],
    ['b', 0x1F],
    ['c', 0x4E],
    ['d', 0x3D],
    ['e', 0x4F],
    ['f', 0x47],
  ]);

  export function get(key: string): number | undefined {
    return TABLE.get(key);
  }
}
