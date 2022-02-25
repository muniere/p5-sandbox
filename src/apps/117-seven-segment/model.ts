import { Point, Size } from '../../lib/graphics2d';

export enum Orientation {
  horizontal,
  vertical,
}

export class SegmentModel {
  public readonly orientation: Orientation;
  public readonly origin: Point;
  public readonly length: number;
  public readonly weight: number;
  public readonly color: string;
  public on: boolean = false;

  constructor(nargs: {
    orientation: Orientation,
    origin: Point,
    length: number,
    weight: number,
    color: string,
  }) {
    this.orientation = nargs.orientation;
    this.origin = nargs.origin;
    this.length = nargs.length;
    this.weight = nargs.weight;
    this.color = nargs.color;
  }
}

export class DisplayModel {
  public readonly origin: Point;
  public readonly size: Size;
  public readonly weight: number;
  public readonly color: string;
  private readonly _segments: SegmentModel[];

  public constructor(nargs: {
    origin: Point,
    size: Size,
    weight: number,
    color: string,
  }) {
    const {origin, size, weight, color} = nargs;

    this.origin = origin;
    this.size = size;
    this.weight = weight;
    this.color = color;

    this._segments = [
      new SegmentModel({
        orientation: Orientation.horizontal,
        origin: Point.of({x: weight / 2, y: 0}),
        length: size.width - weight,
        weight: weight,
        color: color,
      }),
      new SegmentModel({
        orientation: Orientation.vertical,
        origin: Point.of({x: size.width - weight, y: weight / 2}),
        length: (size.height - weight) / 2,
        weight: weight,
        color: color,
      }),
      new SegmentModel({
        orientation: Orientation.vertical,
        origin: Point.of({x: size.width - weight, y: size.height / 2}),
        length: (size.height - weight) / 2,
        weight: weight,
        color: color,
      }),
      new SegmentModel({
        orientation: Orientation.horizontal,
        origin: Point.of({x: weight / 2, y: size.height - weight}),
        length: size.width - weight,
        weight: weight,
        color: color,
      }),
      new SegmentModel({
        orientation: Orientation.vertical,
        origin: Point.of({x: 0, y: size.height / 2}),
        length: (size.height - weight) / 2,
        weight: weight,
        color: color,
      }),
      new SegmentModel({
        orientation: Orientation.vertical,
        origin: Point.of({x: 0, y: weight / 2}),
        length: (size.height - weight) / 2,
        weight: weight,
        color: color,
      }),
      new SegmentModel({
        orientation: Orientation.horizontal,
        origin: Point.of({x: weight / 2, y: (size.height - weight) / 2}),
        length: size.width - weight,
        weight: weight,
        color: color,
      }),
    ];
  }

  get segments(): SegmentModel[] {
    return [...this._segments];
  }

  update(pattern: number) {
    for (let i = 1; i <= 7; i++) {
      const bit = pattern >> (7 - i) & 0x01;
      this._segments[i - 1].on = !!bit;
    }
  }
}

export module Patterns {
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
