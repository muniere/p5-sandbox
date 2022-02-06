export class NumericRange {
  constructor(
    public readonly start: number,
    public readonly stop: number,
  ) {
    // no-op
  }

  static of({start, stop}: {
    start: number,
    stop: number,
  }): NumericRange {
    return new NumericRange(start, stop);
  }
}

export class NumericMap {
  constructor(
    public readonly domain: NumericRange,
    public readonly target: NumericRange,
  ) {
    // no-op
  }

  static of({domain, target}: {
    domain: NumericRange,
    target: NumericRange,
  }): NumericMap {
    return new NumericMap(domain, target);
  }

  apply(x: number): number {
    const percent = (x - this.domain.start) / Math.abs(this.domain.stop - this.domain.start);
    const scaled = percent * Math.abs(this.target.stop - this.target.start);
    return scaled + this.target.start;
  }
}

export namespace Numeric {

  export function range(start: number, stop: number): NumericRange {
    return new NumericRange(start, stop);
  }

  export function map({value, domain, target}: {
    value: number,
    domain: NumericRange,
    target: NumericRange,
  }): number {
    return NumericMap.of({domain, target}).apply(value);
  }
}
