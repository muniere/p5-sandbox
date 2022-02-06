export class Spot {
  constructor(
    public row: number,
    public column: number,
  ) {
    // no-op
  }

  static of({row, column}: {
    row: number,
    column: number,
  }): Spot {
    return new Spot(row, column);
  }

  static dist(a: Spot, b: Spot): number {
    return Math.abs(a.row - b.row) + Math.abs(a.column - b.column);
  }
}
